const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
// vm2要求的webpack版本较高，不能用当前目录下的webpack，要求5.17+ 在这里用全局的，手动指定路径
// const webpack = require('C:\\Users\\Dorapocket\\AppData\\Local\\Yarn\\Data\\global\\node_modules\\webpack');
// pluginHost js don't need compile
// teFolif (fs.existsSync(path.join(__dirname, '../public/plugin/preload'))) deleder('../public/plugin/preload');
// copyFolder('../src/main/apis/plugin/preload', '../public/plugin/preload');
// webviews preload don't need compile
// if (fs.existsSync(path.join(__dirname, '../public/sidebar'))) deleteFolder('../public/sidebar');
// copyFolder('../src/renderer/workspaceWindow/components/sidebar/basic', '../public/sidebar');
webpack(
    {
        entry: path.join(__dirname, '../public/preloads/pdfPreload/preload.js'),
        output: {
            path: path.join(__dirname, '../public/preloads/pdfPreload/build'),
            filename: 'preload.js',
        },
        resolve: {
            extensions: ['.js', '.ts', '.json'],
        },
        devtool: 'source-map', // 打包出的js文件是否生成map文件（方便浏览器调试）
        mode: 'production',
        target: 'node',
    },
    (err, stats) => {
        if (err || stats.hasErrors()) {
            console.error('[Prebuild] Build pdfPreload/preload.js failed.', err, stats);
        } else {
            console.log('[Prebuild] Build pdfPreload/preload.js successfully.');
        }
    }
);
webpack(
    {
        entry: path.join(__dirname, '../public/preloads/pluginWebviewPreload/preload.js'),
        output: {
            path: path.join(__dirname, '../public/preloads/pluginWebviewPreload/build'),
            filename: 'preload.js',
        },
        resolve: {
            extensions: ['.js', '.ts', '.json'],
        },
        devtool: 'source-map', // 打包出的js文件是否生成map文件（方便浏览器调试）
        mode: 'production',
        target: 'node',
    },
    (err, stats) => {
        if (err || stats.hasErrors()) {
            console.error('[Prebuild] Build pluginWebviewPreload/preload.js failed.', err, stats);
        } else {
            console.log('[Prebuild] Build pluginWebviewPreload/preload.js successfully.');
        }
    }
);
webpack(
    {
        entry: path.join(__dirname, '../public/preloads/pluginHostPreload/preload.js'),
        output: {
            path: path.join(__dirname, '../public/preloads/pluginHostPreload/build'),
            filename: 'preload.js',
        },
        resolve: {
            extensions: ['.js', '.ts', '.json'],
        },
        // vm2 requires
        module: {
            parser: {
                javascript: {
                    commonjsMagicComments: true,
                },
            },
        },
        optimization: {
            minimize: true,
        },
        devtool: 'source-map', // 打包出的js文件是否生成map文件（方便浏览器调试）
        mode: 'production',
        target: 'node',
    },
    (err, stats) => {
        if (err || stats.hasErrors()) {
            console.error('[Prebuild] Build pluginHostPreload/preload.js failed.', err, stats);
        } else {
            console.log('[Prebuild] Build pluginHostPreload/preload.js successfully.');
        }
    }
);
