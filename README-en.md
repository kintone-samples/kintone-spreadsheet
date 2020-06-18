# kintone spreadsheet plugin

## Description

You can view and edit the kintone list screen with the look of a spreadsheet like Excel.

![Image](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/image.gif)

[DEMO](https://dev-demo.cybozu.com/k/39/)  
[a description of the demo environment](https://cybozudev.zendesk.com/hc/ja/articles/208217653)  
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
1. [Import](https://help.cybozu.com/en/k/admin/plugin.html) to your kintone environment.
1. Configure plugin settings.

## How to Edit this plugin

If you want to extend or change the plugin itself, follow the procedure below.

1. Install [Node.js](https://nodejs.org/en/)
1. Install dependencies.
   `yarn install`
1. Create .env file based on .env.sample.
1. Build
   `yarn run build`

※[How to craete a kintone plugin](https://cybozudev.zendesk.com/hc/ja/articles/203455680-kintone-%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E9%96%8B%E7%99%BA%E6%89%8B%E9%A0%86)

### Develop mode

`yarn run watch`

### Testing

`yarn test`

## Author

[@mura-](https://www.facebook.com/kazuki.murahama)

## Other

- If you have any problems, please contact us view Issue or PullRequest them.

## License

MIT
