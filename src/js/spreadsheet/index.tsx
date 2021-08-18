import React, { useEffect, useRef, useCallback } from 'react';
import { usePageVisibility } from 'react-page-visibility';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { useAsync } from 'react-use';
import styled from '@emotion/styled';
import { Alert } from '@kintone/kintone-ui-component';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';
import { Config } from '~/src/js/config';
import { client } from '~/src/js/utils/client';
import {
  useRecursiveTimeout,
  useFetchRecords,
  useOnChangeCheckbox,
  useAfterChange,
  useBeforeRemoveRow,
} from '~/src/js/spreadsheet/hooks';
import { Loader } from '~/src/js/spreadsheet/Loader';

type HotTable = HTMLDivElement & {
  hotInstance?: Handsontable;
};

type SpreadSheetProps = {
  saveAfterChange: Handsontable.Hooks['afterChange'];
  beforeRemoveRow: Handsontable.Hooks['beforeRemoveRow'];
  colHeaders: Handsontable.GridSettings['colHeaders'];
  columns: Handsontable.GridSettings['columns'];
  dataSchema: Handsontable.GridSettings['dataSchema'];
  data: Handsontable.GridSettings['data'];
  hotRef: React.RefObject<HotTable>;
  setHotRef: (node: HotTable) => void;
};

type Props = {
  isLoading: boolean;
  errorMessages: string;
} & SpreadSheetProps;

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

declare type Options = {
  [optionName: string]: {
    label: string;
    index: string;
  };
};
declare type CheckBoxFieldProperty = {
  type: 'CHECK_BOX';
  code: string;
  label: string;
  noLabel: boolean;
  required: boolean;
  defaultValue: string[];
  options: Options;
  align: 'HORIZONTAL' | 'VERTICAL';
};

export const useHookWithRefCallback = <T extends HTMLElement>(): [
  React.MutableRefObject<T | null>,
  (node: T) => void,
] => {
  const ref = useRef<T | null>(null);
  const setRef = useCallback((node: T) => {
    ref.current = node;
  }, []);

  return [ref, setRef];
};

