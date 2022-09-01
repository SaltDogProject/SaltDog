<div align="center">
  <img src="https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/public/images/logo.png" alt="">
  <h1>SaltDog</h1>
  <blockquote>强大的科研文献一站式管理工具</blockquote>
  <a href="https://github.com/SaltDogProject/SaltDog/actions">
    <img src="https://img.shields.io/badge/code%20style-standard-green.svg?style=flat-square" alt="">
  </a>
  <a href="https://github.com/SaltDogProject/SaltDog/actions">
    <img src="https://github.com/SaltDogProject/SaltDog/actions/workflows/main.yml/badge.svg" alt="">
  </a>
  <a href="https://github.com/SaltDogProject/SaltDog/releases">
    <img src="https://img.shields.io/github/downloads/SaltDogProject/SaltDog/total.svg?style=flat-square" alt="">
  </a>
  <a href="https://github.com/SaltDogProject/SaltDog/releases/latest">
    <img src="https://img.shields.io/github/release/SaltDogProject/SaltDog.svg?style=flat-square" alt="">
  </a>
</div>

> SaltDog 目前还处于积极开发中，功能可能还不完善。大家觉得有想要的功能欢迎提 issue，更欢迎一起参与开发本体/插件。

## 概述

**SaltDog(嗑盐狗): 是一个科研文献阅读+管理的新工具**

-   基于 Electron 开发，在 Linux、macOS、Windows 上保持同步体验
-   支持多种科研文献网站的元数据获取与识别，并可以联网实时获取更新
-   内置基于 mozilla/pdf.js 自研的阅读器[SDPDFCore](https://github.com/SaltDogProject/SDPDFCore)，支持文献批注、摘要搜索等
-   智能的论文结构分析、图表提取、图表悬停提示、引文提取等功能
-   (尚不稳定)强大的插件系统。参照 vscode api 设计，使插件的开发更为简单和便捷。对应的插件支持包[saltdog_npm](https://github.com/SaltDogProject/saltdog_npm)提供了代码提示等多种功能。内置基于 NPM 的插件安装商店，让插件的开发和发布更为自由（插件文档正在编写中）
-   更多便捷功能等待您去探索！或加入开发 SaltDog 本体/插件，共同学习与进步

## 安装

进入[Release](https://github.com/SaltDogProject/SaltDog/releases)页面获取安装程序

-   Windows 用户请下载最新版本的 `exe` 文件。
-   macOS 用户请下载最新版本的 `dmg` 文件。
-   Windows 用户请下载最新版本的 `AppImage` 文件。

我们为中国大陆用户还提供了国内镜像，用于后续的软件更新分发。当更新可用时，您可以按照 SaltDog 内的提示进行应用升级。

## 截图

### 主页

![main](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/main.png)

### 文献管理

![library](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/library.png)
![import](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/import.png)
![info](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/info.png)

### 插件

![plugin](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/plugin.png)
![pluginInstall](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/plugininstall.png)

### 阅读

![search](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/search.png)
![bibs](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/bibs.png)
![tables](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/tables.png)
![figures](https://raw.githubusercontent.com/SaltDogProject/SaltDog/main/.imgs/figures.png)

## 构建指南

推荐使用 `yarn` 构建 Saltdog,若您没有使用 yarn,请先安装：`npm install yarn -g`

```
git clone https://github.com/SaltDogProject/SaltDog.git
cd SaltDog
yarn install
yarn dev
```

由于 pdfjs-dist 使用了[node-canvas](https://github.com/Automattic/node-canvas#compiling), 若您的操作系统在编译时出现 canvas 包相关的错误，您可能需要从源码重新编译该包，相见 node-canvas [Compiling](https://github.com/Automattic/node-canvas#compiling)。我们也提供了在某些系统环境下的 prebuild 文件，参见/prebuilds

## 提交规范

详见 [CONTRIBUTE.md](https://github.com/SaltDogProject/SaltDog/blob/main/CONTRIBUTE.md)

## 其他

-   SaltDog 公共解析后端 [saltdog-be](https://github.com/SaltDogProject/saltdog-be)
-   SaltDog NPM 插件类型定义文件 [saltdog_npm](https://github.com/SaltDogProject/saltdog_npm)
-   SaltDog 内置 PDF 阅读器 [SDPDFCore](https://github.com/SaltDogProject/SDPDFCore)

## License

[GPL v3.0](https://opensource.org/licenses/GPL-3.0)

Copyright (c) 2021 - 2022 Dorapocket
