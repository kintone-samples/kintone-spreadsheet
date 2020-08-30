import React, { useEffect, useRef, useCallback } from 'react';
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { useAsync } from 'react-use';
import { Record } from '@kintone/rest-api-client/lib/client/types';
import '@kintone/rest-api-client/lib/client/types/app/properties';
import { Config } from '~/src/js/config';
import { client } from '~/src/js/utils/client';
import { useRecursiveTimeout } from '~/src/js/utils/utils';

type Props = {
  saveAfterChange: Handsontable.Hooks.Events['afterChange'];
  beforeRemoveRow: Handsontable.Hooks.Events['beforeRemoveRow'];
  colHeaders: Handsontable.GridSettings['colHeaders'];
  columns: Handsontable.GridSettings['columns'];
  dataSchema: Handsontable.GridSettings['dataSchema'];
  data: Handsontable.GridSettings['data'];
  hotRef: React.RefObject<HotTable>;
};

const ARRAY_FIELDS = [
  'CHECK_BOX',
  'MULTI_SELECT',
  'FILE',
  'USER_SELECT',
  'CATEGORY',
  'SUBTABLE',
  'ORGANIZATION_SELECT',
  'GROUP_SELECT',
];
const NOT_ALLOWED_EDIT_FIELDS = [
  'RECORD_NUMBER',
  'CREATED_TIME',
  'UPDATED_TIME',
  'CREATOR',
  'MODIFIER',
  'STATUS',
  'STATUS_ASSIGNEE',
  'CALC',
  'CHECK_BOX',
  'MULTI_SELECT',
  'FILE',
  'CATEGORY',
  'SUBTABLE',
  'ORGANIZATION_SELECT',
  'GROUP_SELECT',
];

const excludeNonEditableFields = (record: Record) =>
  Object.fromEntries(Object.entries(record).filter(([, v]) => NOT_ALLOWED_EDIT_FIELDS.indexOf(v.type) === -1));

const shapingRecord = (record: Record) =>
  Object.fromEntries(
    Object.entries(record).map(([k, v]) => [
      k,
      { ...v, value: v.type === 'NUMBER' ? v.value.replace(/[^0-9]/g, '') : v.value },
    ]),
  );

const getColumnData = async (config: Config) => {
  const resp = await client.app.getFormFields({ app: kintone.app.getId() || '' });
  // ヘッダーの取得
  const colHeaders = config.columns.map(({ code }) => {
    return resp.properties[code].label;
  });

  // 各セルの設定
  const columnDatas: Handsontable.ColumnSettings[] = config.columns.map(({ code }) => {
    const columnData: Handsontable.ColumnSettings = { data: `${code}.value` };

    // if type is DROP_DOWN, add type and source property
    if (resp.properties[code].type === 'DROP_DOWN' || resp.properties[code].type === 'RADIO_BUTTON') {
      columnData.type = 'dropdown';
      // FIXME: Type error.
      columnData.source = Object.keys((resp.properties[code] as any).options);
    }

    // if type is DROP_DOWN, add type and source property
    if (resp.properties[code].type === 'DROP_DOWN') {
      columnData.type = 'dropdown';
      // FIXME: Type error.
      columnData.source = Object.keys((resp.properties[code] as any).options);
    }

    if (resp.properties[code].type === 'USER_SELECT') {
      columnData.renderer = userSelectRenderer;
    }

    if (resp.properties[code].type === 'CHECK_BOX') {
      columnData.renderer = checkboxRenderer;
    }

    // set read only
    if (NOT_ALLOWED_EDIT_FIELDS.indexOf(resp.properties[code].type) !== -1) {
      columnData.readOnly = true;
    }
    return columnData;
  });

  // データスキーマの作成
  const dataSchema: Handsontable.RowObject = config.columns.reduce((prev, { code }) => {
    return {
      ...prev,
      [code]: { type: resp.properties[code].type, value: (resp.properties[code] as any).defaultValue },
    };
  }, {});

  return { colHeaders, columnDatas, dataSchema };
};

const userSelectRenderer: Handsontable.renderers.Base = (instance, td, row, col, prop, value) => {
  if (!value) return td;
  td.innerText = value.map((v) => v.name).join(', ');
  td.style.color = '#777';
  return td;
};

