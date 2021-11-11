const fs = require('fs');
const path = require('path');
var exec = require('child_process').exec;
let buildCmd = 'cd third_party/pdf.js && gulp generic';
console.log('[Build-pdf] Building pdf.js...');
exec(buildCmd, function (error, stdout, stderr) {
    // 打印错误堆栈
    if (error) {
        console.log(error.stack);
        console.log('[Build-pdf error]: ' + stderr);
    }
    console.log('[Build-pdf]: ' + stdout);
    deleteFolder('../public/pdfviewer/build');
    deleteFolder('../public/pdfviewer/web');
    copyFolder('../third_party/pdf.js/build/generic/build', '../public/pdfviewer/build');
    copyFolder('../third_party/pdf.js/build/generic/web', '../public/pdfviewer/web');
    console.log('[Build-pdf] Success');
});

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
