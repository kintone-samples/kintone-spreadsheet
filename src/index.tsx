import React from "react";
import ReactDOM from "react-dom";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import { getColumnData } from "./js/utils/utils";

(() => {
  kintone.events.on("app.record.index.show", event => {
    // 試しに列は固定
    const columns = ["text", "checkbox", "user"];

    (async () => {
      const { records } = await kintone.api(
        kintone.api.url("/k/v1/records", true),
        "GET",
        { app: kintone.app.getId() }
      );
      const { colHeaders, columnDatas, dataSchema } = await getColumnData(
        columns
      );
      ReactDOM.render(
        <HotTable
          data={records}
          rowHeaders={true}
          width="600"
          height="300"
          colHeaders={colHeaders}
          columns={columnDatas}
          dataSchema={dataSchema}
        />,
        document.getElementById("app")
      );
    })();
  });
})();
