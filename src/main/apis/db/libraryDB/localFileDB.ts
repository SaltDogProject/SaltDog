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
import got, { Method, Options } from 'got';
import { HttpsProxyAgent, HttpProxyAgent } from 'hpagent';
import md5 from 'md5-file';
import { readFile } from 'licia/fs';
import stream from 'stream';
import { promisify } from 'util';
const pipeline = promisify(stream.pipeline);
import { createLoading, cancelLoading } from '../../loading';
import sysCfg from '../index';
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
        let defaultOptions: Options = {
            method: 'GET' as Method,
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                referer: targetURL.protocol + '//' + targetURL.hostname,
            },
            isStream: true,
        };
        if (sysCfg.get('preferences.allowNetworkProxy')) {
            log.debug(TAG, 'Download using proxy.');
            const httpsProxy = sysCfg.get('preferences.httpsProxyAddress') || null;
            const httpProxy = sysCfg.get('preferences.httpProxyAddress') || null;
            if (targetURL.protocol === 'https:' && httpsProxy) {
                log.debug(TAG, 'Using https proxy.', httpsProxy);
                defaultOptions.agent = {
                    https: new HttpsProxyAgent({
                        keepAlive: true,
                        keepAliveMsecs: 1000,
                        maxSockets: 256,
                        maxFreeSockets: 256,
                        scheduling: 'lifo',
                        proxy: httpsProxy,
                    }),
                };
            } else if (targetURL.protocol === 'http:' && httpProxy) {
                log.debug(TAG, 'Using http proxy.', httpsProxy);
                defaultOptions.agent = {
                    http: new HttpProxyAgent({
                        keepAlive: true,
                        keepAliveMsecs: 1000,
                        maxSockets: 256,
                        maxFreeSockets: 256,
                        scheduling: 'lifo',
                        proxy: httpProxy,
                    }),
                };
            }
        }
        if (options) {
            defaultOptions = extend(defaultOptions, options);
        }
        createLoading({
            id: 'downloadPDF_' + dirKey + '_' + filename,
            name: '????????????',
            percent: 0,
            cancelCmd: 'cancelDownloadPDF_' + filename,
        });
        return new Promise((resolve, reject) => {
            // @ts-ignore
            const downloadStream = got.stream(url, defaultOptions);
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
                    name: `????????????(${percentage}%)`,
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
                    cancelLoading('downloadPDF_' + filename);
                    log.error(TAG, 'download Error', error);
                    reject('????????????' + error.message || '');
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
}
