import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import '~/src/css/51-us-default.scss';
import './styles.scss';
import '~/src/js/utils/i18n';
import { KucBase } from 'kintone-ui-component/lib/base/kuc-base';
import KucText from './kucText';
import KucButton from './kucButton';
import KucTable from './kucTable';

interface FormField {
  code: string;
}

export interface Config {
  elementId: string;
  columns: FormField[];
  autoReloadInterval: number; // ms
}

export const isValidConfig = (config: unknown): config is Config => {
  if (
    typeof config === 'object' &&
    config != null &&
    'elementId' in config &&
    'columns' in config &&
    Array.isArray(config['columns'])
  ) {
    return true;
  }
  return false;
};

export const emptyConfig: Config = {
  elementId: 'sheet',
  columns: [{ code: '' }],
  autoReloadInterval: 10, // sec
};

const useConfig = (pluginId: string) => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(kintone.getLoginUser().language);
  }, [i18n]);
  const restoredConfig = kintone.plugin.app.getConfig(pluginId);

  const ret = restoredConfig.config
    ? {
        ...emptyConfig,
        ...JSON.parse(restoredConfig.config),
      }
    : emptyConfig;

  return {
    config: ret,
    t,
  };
};

interface Props {
  pluginId: string;
}

interface DataObject {
  field: string;
}
interface KucElement extends KucBase {
  data: DataObject[] | null;
  value: string;
}
interface Column {
  code: string;
}

// KucButton event
const onButtonClickEvent = async () => {
  const columnsArray: Column[] = [];
  const kucTable = document.getElementById('tableId') as KucElement;
  const tableData: DataObject[] | null = kucTable?.data;
  tableData?.forEach((data) => {
    const column: Column = {
      code: data.field,
    };
    columnsArray.push(column);
  });

  const txtElementId = document.getElementById('textId') as KucElement;
  const txtAutoReloadInterval = document.getElementById('autoReloadInterval') as KucElement;
  const config = {
    elementId: txtElementId?.value,
    columns: columnsArray,
    autoReloadInterval: txtAutoReloadInterval?.value,
  };

  fetch('/kintone-plugin-spreadsheet/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  await kintone.plugin.app.setConfig({
    config: JSON.stringify(config),
  });
};

const onCancelClickEvent = () => {
  history.back();
};

const Config: React.FC<Props> = ({ pluginId }) => {
  const { config, t } = useConfig(pluginId);
  return (
    <div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">{t('config.section1.header')}</h2>
        <p>{t('config.section1.body')}</p>
        <a href="https://help.cybozu.com/ja/k/user/set_view.html" target="_blank" rel="noopener noreferrer">
          {t('config.section1.link_text')}
        </a>
        <p>{t('config.section1.example')}</p>
        <pre>{'<div id="sheet">'}</pre>
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">{t('config.section2.header')}</h2>
        <KucText id="textId" value={config.elementId}></KucText>
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">{t('config.section3.header')}</h2>
        <KucTable id="tableId" label="テーブル" config={config}></KucTable>
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">{t('config.auto_reload.header')}</h2>
        <span>{t('config.auto_reload.description')}</span>
        <KucText id="autoReloadInterval" value={config.autoReloadInterval.toString()} />
      </div>
      <div className="kintoneplugin-row form-control">
        <KucButton id="buttonId" type="submit" text="設定保存" onClick={onButtonClickEvent}></KucButton>
        <KucButton id="cancelButtonId" type="normal" text="キャンセル" onClick={onCancelClickEvent}></KucButton>
      </div>
    </div>
  );
};

((PLUGIN_ID) => {
  const targetElement = document.getElementById('kintone-plugin-config');
  if (targetElement) {
    const configRoot = ReactDOM.createRoot(targetElement);
    configRoot.render(<Config pluginId={PLUGIN_ID} />);
  }
})(kintone.$PLUGIN_ID);
