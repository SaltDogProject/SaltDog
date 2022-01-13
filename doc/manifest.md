# Manifest 文件

**Saltdog 内部识别路径：${app.getPath('userData')}/SaltDogPlugins/saltdogplugin_${PLUGIN_NAME}/manifest.json**

## 结构

-   name：插件名称
-   version：插件版本
-   description：插件描述
-   author：作者
-   contributes：
    -   viewsContainers：array
        -   activitybar：Object 左侧大图标
        -   id: string
        -   icon: string
    -   views：array 视图 webview 描述
    -   name: string
    -   src: string