const checkboxRenderer: Handsontable.renderers.Checkbox = (instance, td, row, col, prop, value) => {
  if (!value.length) return td;
  td.innerText = value.join(', ');
  td.style.color = '#777';
  return td;
};

export const useSpreadSheet = ({ config, query }: { config: Config; query: string }): Props => {
  const hotRef = useRef<HotTable>();
  const fetchedAppDataState = useAsync(async (): Promise<{
    columnData: {
      colHeaders: any[];
      columnDatas: Handsontable.ColumnSettings[];
      dataSchema: Handsontable.RowObject;
    };
  }> => {
    const columnData = await getColumnData(config);
    return { columnData };
  }, [config]);

  const fetchAndLoadData = useCallback(async (): Promise<void> => {
    const hot = hotRef.current?.hotInstance ?? undefined;
    if (!hot) return;
    const { records } = await client.record.getRecords({ app: kintone.app.getId() || '', query });
    hot.loadData(records);
  }, [hotRef, query]);

  useEffect(() => {
    fetchAndLoadData();
  }, [fetchAndLoadData, query]);

  useRecursiveTimeout(
    async () => {
      await fetchAndLoadData();
    },
    config.autoReloadInterval ? Number(config.autoReloadInterval) * 1000 : 10000,
  ); // デフォルト10秒ごとにリロード

  const handleSaveAfterChange = useCallback(
    async (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
      const hot = hotRef.current?.hotInstance ?? undefined;
      if (!hot) return;

      const sourceData = hot.getSourceData();

      // データ読み込み時はイベントを終了
      if (source === 'loadData' || !changes) return;

      const changedRows = changes.map((row) => row[0]).filter((x, i, arr) => arr.indexOf(x) === i);

      // FIXME: ここらへんはSourceData起点がいいかもしれない
      const insertRecords = changedRows
        .filter((row) => !sourceData[row]?.$id?.value)
        .map((row) => shapingRecord(excludeNonEditableFields(sourceData[row])));

      const updateRecords = changedRows
        .filter((row) => sourceData[row]?.$id?.value)
        .map((row) => ({
          id: sourceData[row].$id.value,
          record: shapingRecord(excludeNonEditableFields(sourceData[row])),
        }));

      const requests = [
        {
          method: 'PUT',
          api: '/k/v1/records.json',
          payload: {
            app: kintone.app.getId(),
            records: updateRecords,
          },
        },
        {
          method: 'POST',
          api: '/k/v1/records.json',
          payload: {
            app: kintone.app.getId(),
            records: insertRecords,
          },
        },
      ];

      await client.bulkRequest({ requests });
      fetchAndLoadData();
    },
    [fetchAndLoadData],
  );

  const handleBeforeRemoveRow = async (index: number, amount: number) => {
    const hot = hotRef.current?.hotInstance ?? undefined;
    if (!hot) return;
    const sourceData = hot.getSourceData();
    const ids = sourceData.slice(index, index + amount).map((record) => record.$id.value);
    await client.record.deleteRecords({ app: kintone.app.getId() || '', ids });
    fetchAndLoadData();
  };

  return {
    beforeRemoveRow: handleBeforeRemoveRow,
    saveAfterChange: handleSaveAfterChange,
    colHeaders: fetchedAppDataState.value?.columnData.colHeaders ?? [],
    columns: fetchedAppDataState.value?.columnData.columnDatas ?? [],
    data: [], // 繰り返しデータは取得するので初期値としてのデータはあたえない
    dataSchema: fetchedAppDataState.value?.columnData.dataSchema ?? {},
    hotRef: hotRef as React.MutableRefObject<HotTable>,
  };
};

export const SpreadSheet: React.FC<Props> = ({
  hotRef,
  beforeRemoveRow,
  saveAfterChange,
  colHeaders,
  columns,
  dataSchema,
  data,
}) => {
  return (
    <HotTable
      ref={hotRef}
      data={data}
      rowHeaders
      contextMenu={['remove_row']}
      minSpareRows={1}
      width="100%"
      height="100vh"
      colHeaders={colHeaders}
      columns={columns}
      dataSchema={dataSchema}
      afterChange={saveAfterChange}
      beforeRemoveRow={beforeRemoveRow}
    />
  );
};
