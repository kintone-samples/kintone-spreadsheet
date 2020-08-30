import React from 'react';
import ReactDOM from 'react-dom';
import 'handsontable/dist/handsontable.full.css';
import { fetchConfig } from './js/utils/utils';
import { isValidConfig, Config } from '~/src/js/config';
import { SpreadSheet, useSpreadSheet } from '~/src/js/spreadsheet';

type ContainerProps = {
  config: Config;
  query: string;
  appId: number;
};

const Container: React.FC<ContainerProps> = ({ config, query, appId }) => {
  const spreadSheetProps = useSpreadSheet({ config, query, appId });
  return <SpreadSheet {...spreadSheetProps} />;
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

      ReactDOM.render(
        <Container config={config} query={kintone.app.getQuery() || ''} appId={kintone.app.getId() || 0} />,
        document.getElementById(config.elementId),
      );
    })();

    return event;
  });
})(kintone.$PLUGIN_ID);
