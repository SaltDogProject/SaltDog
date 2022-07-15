import { app } from 'electron';
import { mkdirSync, existsSync, writeFile, stat, Stats, rmdir, readFileSync } from 'fs-extra';
import { extend } from 'lodash';
import * as path from 'path';
import log from 'electron-log';
import got, { Method } from 'got';
import md5 from 'md5-file';
import { readFile } from 'licia/fs';
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
        let defaultOptions = {
            method: 'GET' as Method,
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                referer: targetURL.protocol + '//' + targetURL.hostname,
            },
        };
        if (options) {
            defaultOptions = extend(defaultOptions, options);
        }
        return new Promise((resolve, reject) => {
            got(url, defaultOptions)
                .then((response) => {
                    this.createFile(dirKey, filename, response.rawBody)
                        .then((stats) => {
                            resolve(stats);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                })
                .catch((err) => {
                    log.error(TAG, 'download Error', err);
                    reject(err);
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
