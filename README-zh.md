# kintone 电子表格

## Description

可使kintone列表页面看起来像Excel的电子表格，并可在上面直接查看及编辑。
现在正在开发新版。

旧版本在[这里](https://github.com/mura-/kintone-spreadsheet-no-longer-maintained)
※下面是旧版本的Description。另外，新版中还未将旧版本的功能都加进去，如现在想要试用一下，请用旧版本。

---

## Description

可使kintone列表页面看起来像Excel的电子表格，并可在上面直接查看及编辑。
当前是测试版。

![图片](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/image.gif)

[DEMO](https://dev-demo.cybozu.com/k/39/)   
关于演示环境的介绍请参考[这里](https://cybozudev.zendesk.com/hc/ja/articles/208217653)  
（DEMO仅可尝试操作电子表格。不可设置）  

## Features

- 可对kintone应用里的任意字段进行设置
- 设置后的字段可显示在电子表格里，并可对记录进行编辑、添加及删除。
- 可支持下拉框字段和单选框字段  
![图片](https://raw.githubusercontent.com/mura-/kintone-spreadsheet-no-longer-maintained/master/dropdown.gif)
- 可支持用户字段和复选框字段（仅可显示）
- 可支持kintone的搜索功能、翻页及排序

### Cautionary note
- 因为是同步处理，因此每10秒会刷新1次。
  可能会受到API使用次数的限制，不推荐长时间开着页面。

## Usage
1. [Download](https://github.com/mura-/kintone-spreadsheet-no-longer-maintained/releases/)插件
1. [导入](https://help.cybozu.com/ja/k/admin/plugin.html)插件
1. 设置插件

## Installation
如您自己想对插件进行扩展或更改，请参考以下步骤。

1. 安装[Node.js](https://nodejs.org/en/)
1. 下载插件中用到的各种库  
  `npm install`
1. 更改设置文件
  1. `cp gulp/config.js.sample gulp/config.js`
  1. 编辑`gulp/config.js` 内的 `plugin.compiler` 的值和 `plugin.key` 的值。  
1. 编译  
  `npm run build`

※关于插件的开发步骤请参考[这里](https://cybozudev.zendesk.com/hc/ja/articles/203455680-kintone-%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E9%96%8B%E7%99%BA%E6%89%8B%E9%A0%86)

### 开发模式
每更改一次文件都需要逐一编译。  
`npm run dev`

### 测试的实施情况
当前仅对效用函数进行了测试。  
`npm test`

## Author

[@mura-](https://www.facebook.com/kazuki.murahama)

## Other
- 如发现有缺陷，请通过ISSUE联系我或PR我，非常感谢。

## License

MIT
