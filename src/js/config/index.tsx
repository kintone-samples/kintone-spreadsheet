import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Button, Text } from '@kintone/kintone-ui-component';
import '~/src/css/51-us-default.scss';
import './styles.scss';
import FormFieldSelectTable, { OnChange as FormFieldSelectTableOnChange, FormField } from './FormFieldSelectTable';

export interface Config {
  elementId: string;
  columns: FormField[];
}

export const isValidConfig = (config: any): config is Config => {
  if ('elementId' in config && 'columns' in config && Array.isArray(config.columns)) {
    return true;
  }
  return false;
};

const useConfig = (pluginId: string) => {
  const restoredConfig = kintone.plugin.app.getConfig(pluginId);
  const [config, setConfig] = useState<Config>(
    // restore from parsed configuration
    Object.keys(JSON.parse(restoredConfig.config)).length
      ? JSON.parse(restoredConfig.config)
      : {
          elementId: 'sheet',
          columns: [],
        },
  );

  const onChangeElementId = useCallback(
    (value: string | null) =>
      setConfig((config) => ({
        ...config,
        elementId: value || '',
      })),
    [setConfig],
  );

  const onSubmit = useCallback(() => {
    kintone.plugin.app.setConfig(
      {
        config: JSON.stringify({
          elementId: config.elementId,
          columns: config.columns,
        }),
      },
      () => {},
    );
  }, [config]);

  const onCancel = useCallback(() => {
    history.back();
  }, []);

  const onChange = useCallback<FormFieldSelectTableOnChange>(
    (selectedFields) => setConfig({ ...config, columns: selectedFields }),
    [config],
  );

  return { config, onChangeElementId, onChange, onSubmit, onCancel };
};

interface Props {
  pluginId: string;
}

const Config: React.FC<Props> = ({ pluginId }) => {
  const { config, onChangeElementId, onChange, onSubmit, onCancel } = useConfig(pluginId);
  return (
    <div id="form" className="colorcell-plugin">
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">1. カスタマイズビューを作成してください。</h2>
        <p>カスタマイズビューを作成し、下記例のようにスプレットシートのための要素を用意してください。</p>
        <a href="https://help.cybozu.com/ja/k/user/set_view.html" target="_blank">
          kintone ユーザーヘルプ: 一覧を設定する
        </a>
        <p>例）</p>
        <pre>{'<div id="sheet">'}</pre>
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">2. 1で設定した要素IDを入力してください。</h2>
        <Text value={config.elementId} onChange={onChangeElementId} />
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">3. スプレットシートに表示したいフィールドを設定してください。</h2>
        <FormFieldSelectTable onChange={onChange} defaultSelectedFields={config.columns} />
      </div>
      <div className="kintoneplugin-row form-control">
        <Button type="submit" text="保存する" onClick={onSubmit} /> <Button onClick={onCancel} text="キャンセル" />
      </div>
    </div>
  );
};

((PLUGIN_ID) => {
  const targetElement = document.getElementById('kintone-spreadsheet-config');
  targetElement && ReactDOM.render(<Config pluginId={PLUGIN_ID} />, targetElement);
})(kintone.$PLUGIN_ID);
