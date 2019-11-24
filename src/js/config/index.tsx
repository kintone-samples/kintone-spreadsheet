import React, { useState, useCallback, ChangeEvent, useEffect, SyntheticEvent } from 'react';
import ReactDOM from 'react-dom';
import { Button, Text } from '@kintone/kintone-ui-component';
import '~/src/css/51-us-default.scss';
import './styles.scss';
import FormFieldSelectTable, { OnChange as FormFieldSelectTableOnChange } from './FormFieldSelectTable';

const useConfig = () => {
  const [elementId, setElementId] = useState('sheet');
  const onChangeElementId = useCallback((value: string | null) => setElementId(value ? value : ''), []);
  const onSubmit = useCallback(() => {
    console.log('submit!');
    console.log(elementId);
  }, []);
  const onCancel = useCallback(() => {
    console.log('cancel!');
  }, []);

  const onChange = useCallback<FormFieldSelectTableOnChange>((selectedField) => {
    console.log(selectedField);
  }, []);

  return { elementId, onChangeElementId, onChange, onSubmit, onCancel };
};

const Config: React.FC = () => {
  const { elementId, onChangeElementId, onChange, onSubmit, onCancel } = useConfig();
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
        <Text value={elementId} onChange={onChangeElementId} />
      </div>
      <div className="kintoneplugin-row">
        <h2 className="kintoneplugin-label">3. スプレットシートに表示したいフィールドを設定してください。</h2>
        <FormFieldSelectTable onChange={onChange} />
      </div>
      <div className="kintoneplugin-row form-control">
        <Button type="submit" text="保存する" onClick={onSubmit} /> <Button onClick={onCancel} text="キャンセル" />
      </div>
    </div>
  );
};

((PLUGIN_ID) => {
  ReactDOM.render(<Config />, document.getElementById('kintone-spreadsheet-config'));
})(kintone.$PLUGIN_ID);
