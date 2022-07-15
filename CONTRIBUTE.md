# [WIP]SaltDog

## Not Test Functions

-   pdfPreloads/pdfApi
-   pluginHostPreload/pluginApi/webview add/removeEventListener

## Project setup

```
yarn install
```

### Before Compile

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```

### Commit message

```
feat：新功能（feature）
fix：修补bug
docs：文档（documentation）
style： 格式（不影响代码运行的变动）
refactor：重构（即不是新增功能，也不是修改bug的代码变动）
test：增加测试
chore：构建过程或辅助工具的变动
```

### hints

-   为啥要"vue-cli-plugin-electron-builder": "git+https://github.com/nklayman/vue-cli-plugin-electron-builder.git"
    官方 npm 不更新了，在 Mac 12.3 以上 build 要最新的electron-builder@23.0.3+

### DB schemas

-   itemAttachments 里面 syncStat -1 代表正在下载 0 代表正常 -2 下载失败
-   itemTag 里面 type 1 自动生成 2 用户标记