const getColumnData = async (config: Config, appId: number, onChange: any) => {
  const resp = await client.app.getFormFields({ app: appId });
  // ヘッダーの取得
  const colHeaders = config.columns.map(({ code }) => {
    return resp.properties[code].label;
  });

  // 各セルの設定
  const columnDatas: Handsontable.GridSettings['columns'] = config.columns.map(({ code }) => {
    const columnData: Handsontable.GridSettings = { data: `${code}.value` };

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
      columnData.renderer = checkboxRenderer(resp.properties[code] as CheckBoxFieldProperty, onChange);
    }

    // set read only
    if (NOT_ALLOWED_EDIT_FIELDS.indexOf(resp.properties[code].type) !== -1) {
      columnData.readOnly = true;
    }
    return columnData;
  });

  // データスキーマの作成
  // const dataSchema: Handsontable.RowObject = config.columns.reduce((prev, { code }) => {
  const dataSchema = config.columns.reduce((prev, { code }) => {
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

const checkboxRenderer = (
  property: CheckBoxFieldProperty,
  onChange: (event: React.ChangeEvent<HTMLInputElement>, row: number) => void,
): Handsontable.renderers.Checkbox => (instance, td, row, col, prop, value) => {
  // Experimental
  // eslint-disable-next-line max-len
  // https://codesandbox.io/s/advanced-handsontablereact-implementation-using-hotcolumn-878mz?from-embed=&file=/src/index.js

  const Dom = () => {
    return (
      <div>
        {Object.values(property.options).map((v, i) => (
          <label key={i}>
            <input
              type="checkbox"
              defaultChecked={value.includes(v.label)}
              onChange={(event) => onChange(event, row)}
              data-name={v.label}
              data-code={property.code}
            />
            {v.label}
          </label>
        ))}
      </div>
    );
  };
  ReactDOM.render(<Dom />, td);
  return td;
};

export const useSpreadSheet = ({ config, query, appId }: { config: Config; query: string; appId: number }): Props => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(kintone.getLoginUser().language);
  }, [i18n]);

  // const hotRef = useRef<HotTable>();
  const [hotRef, setHotRef] = useHookWithRefCallback<HotTable>();
  const isPageVisible = usePageVisibility();

  const [fetchedAndLoadDataState, fetchAndLoadData] = useFetchRecords({
    hotRef: hotRef as React.MutableRefObject<HotTable>,
    isPageVisible,
    query,
    appId,
  });

  const [onChangeCheckboxState, onChangeCheckbox] = useOnChangeCheckbox({
    appId,
    hotRef: hotRef as React.MutableRefObject<HotTable>,
  });

  const fetchedAppDataState = useAsync(async (): Promise<{
    columnData: {
      colHeaders: any[];
      columnDatas: Handsontable.GridSettings['columns'];
      dataSchema: Handsontable.GridSettings['data'];
    };
  }> => {
    const columnData = await getColumnData(config, appId, onChangeCheckbox).catch((e) => {
      throw new Error(t('errors.get_column_data_error') + ': ' + e.message);
    });
    return { columnData };
  }, [appId, config, onChangeCheckbox, t]);

  const [afterChangeState, handleSaveAfterChange] = useAfterChange({
    appId,
    hotRef: hotRef as React.MutableRefObject<HotTable>,
  });

  const [beforeRemoveRowState, handleBeforeRemoveRow] = useBeforeRemoveRow({
    appId,
    hotRef: hotRef as React.MutableRefObject<HotTable>,
  });

  // 初回ロード
  useEffect(() => {
    if (!fetchedAppDataState.value) return;
    fetchAndLoadData();
  }, [fetchAndLoadData, fetchedAppDataState.value]);

  // 値変更後
  useEffect(() => {
    if (!afterChangeState.value && !beforeRemoveRowState.value) return;
    fetchAndLoadData();
  }, [fetchAndLoadData, onChangeCheckboxState, afterChangeState.value, beforeRemoveRowState.value]);

  useRecursiveTimeout(
    async () => {
      await fetchAndLoadData();
    },
    config.autoReloadInterval ? Number(config.autoReloadInterval) * 1000 : 10000,
  ); // デフォルト10秒ごとにリロード

  return {
    beforeRemoveRow: handleBeforeRemoveRow,
    saveAfterChange: handleSaveAfterChange,
    colHeaders: fetchedAppDataState.value?.columnData.colHeaders ?? [],
    columns: fetchedAppDataState.value?.columnData.columnDatas ?? [],
    data: [], // 繰り返しデータは取得するので初期値としてのデータはあたえない
    dataSchema: fetchedAppDataState.value?.columnData.dataSchema ?? {},
    hotRef: hotRef as React.MutableRefObject<HotTable>,
    setHotRef: setHotRef,
    isLoading:
      fetchedAndLoadDataState.loading ||
      afterChangeState.loading ||
      beforeRemoveRowState.loading ||
      onChangeCheckboxState.loading,
    errorMessages:
      fetchedAppDataState.error?.message ||
      fetchedAndLoadDataState.error?.message ||
      afterChangeState.error?.message ||
      beforeRemoveRowState.error?.message ||
      onChangeCheckboxState.error?.message ||
      '',
  };
};

const MemoedHotTable = React.memo<SpreadSheetProps>(
  ({ setHotRef, hotRef, beforeRemoveRow, saveAfterChange, colHeaders, columns, dataSchema, data }) => {
    if (hotRef.current) {
      hotRef.current.hotInstance = new Handsontable(hotRef.current, {
        data: data,
        rowHeaders: true,
        contextMenu: ['remove_row'],
        minSpareRows: 1,
        colHeaders: colHeaders,
        columns: columns,
        dataSchema: dataSchema,
        afterChange: saveAfterChange,
        beforeRemoveRow: beforeRemoveRow,
      });
    }
    return <div ref={setHotRef}></div>;
  },
  (prev, next) => prev.hotRef === next.hotRef && prev.columns?.length === next.columns?.length,
);

MemoedHotTable.displayName = 'MemoedHotTable';

const Wrapper = styled.div`
  position: relative;
`;

export const SpreadSheet: React.FC<Props> = ({
  hotRef,
  beforeRemoveRow,
  saveAfterChange,
  colHeaders,
  columns,
  dataSchema,
  data,
  isLoading,
  errorMessages,
  setHotRef,
}) => {
  return (
    <Wrapper>
      {errorMessages && <Alert isVisible text={errorMessages} />}
      {isLoading && <Loader />}
      <MemoedHotTable
        hotRef={hotRef}
        setHotRef={setHotRef}
        data={data}
        colHeaders={colHeaders}
        columns={columns}
        dataSchema={dataSchema}
        saveAfterChange={saveAfterChange}
        beforeRemoveRow={beforeRemoveRow}
      />
    </Wrapper>
  );
};
