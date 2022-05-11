const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir);
}
const arch = process.argv.includes('--ia32') ? 'ia32' : 'x64';
const config = {
    pages: {
        entry: {
            entry: 'src/renderer/entryWindow/main.ts',
            template: 'public/index.html',
            filename: 'entry.html',
            title: 'SaltDog-Entry',
        },
        workspace: {
            entry: 'src/renderer/workspaceWindow/main.ts',
            template: 'public/index.html',
            filename: 'workspace.html',
            title: 'SaltDog-Workspace',
        },
        pluginhost: {
            entry: 'src/pluginHost/main.ts',
            template: 'public/index.html',
            filename: 'pluginhost.html',
            title: 'SaltDog-PluginHost',
        },
        // pdfviewer: {
        //     entry: 'src/renderer/webviews/pdfviewer/viewer.js',
        //     template: 'src/renderer/webviews/pdfviewer/viewer.html',
        //     filename: 'pdfviewer.html',
        //     title: 'SaltDog-Viewer',
        // },
    },
    // configureWebpack: (config) => {
    //     // FIXME: debug mode 不去掉build会出错
    //     config.devtool = 'cheap-module-eval-source-map';

    //     return config;
    // },
    chainWebpack: (config) => {
        config.resolve.alias
            .set('@', resolve('src/renderer'))
            .set('~', resolve('src'))
            .set('root', resolve('./'))
            .set('#', resolve('utils'));
        config.externals = {
            'better-sqlite3': 'commonjs better-sqlite3',
        };
        // build web
        // config.entry('entryWindow').add('src/renderer/entryWindow/main.ts').end().output.filename('entryWindow.js');
        // config
        //     .entry('workspaceWindow')
        //     .add('src/renderer/workspacWindow/main.ts')
        //     .end()
        //     .output.filename('workspacWindow.js');
    },
    pluginOptions: {
        electronBuilder: {
            externals: ['better-sqlite3'],
            customFileProtocol: './',
            // customFileProtocol: 'saltdog://./',
            // externals: ['saltdog'],
            chainWebpackMainProcess: (config) => {
                config.resolve.alias
                    .set('@', resolve('src/renderer'))
                    .set('~', resolve('src'))
                    .set('root', resolve('./'));
            },
            chainWebpackRendererProcess: (config) => {
                config.resolve.alias
                    .set('@', resolve('src/renderer'))
                    .set('~', resolve('src'))
                    .set('root', resolve('./'));
            },
            mainProcessFile: 'src/background.ts',
            outputDir: 'saltdog_electron',
            nodeIntegration: true,
            builderOptions: {
                electronDownload: {
                    mirror: 'https://npm.taobao.org/mirrors/electron',
                },
                appId: 'top.lgyserver.saltdog',
                productName: 'SaltDog',
                copyright: 'Copyright © 2021 Dorapocket',
                publish: [
                    {
                        provider: 'github',
                        owner: 'Dorapocket',
                        repo: 'SaltDog',
                        // FIXME: "draft" | "prerelease" | "release" | null build时候去掉
                        releaseType: 'prerelease',
                    },
                ],
                directories: {
                    output: './saltdog_dist',
                },
                // FIXME: icons
                // dmg: {
                //     contents: [
                //         {
                //             x: 410,
                //             y: 150,
                //             type: 'link',
                //             path: '/Applications',
                //         },
                //         {
                //             x: 130,
                //             y: 150,
                //             type: 'file',
                //         },
                //     ],
                // },
                mac: {
                    icon: './public/images/logo.ico',

                    extendInfo: {
                        CFBundleURLSchemes: ['saltdog'],
                        LSUIElement: 1,
                    },
                },
                win: {
                    icon: './public/images/logo.ico',
                    artifactName: `SaltDog Setup \${version}-${arch}.exe`,
                    target: [
                        {
                            target: 'nsis',
                            arch: [arch],
                        },
                    ],
                },
                nsis: {
                    // https://www.jianshu.com/p/1701baa240fd
                    oneClick: false,
                    perMachine: true,
                    allowElevation: true,
                    allowToChangeInstallationDirectory: true,
                    installerIcon: './public/images/logo.ico',
                    uninstallerIcon: './public/images/logo.ico',
                    installerHeaderIcon: './public/images/logo.ico',
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    shortcutName: 'SaltDog',
                },
                // linux: {
                //     icon: 'build/icons/',
                // },
                snap: {
                    publish: ['github'],
                },
            },
        },
    },
    productionSourceMap: false,
};
if (process.env.NODE_ENV === 'development') {
    config.configureWebpack = {
        devtool: 'source-map',
    };
    // for dev main process hot reload
    config.pluginOptions.electronBuilder.mainProcessWatch = ['src/main/**/*'];
}
module.exports = {
    ...config,
};
