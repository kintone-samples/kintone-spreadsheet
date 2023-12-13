import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
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

const SettingError: React.FC = () => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(kintone.getLoginUser().language);
  }, [i18n]);
  return <></>;
};

((PLUGIN_ID) => {
  kintone.events.on('app.record.index.show', (event) => {
    (async () => {
      const config = await fetchConfig(PLUGIN_ID);
      if (!config) return event; // if never setting kintone, return event;
      if (!isValidConfig(config)) {
        ReactDOM.render(<SettingError />, kintone.app.getHeaderSpaceElement());
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
