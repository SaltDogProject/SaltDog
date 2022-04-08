export default {
    preferences: {
        title: '首选项',
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
                        value: '121',
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
        subGroup: [],
    },
};
