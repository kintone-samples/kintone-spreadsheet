import Handsonlable from 'handsontable';
import { Config } from '~/src/js/config';
const ALLOWED_FIELD_TYPES = [
  'RECORD_NUMBER',
  'CREATED_TIME',
  'UPDATED_TIME',
  'CREATOR',
  'MODIFIER',
  'STATUS',
  'STATUS_ASSIGNEE',
];
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
  'USER_SELECT',
  'CALC',
  'CHECK_BOX',
  'MULTI_SELECT',
  'FILE',
  'CATEGORY',
  'SUBTABLE',
  'ORGANIZATION_SELECT',
  'GROUP_SELECT',
];

export const getColumnData = async (config: Config) => {
  const resp = await kintone.api('/k/v1/app/form/fields', 'GET', {
    app: kintone.app.getId(),
  });
  // ヘッダーの取得
  const colHeaders = config.columns.map(({ code }) => {
    return resp.properties[code].label;
  });

  // 各セルの設定
  const columnDatas: Handsonlable.ColumnSettings[] = config.columns.map(({ code }) => {
    const columnData: Handsonlable.ColumnSettings = { data: `${code}.value` };

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
    if (ALLOWED_FIELD_TYPES.concat(NOT_ALLOWED_EDIT_FIELDS).indexOf(resp.properties[code].type) !== -1) {
      columnData.readOnly = true;
    }
    return columnData;
  });

  // データスキーマの作成
  const dataSchema: Handsonlable.RowObject = config.columns.reduce((prev, { code }) => {
    return { ...prev, [code]: { type: resp.properties[code].type, value: resp.properties[code].defaultValue } };
  }, {});

  return { colHeaders, columnDatas, dataSchema };
};

const userSelectRenderer: Handsonlable.renderers.BaseRenderer = (
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties,
) => {
  if (!value) return td;
  td.innerText = value.map((v) => v.name).join(', ');
  td.style.color = '#777';
  return td;
};

const checkboxRenderer: Handsonlable.renderers.Checkbox = (instance, td, row, col, prop, value, cellProperties) => {
  if (!value.length) return td;
  td.innerText = value.join(', ');
  td.style.color = '#777';
  return td;
};

export const fetchConfig = async (PLUGIN_ID: string): Promise<Config | null> => {
  // Get saved config
  const rawConfig = kintone.plugin.app.getConfig(PLUGIN_ID)?.config;
  if (!rawConfig) return null;
  const config = JSON.parse(rawConfig);
  return config;
};

export const fetchAppData = async (config: Config) => {
  const { records } = await kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
    app: kintone.app.getId(),
  });

  const columnData = await getColumnData(config);

  return { records, columnData };
};
