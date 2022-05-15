const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
// vm2要求的webpack版本较高，不能用当前目录下的webpack，要求5.17+ 在这里用全局的，手动指定路径
// const webpack = require('C:\\Users\\Dorapocket\\AppData\\Local\\Yarn\\Data\\global\\node_modules\\webpack');
// pluginHost js don't need compile
// copyFolder('../src/main/apis/plugin/preload', '../public/plugin/preload');
// webviews preload don't need compile
// if (fs.existsSync(path.join(__dirname, '../public/sidebar'))) deleteFolder('../public/sidebar');
// copyFolder('../src/renderer/workspaceWindow/components/sidebar/basic', '../public/sidebar');
// webpack(
//     {
//         entry: path.join(__dirname, '../public/preloads/pdfPreload/preload.js'),
//         output: {
//             path: path.join(__dirname, '../public/preloads/pdfPreload/build'),
//             filename: 'preload.js',
//         },
//         resolve: {
//             extensions: ['.js', '.ts', '.json'],
//         },
//         devtool: 'source-map', // 打包出的js文件是否生成map文件（方便浏览器调试）
//         mode: 'production',
//         target: 'node',
//     },
//     (err, stats) => {
//         if (err || stats.hasErrors()) {
//             console.error('[Prebuild] Build pdfPreload/preload.js failed.', err, stats);
//         } else {
//             console.log('[Prebuild] Build pdfPreload/preload.js successfully.');
//         }
//     }
// );
// webpack(
//     {
//         entry: path.join(__dirname, '../public/preloads/pluginWebviewPreload/preload.js'),
//         output: {
//             path: path.join(__dirname, '../public/preloads/pluginWebviewPreload/build'),
//             filename: 'preload.js',
//         },
//         resolve: {
//             extensions: ['.js', '.ts', '.json'],
//         },
//         devtool: 'source-map', // 打包出的js文件是否生成map文件（方便浏览器调试）
//         mode: 'production',
//         target: 'node',
//     },
//     (err, stats) => {
//         if (err || stats.hasErrors()) {
//             console.error('[Prebuild] Build pluginWebviewPreload/preload.js failed.', err, stats);
//         } else {
//             console.log('[Prebuild] Build pluginWebviewPreload/preload.js successfully.');
//         }
//     }
// );
// webpack(
//     {
//         entry: path.join(__dirname, '../public/preloads/pluginHostPreload/preload.js'),
//         output: {
//             path: path.join(__dirname, '../public/preloads/pluginHostPreload/build'),
//             filename: 'preload.js',
//         },
//         resolve: {
//             extensions: ['.js', '.ts', '.json'],
//         },
//         // vm2 requires
//         module:{
//             parser:{
//                 javascript:{
//                     commonjsMagicComments:true,
//                 }
//             }
//         },
//         optimization:{
//             minimize:true,
//         },
//         devtool: 'source-map', // 打包出的js文件是否生成map文件（方便浏览器调试）
//         mode: 'production',
//         target: 'node',
//     },
//     (err, stats) => {
//         if (err || stats.hasErrors()) {
//             console.error('[Prebuild] Build pluginHostPreload/preload.js failed.', err, stats);
//         } else {
//             console.log('[Prebuild] Build pluginHostPreload/preload.js successfully.');
//         }
//     }
// );

function copyFile(src, dist) {
    fs.writeFileSync(path.join(__dirname, dist), fs.readFileSync(path.join(__dirname, src)));
}

function copyFolder(copiedPath, resultPath, direct) {
    if (!direct) {
        copiedPath = path.join(__dirname, copiedPath);
        resultPath = path.join(__dirname, resultPath);
    }

    function createDir(dirPath) {
        fs.mkdirSync(dirPath);
    }

    if (fs.existsSync(copiedPath)) {
        createDir(resultPath);
        /**
         * @des 方式一：利用子进程操作命令行方式
         */
        // child_process.spawn('cp', ['-r', copiedPath, resultPath])

        /**
         * @des 方式二：
         */
        const files = fs.readdirSync(copiedPath, { withFileTypes: true });
        for (let i = 0; i < files.length; i++) {
            const cf = files[i];
            const ccp = path.join(copiedPath, cf.name);
            const crp = path.join(resultPath, cf.name);
            if (cf.isFile()) {
                /**
                 * @des 创建文件,使用流的形式可以读写大文件
                 */
                const readStream = fs.createReadStream(ccp);
                const writeStream = fs.createWriteStream(crp);
                readStream.pipe(writeStream);
            } else {
                try {
                    /**
                     * @des 判断读(R_OK | W_OK)写权限
                     */
                    fs.accessSync(path.join(crp, '..'), fs.constants.W_OK);
                    copyFolder(ccp, crp, true);
                } catch (error) {
                    console.error('folder write error:', error);
                }
            }
        }
    } else {
        console.log('do not exist path: ', copiedPath);
    }
}
/**
 * @param { delPath：String } （需要删除文件的地址）
 * @param { direct：Boolean } （是否需要处理地址）
 */
function deleteFile(delPath, direct) {
    delPath = direct ? delPath : path.join(__dirname, delPath);
    try {
        /**
         * @des 判断文件或文件夹是否存在
         */
        if (fs.existsSync(delPath)) {
            fs.unlinkSync(delPath);
        } else {
            console.log('inexistence path：', delPath);
        }
    } catch (error) {
        console.log('del error', error);
    }
}

function deleteFolder(delPath) {
    delPath = path.join(__dirname, delPath);

    try {
        if (fs.existsSync(delPath)) {
            const delFn = function (address) {
                const files = fs.readdirSync(address);
                for (let i = 0; i < files.length; i++) {
                    const dirPath = path.join(address, files[i]);
                    if (fs.statSync(dirPath).isDirectory()) {
                        delFn(dirPath);
                    } else {
                        deleteFile(dirPath, true);
                    }
                }
                /**
                 * @des 只能删空文件夹
                 */
                fs.rmdirSync(address);
            };
            delFn(delPath);
        } else {
            console.log('do not exist: ', delPath);
        }
    } catch (error) {
        console.log('del folder error', error);
    }
}
