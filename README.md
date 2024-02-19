# kintone スプレッドシート

[English Readme](https://github.com/mura-/kintone-spreadsheet/blob/master/README-en.md)  
[中文 Readme](https://github.com/mura-/kintone-spreadsheet/blob/master/README-zh.md)

## Description

kintone の一覧画面を Excel のようなスプレッドシートの見た目で閲覧、編集ができます。

![イメージ](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/image.gif)

[DEMO](https://dev-demo.cybozu.com/k/39/)  
デモ環境についての説明は [こちら](https://cybozudev.zendesk.com/hc/ja/articles/208217653)  
（DEMO はスプレッドシートの挙動確認のみ。設定はできません）

## Features

- kintone アプリの任意のフィールドを設定できる
- 設定されたフィールドはスプレッドシート上に表示され、レコードの編集、追加、削除ができる
- ドロップダウンフィールド、ラジオボタンフィールドに対応  
  ![イメージ](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/dropdown.gif)
- ユーザーフィールドとチェックボックスに対応（表示のみ）
- kintone の検索機能とページネーション、並び替えに対応

### Cautionary note

- 同期処理のため 10 秒に 1 回リフレッシュされます。
  API の使用制限にかかる恐れもあるので長時間の開きっぱなしはオススメしません。

## Installation

1. プラグインを[Download する](https://github.com/mura-/kintone-spreadsheet/releases/)
1. プラグインを[インポートする](https://help.cybozu.com/ja/k/admin/plugin.html)
1. プラグインの設定をする

## How to edit this plugin

プラグイン自体の拡張や変更などをしたい場合は、以下の手順で行ってください。

1. [Node.js](https://nodejs.org/en/)をインストールする
1. 依存ライブラリのインストール  
   `yarn install`
1. .env.sample を元に.env ファイルの作成
1. ビルド  
   `yarn run build`

※プラグインの作成手順については[こちら](https://cybozudev.zendesk.com/hc/ja/articles/203455680-kintone-%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E9%96%8B%E7%99%BA%E6%89%8B%E9%A0%86)

### 開発モード

ファイルを変更する度に逐一ビルドします。  
`yarn run dev`

## Author

[@mura-](https://www.facebook.com/kazuki.murahama)

## Other

- 不具合については ISSUE で連絡いただくか、PR いただけると幸いです。

## License

MIT

## Copyright

Copyright(c) Cybozu, Inc.

## OSS License

- Emotion - https://emotion.sh/docs/introduction
  - Author: Emotion team and other contributors
  - License: [MIT License](https://github.com/emotion-js/emotion/blob/jest-emotion%4011.0.0/LICENSE)
- kintone UI Component - https://kintone-labs.github.io/kintone-ui-component/
  - Author: Cybozu, Inc.
  - License: [MIT License](https://github.com/kintone-labs/kintone-ui-component/blob/v1.13.0/LICENSE)
- kintone REST API Client - https://github.com/kintone/js-sdk/tree/master/packages/rest-api-client
  - Author: Cybozu, Inc.
  - License: [MIT License](https://github.com/kintone/js-sdk/blob/%40kintone/rest-api-client%403.3.3/packages/rest-api-client/LICENSE)
- Hansontable - https://handsontable.com/
  - Author: Marcin Warpechowski
  - License: [MIT License](https://github.com/handsontable/handsontable/blob/6.2.2/LICENSE)
- i18next - https://www.i18next.com
  - Author: i18next
  - License: [MIT License](https://github.com/i18next/i18next/blob/v22.4.11/LICENSE)
- React - https://react.dev/
  - Author: Facebook, Inc. and its affiliates.
  - License: [MIT License](https://github.com/facebook/react/blob/v16.13.1/LICENSE)
- react-i18next - https://react.i18next.com/
  - Author: i18next
  - License: [MIT License](https://github.com/i18next/react-i18next/blob/v12.2.0/LICENSE)
- react-page-visibility - https://github.com/pgilad/react-page-visibility
  - Author: Gilad Peleg
  - License: [MIT License](https://github.com/pgilad/react-page-visibility/blob/v7.0.0/LICENSE)
- react-use - https://github.com/streamich/react-use
  - Author: streamich
  - License: [The Unlicense](https://github.com/streamich/react-use/blob/v17.4.0/LICENSE)
