# kintone 电子表格

[日本語 Readme](https://github.com/mura-/kintone-spreadsheet/blob/master/README.md)  
[English Readme](https://github.com/mura-/kintone-spreadsheet/blob/master/README-en.md)

## Description

可使 kintone 列表页面看起来像 Excel 的电子表格，并可在上面直接查看及编辑。

![图片](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/image.gif)

[DEMO](https://dev-demo.cybozu.com/k/39/)  
关于演示环境的介绍请参考[这里](https://cybozudev.zendesk.com/hc/ja/articles/208217653)  
（DEMO 仅可尝试操作电子表格。不可设置）

## Features

- 可对 kintone 应用里的任意字段进行设置
- 设置后的字段可显示在电子表格里，并可对记录进行编辑、添加及删除。
- 可支持下拉框字段和单选框字段  
  ![图片](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/dropdown.gif)
- 可支持用户字段和复选框字段（仅可显示）
- 可支持 kintone 的搜索功能、翻页及排序

### Cautionary note

- 因为是同步处理，因此每 10 秒会刷新 1 次。
  可能会受到 API 使用次数的限制，不推荐长时间开着页面。

## Installation

1. [Download](https://github.com/mura-/kintone-spreadsheet/releases/)插件
1. [导入](https://help.cybozu.cn/k/zh/admin/system_customization/add_plugin/plugin.html)插件
1. 设置插件

## How to edit this plugin

如您自己想对插件进行扩展或更改，请参考以下步骤。

1. 安装[Node.js](https://nodejs.org/en/)
1. 下载插件中用到的各种库  
   `yarn install`
1. 在 .env.sample 的基础上做成 .env 文件
1. 编译  
   `yarn run build`

※关于插件的开发步骤请参考[这里](https://cybozudev.kf5.com/hc/kb/article/1000664/)

### 开发模式

每更改一次文件都需要逐一编译。  
`yarn run dev`

## Author

[@mura-](https://www.facebook.com/kazuki.murahama)

## Other

- 如发现有缺陷，请通过 ISSUE 联系我或 PR 我，非常感谢。

## License

MIT

## Copyright

Copyright(c) Cybozu, Inc.
