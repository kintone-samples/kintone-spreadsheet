import React from 'react';
import ReactDOM from 'react-dom';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { fetchAppData, fetchConfig, saveAfterChange } from './js/utils/utils';
import { isValidConfig } from '~/src/js/config';

((PLUGIN_ID) => {
  kintone.events.on('app.record.index.show', (event) => {
    (async () => {
      const config = await fetchConfig(PLUGIN_ID);
      if (!isValidConfig(config)) {
        alert('設定画面からプラグインの設定を行ってください');
        return event;
      }
      const containerElement = document.getElementById(config.elementId);
      if (!containerElement) return event;

      const { columnData, records } = await fetchAppData(config);

      ReactDOM.render(
        <HotTable
          data={records}
          rowHeaders
          width="100%"
          height="100vh"
          colHeaders={columnData.colHeaders}
          columns={columnData.columnDatas}
          dataSchema={columnData.dataSchema}
          afterChange={saveAfterChange}
        />,
        document.getElementById(config.elementId),
      );
    })();

    return event;
  });
})(kintone.$PLUGIN_ID);
