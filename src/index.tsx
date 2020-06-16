import React from 'react';
import ReactDOM from 'react-dom';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { fetchAppData, fetchConfig, saveAfterChange, beforeRemoveRow } from './js/utils/utils';
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
      const hot = React.createRef<HotTable>();

      const autoload = () => {
        setTimeout(async () => {
          const { columnData, records } = await fetchAppData(config);
          hot.current?.hotInstance.loadData(records);
          autoload();
        }, 10000); // 10秒。APIの呼び出し数の上限があるので、必要に応じて変更してください。
      };

      autoload();

      ReactDOM.render(
        <HotTable
          ref={hot}
          data={records}
          rowHeaders
          contextMenu={['remove_row']}
          minSpareRows={1}
          width="100%"
          height="100vh"
          colHeaders={columnData.colHeaders}
          columns={columnData.columnDatas}
          dataSchema={columnData.dataSchema}
          afterChange={saveAfterChange}
          beforeRemoveRow={beforeRemoveRow}
        />,
        document.getElementById(config.elementId),
      );
    })();

    return event;
  });
})(kintone.$PLUGIN_ID);
