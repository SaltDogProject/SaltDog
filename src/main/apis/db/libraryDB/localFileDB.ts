import { app } from 'electron';
import {
    mkdirSync,
    existsSync,
    writeFile,
    stat,
    Stats,
    rmdir,
    readFileSync,
    createWriteStream,
    createFileSync,
    unlinkSync,
} from 'fs-extra';
import { extend, throttle } from 'lodash';
import * as path from 'path';
import log from 'electron-log';
import got, { Method, Options } from 'got-cjs';
import md5 from 'md5-file';
import { readFile } from 'licia/fs';
import stream from 'stream';
import { promisify } from 'util';
const pipeline = promisify(stream.pipeline);
import { createLoading, cancelLoading } from '../../loading';
import sysCfg from '../index';
import SaltDogMessageChannelMain from '../../plugin/api/messageChannel';
import { getGotOptions } from '../../../utils/network';
const TAG = '[Main/DB/localFileDB]';
export type LocalFileDesc = {
    md5: string;
    stats: Stats;
    path: string;
};
export class LocalFileDB {
    private _root = app.getPath('userData');
    constructor(filePath: string = app.getPath('userData')) {
        if (filePath) {
            this._root = filePath;
        }
        SaltDogMessageChannelMain.getInstance().onInvoke('library.getFileDirByKey', async (localKey: any) => {
            return path.resolve(this._root, localKey);
        });
        mkdirSync(filePath, { recursive: true });
    }
    public createFile(dirKey: string, filename: string, data: Buffer): Promise<LocalFileDesc> {
        const dirPath = path.resolve(this._root, dirKey);
        return new Promise((resolve, reject) => {
            if (!existsSync(dirPath)) {
                mkdirSync(dirPath);
            }
            const filePath = path.resolve(dirPath, filename);
            writeFile(filePath, data, (err) => {
                if (err) {
                    log.error(TAG, 'createFile Error', err);
                    reject(err);
                }
                stat(filePath).then((stats) => {
                    resolve({
                        stats,
                        path: filePath,
                        md5: md5.sync(filePath),
                    });
                    // https://www.nodeapp.cn/fs.html#fs_class_fs_stats
                });
            });
        });
    }

    public downloadAndSave(dirKey: string, filename: string, url: string, options?: any): Promise<LocalFileDesc> {
        const targetURL = new URL(url);
        createLoading({
            id: 'downloadPDF_' + dirKey + '_' + filename,
            name: '文献下载',
            percent: 0,
            cancelCmd: 'cancelDownloadPDF_' + filename,
        });
        return new Promise((resolve, reject) => {
            // @ts-ignore
            const downloadStream = got.stream(getGotOptions(targetURL, options));
            const fpath = path.resolve(this._root, dirKey, filename);
            if (existsSync(fpath)) {
                unlinkSync(fpath);
            }
            createFileSync(fpath);
            const fileWriterStream = createWriteStream(path.resolve(this._root, dirKey, filename));
            downloadStream.on('downloadProgress', ({ transferred, total, percent }) => {
                const percentage = Math.round(percent * 100);
                const tloading = throttle(createLoading, 500);
                tloading({
                    id: 'downloadPDF_' + dirKey + '_' + filename,
                    name: `文献下载(${percentage}%)`,
                    percent: percentage,
                    cancelCmd: 'cancelDownloadPDF_' + filename,
                });
            });
            pipeline(downloadStream, fileWriterStream)
                .then(() => {
                    cancelLoading('downloadPDF_' + dirKey + '_' + filename);
                    stat(fpath).then((stats) => {
                        resolve({
                            stats,
                            path: fpath,
                            md5: md5.sync(fpath),
                        });
                        // https://www.nodeapp.cn/fs.html#fs_class_fs_stats
                    });
                })
                .catch((error) => {
                    cancelLoading('downloadPDF_' + dirKey + '_' + filename);
                    log.error(TAG, 'download Error', error);
                    SaltDogMessageChannelMain.getInstance().execCommand(
                        'saltdog.showMessage',
                        'error',
                        '下载失败' + error.message
                    );
                    reject(error);
                });
        });
    }

    public deleteItem(key: string): Promise<any> {
        const p = path.resolve(this._root, key);
        if (existsSync(p)) return rmdir(p, { recursive: true });
        else return Promise.resolve();
    }
    public bindLocalFile(key: string, filename: string, filePath: string): Promise<LocalFileDesc> {
        log.debug(TAG, 'bindLocalFile', key, filename, filePath);
        return new Promise((resolve, reject) => {
            this.createFile(key, filename, readFileSync(filePath))
                .then((stats) => {
                    resolve(stats);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    public async urlContentTypeTest(url: string) {
        log.log(TAG, 'Test URLs with OPTIONS request.');
        const res = await got(url, getGotOptions(new URL(url), { method: 'GET' }));
        // filter charset
        return res.headers['content-type'] ? res.headers['content-type'].split(';')[0] : 'text/html';
    }
}
