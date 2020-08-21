import React, { useState, useEffect, useRef } from 'react';
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { useAsync } from 'react-use';
import { Config } from '~/src/js/config';
import { client } from '~/src/js/utils/client';

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

const excludeNonEditableFields = (record) => {
  const result = {};
  for (const prop in record) {
    if (NOT_ALLOWED_EDIT_FIELDS.indexOf(record[prop].type) === -1) {
      result[prop] = record[prop];
    }
  }
  return result;
};

const getColumnData = async (config: Config) => {
  const query = kintone.app.getQuery();
  const resp = await kintone.api('/k/v1/app/form/fields', 'GET', {
    app: kintone.app.getId(),
    query,
  });
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
      columnData.source = Object.keys(resp.properties[code].options);
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
    return { ...prev, [code]: { type: resp.properties[code].type, value: resp.properties[code].defaultValue } };
  }, {});

  return { colHeaders, columnDatas, dataSchema };
};

const userSelectRenderer: Handsontable.renderers.Base = (instance, td, row, col, prop, value, cellProperties) => {
  if (!value) return td;
  td.innerText = value.map((v) => v.name).join(', ');
  td.style.color = '#777';
  return td;
};

const checkboxRenderer: Handsontable.renderers.Checkbox = (instance, td, row, col, prop, value, cellProperties) => {
  if (!value.length) return td;
  td.innerText = value.join(', ');
  td.style.color = '#777';
  return td;
};

export const useSpreadSheet = ({ config }: { config: Config }): Props => {
  const hotRef = useRef<HotTable>();
  const fetchedAppDataState = useAsync(async (): Promise<{
    records: any[];
    columnData: {
      colHeaders: any[];
      columnDatas: Handsontable.ColumnSettings[];
      dataSchema: Handsontable.RowObject;
    };
  }> => {
    // TODO: kintone rest api client使う
    const query = kintone.app.getQuery();
    const { records } = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: kintone.app.getId(),
      query,
    });

    const columnData = await getColumnData(config);

    return { records, columnData };
  }, [config]);

  const handleSaveAfterChange = async (
    changes: Handsontable.CellChange[] | null,
    source: Handsontable.ChangeSource,
  ) => {
    const hot = hotRef.current?.hotInstance ?? undefined;
    if (!hot) return;

    const sourceData = hot.getSourceData();

    // データ読み込み時はイベントを終了
    if (source === 'loadData' || !changes) return;

    const changedRows = changes.map((row) => row[0]).filter((x, i, arr) => arr.indexOf(x) === i);

    // FIXME: ここらへんはSourceData起点がいいかもしれない
    const insertRecords = changedRows
      .filter((row) => !sourceData[row]?.$id?.value)
      .map((row) => excludeNonEditableFields(sourceData[row]));

    const updateRecords = changedRows
      .filter((row) => sourceData[row]?.$id?.value)
      .map((row) => ({ id: sourceData[row].$id.value, record: excludeNonEditableFields(sourceData[row]) }));

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

    // TODO: kintone rest api client使う
    await client.bulkRequest({ requests });
    const query = kintone.app.getQuery();
    const { records } = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: kintone.app.getId(),
      query,
    });
    hot.loadData(records);
  };

  const handleBeforeRemoveRow = async (index: number, amount: number) => {
    const hot = hotRef.current?.hotInstance ?? undefined;
    if (!hot) return;
    const sourceData = hot.getSourceData();
    const ids = sourceData.slice(index, index + amount).map((record) => record.$id.value);
    // TODO: kintone rest api client使う
    await kintone.api('/k/v1/records', 'DELETE', { app: kintone.app.getId(), ids });
    const query = kintone.app.getQuery();
    const { records } = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      app: kintone.app.getId(),
      query,
    });
    hot.loadData(records);
  };

  return {
    beforeRemoveRow: handleBeforeRemoveRow,
    saveAfterChange: handleSaveAfterChange,
    colHeaders: fetchedAppDataState.value?.columnData.colHeaders ?? [],
    columns: fetchedAppDataState.value?.columnData.columnDatas ?? [],
    data: fetchedAppDataState.value?.records ?? [],
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
