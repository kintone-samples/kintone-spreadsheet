import React from 'react';
import ReactDOM from 'react-dom';
import 'handsontable/dist/handsontable.full.css';
import { fetchAppData, fetchConfig } from './js/utils/utils';
import { isValidConfig, Config } from '~/src/js/config';
import { SpreadSheet, useSpreadSheet } from '~/src/js/spreadsheet';

type ContainerProps = {
  config: Config;
};

const Container: React.FC<ContainerProps> = ({ config }) => {
  const spreadSheetProps = useSpreadSheet({ config });

  const autoload = () => {
    setTimeout(async () => {
      const { records } = await fetchAppData(config);
      spreadSheetProps.hotRef.current?.hotInstance.loadData(records);
      autoload();
    }, 10000); // 10秒。APIの呼び出し数の上限があるので、必要に応じて変更してください。
  };

  autoload();

  console.log('props:', spreadSheetProps);

  return <SpreadSheet {...spreadSheetProps} hotRef={spreadSheetProps.hotRef} />;
};

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

      ReactDOM.render(<Container config={config} />, document.getElementById(config.elementId));
    })();

    return event;
  });
})(kintone.$PLUGIN_ID);
