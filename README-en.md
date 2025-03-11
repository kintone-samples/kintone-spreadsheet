# kintone spreadsheet plugin

## Description

You can view and edit the kintone list screen with the look of a spreadsheet like Excel.

![Image](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/image.gif)

[DEMO](https://dev-demo.cybozu.com/k/39/)  
[a description of the demo environment](https://cybozu.dev/ja/id/d149e606f6b6deee612013d2/)  
(DEMO can only check the befavior of the spreadsheet. Cannot be set)

## Features

- You can set any field in the kintone app.
- The configured fields are displayed on the sparedsheet and you can edit, add, or delete records.
- Supports dropdown fields and radio button fields.  
  ![image](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/dropdown.gif)
- Supports user fields and checkboxes (display only)
- Supports kintone search function, pagination, and sorting

### Cautionary note

- It is refreshed once every 10 seconds due to the synchronization process.  
  We do not recommend leaving it open for a long time as it may limit the usage of the API.

## Installation

1. [Download](https://github.com/mura-/kintone-spreadsheet/releases/) this plugin.
1. [Import](https://jp.cybozu.help/k/en/id/0408.html) to your kintone environment.
1. [Configure plugin settings](https://jp.cybozu.help/k/en/id/040566.html).

## How to Edit this plugin

If you want to extend or change the plugin itself, follow the procedure below.

1. Install [Node.js](https://nodejs.org/en/)
1. Install dependencies.
   `yarn install`
1. Create .env file based on .env.sample.
1. Build
   `yarn run build`

※[How to craete a kintone plugin](https://kintone.dev/en/plugins/introduction-to-plug-ins/plug-in-development-specifications/)

### Develop mode

`yarn run watch`

## Author

[@mura-](https://www.facebook.com/kazuki.murahama)

## Other

- If you have any problems, please contact us view Issue or PullRequest them.

## License

MIT

## Copyright

Copyright(c) Cybozu, Inc.
