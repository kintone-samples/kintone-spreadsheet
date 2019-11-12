import Handsonlable from "handsontable";
const ALLOWED_FIELD_TYPES = [
  "RECORD_NUMBER",
  "CREATED_TIME",
  "UPDATED_TIME",
  "CREATOR",
  "MODIFIER",
  "STATUS",
  "STATUS_ASSIGNEE"
];
const ARRAY_FIELDS = [
  "CHECK_BOX",
  "MULTI_SELECT",
  "FILE",
  "USER_SELECT",
  "CATEGORY",
  "SUBTABLE",
  "ORGANIZATION_SELECT",
  "GROUP_SELECT"
];
const NOT_ALLOWED_EDIT_FIELDS = [
  "USER_SELECT",
  "CALC",
  "CHECK_BOX",
  "MULTI_SELECT",
  "FILE",
  "CATEGORY",
  "SUBTABLE",
  "ORGANIZATION_SELECT",
  "GROUP_SELECT"
];

export const getColumnData = async (columns: string[]) => {
  const resp = await kintone.api("/k/v1/app/form/fields", "GET", {
    app: kintone.app.getId()
  });
  // ヘッダーの取得
  const colHeaders = columns.map(column => {
    return resp.properties[column].label;
  });

  // 各セルの設定
  const columnDatas: Handsonlable.ColumnSettings[] = columns.map(column => {
    const columnData: Handsonlable.ColumnSettings = { data: `${column}.value` };

    // if type is DROP_DOWN, add type and source property
    if (
      resp.properties[column].type === "DROP_DOWN" ||
      resp.properties[column].type === "RADIO_BUTTON"
    ) {
      columnData.type = "dropdown";
      columnData.source = Object.keys(resp.properties[column].options);
    }

    if (resp.properties[column].type === "USER_SELECT") {
      columnData.renderer = userSelectRenderer;
    }

    if (resp.properties[column].type === "CHECK_BOX") {
      columnData.renderer = checkboxRenderer;
    }

    // set read only
    if (
      ALLOWED_FIELD_TYPES.concat(NOT_ALLOWED_EDIT_FIELDS).indexOf(
        resp.properties[column].type
      ) !== -1
    ) {
      columnData.readOnly = true;
    }
    return columnData;
  });

  // データスキーマの作成
  const dataSchema: Handsonlable.RowObject = {};
  // TODO: reduceつかう
  columns.forEach(column => {
    dataSchema[column] = {
      type: resp.properties[column].type,
      value: resp.properties[column].defaultValue
    };
  });

  return { colHeaders, columnDatas, dataSchema };
};

const userSelectRenderer: Handsonlable.renderers.BaseRenderer = (
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) => {
  if (!value) return td;
  td.innerText = value.map(v => v.name).join(", ");
  td.style.color = "#777";
  return td;
};

const checkboxRenderer: Handsonlable.renderers.Checkbox = (
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) => {
  if (!value.length) return td;
  td.innerText = value.join(", ");
  td.style.color = "#777";
  return td;
};
