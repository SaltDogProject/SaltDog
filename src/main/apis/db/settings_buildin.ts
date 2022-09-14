export default {
    preferences: {
        title: '首选项',
        subGroup: [
            {
                title: '网络',
                children: {
                    allowNetworkProxy: {
                        title: '允许网络代理',
                        desc: '允许使用网络代理',
                        type: 'boolean',
                        id: 'preferences.allowNetworkProxy',
                        value: false,
                    },
                    httpProxyAddress: {
                        title: 'HTTP代理服务器地址',
                        desc: '设置SaltDog内部请求的HTTP网络代理服务器地址与端口,如：http://127.0.0.1:1234',
                        type: 'text',
                        id: 'preferences.httpProxyAddress',
                    },
                    httpsProxyAddress: {
                        title: 'HTTPS代理服务器地址',
                        desc: '设置SaltDog内部请求的HTTPS网络代理服务器地址与端口,如：http://127.0.0.1:1234',
                        type: 'text',
                        id: 'preferences.httpsProxyAddress',
                    },
                },
            },
            {
                title: '自动更新',
                children: {
                    loginOnStart: {
                        title: '自动检查更新',
                        desc: '在开启程序时自动检查更新',
                        type: 'boolean',
                        id: 'preferences.autoCheckUpdate',
                        value: true,
                    },
                    welcomeMessage: {
                        title: '更新服务器地址',
                        desc: 'SaltDog获取更新的服务器位置',
                        type: 'text',
                        id: 'preferences.updateURL',
                        value: 'https://saltdog.oss-cn-hangzhou.aliyuncs.com/versions/',
                    },
                },
            },
        ],
    },
    workspace: {
        title: '工作区',
        subGroup: [
            {
                title: '常规',
                children: {
                    loginOnStart: {
                        title: '开机自启',
                        desc: 'SaltDog是否随开机自启动',
                        type: 'boolean',
                        id: 'preferences.loginOnStart',
                    },
                    welcomeMessage: {
                        title: '欢迎信息',
                        desc: '每次点开时显示的用户昵称',
                        type: 'text',
                        id: 'preferences.welcomeMessage',
                    },
                },
            },
            {
                title: '文件夹设置',
                children: {
                    mainDir: {
                        title: '主存储文件夹',
                        desc: 'SaltDog监听的主要下载文件夹',
                        type: 'text',
                        id: 'workspace.mainDir',
                    },
                },
            },
        ],
    },
    plugins: {
        title: '插件',
        subGroup: [
            {
                title: '通用',
                children: {
                    allowNpmmirror: {
                        title: '启用NPM镜像',
                        desc: '允许使用NPM镜像',
                        type: 'boolean',
                        id: 'plugin.allowNpmmirror',
                        value: false,
                    },
                    npmmirror: {
                        title: 'NPM镜像地址',
                        desc: 'NPM镜像地址',
                        type: 'text',
                        id: 'plugin.npmmirror',
                    },
                },
            },
        ],
    },
};
