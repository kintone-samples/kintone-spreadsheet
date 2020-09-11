import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button, Text, Alert, Label } from '@kintone/kintone-ui-component';
import '~/src/css/51-us-default.scss';
import './styles.scss';
import FormFieldSelectTable, { OnChange as FormFieldSelectTableOnChange, FormField } from './FormFieldSelectTable';
import '~/src/js/utils/i18n';

export interface Config {
  elementId: string;
  columns: FormField[];
  autoReloadInterval: number; // ms
}

export const isValidConfig = (config: any): config is Config => {
  if (config && 'elementId' in config && 'columns' in config && Array.isArray(config.columns)) {
    return true;
  }
  return false;
};

export const emptyConfig: Config = {
  elementId: 'sheet',
  columns: [],
  autoReloadInterval: 10, // sec
};

const useConfig = (pluginId: string) => {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(kintone.getLoginUser().language);
  }, [i18n]);
  const restoredConfig = kintone.plugin.app.getConfig(pluginId);

  const [config, setConfig] = useState<Config>(
    // restore from parsed configuration
    restoredConfig.config
      ? {
          ...emptyConfig,
          ...JSON.parse(restoredConfig.config),
        }
      : emptyConfig,
  );
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const onChangeElementId = useCallback(
    (value: string | null) =>
      setConfig((config) => ({
        ...config,
        elementId: value || '',
      })),
    [],
  );

  const onChangeAutoRenewalInterval = useCallback((value: string | null) => {
    setConfig((config) => ({
      ...config,
      autoReloadInterval: Number.isInteger(Number(value)) ? Number(value) : 0,
    }));
  }, []);

  // TODO: Loadingなど表示
  const onSubmit = useCallback(() => {
    setShowAlert(false);
    const validConfig: Config = {
      ...config,
      autoReloadInterval:
        config.autoReloadInterval > emptyConfig.autoReloadInterval
          ? config.autoReloadInterval
          : emptyConfig.autoReloadInterval,
    };
    kintone.plugin.app.setConfig(
      {
        config: JSON.stringify(validConfig),
      },
      () => {
        setConfig(validConfig);
        setShowAlert(true);
      },
    );
  }, [config]);

  const onCancel = useCallback(() => {
    history.back();
  }, []);

  const onChange = useCallback<FormFieldSelectTableOnChange>(
    (selectedFields) => setConfig((config) => ({ ...config, columns: selectedFields })),
    [],
  );

  return {
    config,
    onChangeElementId,
    onChangeAutoRenewalInterval,
    onChange,
    onSubmit,
    onCancel,
    showAlert,
    onClickAlert: useCallback(() => setShowAlert(false), []),
    t,
  };
};

interface Props {
  pluginId: string;
}

const Config: React.FC<Props> = ({ pluginId }) => {
  const {
    config,
    onChangeElementId,
    onChangeAutoRenewalInterval,
    onChange,
    onSubmit,
    onCancel,
    showAlert,
    onClickAlert,
    t,
  } = useConfig(pluginId);
  return (
    <div id="form" className="colorcell-plugin">
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
        <Text value={config.elementId} onChange={onChangeElementId} />
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">{t('config.section3.header')}</h2>
        <FormFieldSelectTable onChange={onChange} defaultSelectedFields={config.columns} />
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">{t('config.auto_reload.header')}</h2>
        <Label text={t('config.auto_reload.description')}></Label>
        <Text value={config.autoReloadInterval.toString()} onChange={onChangeAutoRenewalInterval} />
      </div>
      <div className="kintoneplugin-row form-control">
        <Button type="submit" text={t('common.save')} onClick={onSubmit} />{' '}
        <Button onClick={onCancel} text={t('common.cancel')} />
      </div>
      <Alert text={t('config.success')} type="success" isVisible={showAlert} onClick={onClickAlert} />
    </div>
  );
};

((PLUGIN_ID) => {
  const targetElement = document.getElementById('kintone-spreadsheet-config');
  targetElement && ReactDOM.render(<Config pluginId={PLUGIN_ID} />, targetElement);
})(kintone.$PLUGIN_ID);
