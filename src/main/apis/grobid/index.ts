import got from 'got-cjs';
import log from 'electron-log';
import { FormData, File } from 'formdata-node';
import { existsSync, writeFileSync, createFileSync, readFileSync, mkdirSync, readJSON } from 'fs-extra';
// @ts-ignore
import { fileFromPathSync } from 'formdata-node/lib/cjs/fileFromPath';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { createLoading, cancelLoading } from '../loading';
import SaltDogMessageChannelMain from '../plugin/api/messageChannel';
import path from 'path';
import converter from './dataConverter';
import { app } from 'electron';
import crypto from 'crypto';
// import { saveFRTImages } from './figureProc';
const TAG = '[Main/GrobidClient]';
enum GROBID_API {
    ISALIVE = '/isalive',
    FULLTEXT = '/process-fulltext-document',
    REFERENCES = '/process-references',
    ANNOTATE = '/annotate-pdf',
    ONESTEP = '/process-fulltext-document-one-step',
}
export class GrobidClient {
    private _host = 'https://saltdog.imztj.cn/api/v1/files';
    private _pendingReq = {};
    private _grobidCacheDir = path.resolve(app.getPath('userData'), '.gribidCache');
    constructor() {
        if (!existsSync(this._grobidCacheDir)) mkdirSync(this._grobidCacheDir, { recursive: true });
        SaltDogMessageChannelMain.getInstance().onInvoke('reader.getGrobidMarkerInfo', async (path) => {
            SaltDogMessageChannelMain.getInstance().execCommand('saltdog.showMessage', 'info', '正在解析文档，请稍后');
            let data = null;
            try {
                data = await this.getMarker(path);
            } catch (e) {
                data = null;
                SaltDogMessageChannelMain.getInstance().execCommand('saltdog.showMessage', 'error', '解析失败😭');
                throw e;
            }
            SaltDogMessageChannelMain.getInstance().execCommand('saltdog.showMessage', 'success', '解析成功😄');
            return data;
        });
        log.log('Grobid Client initialized.');
    }
    static getInstance() {
        if (!GrobidClient.instance) {
            GrobidClient.instance = new GrobidClient();
        }
        return GrobidClient.instance;
    }
    static instance: GrobidClient;
    async checkIsAlive() {
        const body = (await got.get(this._host + GROBID_API.ISALIVE)).body;
        return body === 'true';
    }
    public getMarker(file: string, saveResult = true) {
        return new Promise((resolve, reject) => {
            const md5 = crypto.createHash('md5').update(file).digest('hex');
            const cachefile = path.resolve(this._grobidCacheDir, md5 + '.json');
            if (existsSync(cachefile)) {
                console.log(TAG, 'Meet cachefile', cachefile, 'Skip getMarker...');
                readJSON(cachefile)
                    .then((json) => {
                        resolve(json);
                    })
                    .catch((e) => {
                        reject(e);
                    });
            }
            if (!existsSync(file)) {
                log.error('File not found: ' + file);
                reject(new Error('File not exist.'));
            }
            if (!pdfjs.isPdfFile(file)) {
                log.error('File is not a pdf file: ' + file);
                reject(new Error('File is not a pdf file.'));
            }
            pdfjs.GlobalWorkerOptions.workerSrc = path.resolve(__static, 'scripts/pdf.worker.js');
            pdfjs
                .getDocument(readFileSync(file))
                .promise.then(async (pdf) => {
                    log.log(TAG, 'Target pdf file page number:', pdf.numPages);
                    if (pdf.numPages > 40) {
                        SaltDogMessageChannelMain.getInstance().execCommand(
                            'saltdog.showNotification',
                            'warning',
                            '无法智能解析该文件',
                            '该文件过长，SaltDog暂时只支持50页以下的文件。'
                        );
                    }
                    const form = new FormData();
                    // const file = fs.readFileSync('F:\\研究生\\论文\\fpga\\a.pdf');
                    // console.log('readfile', fileFromPathSync(file));
                    form.append('file', fileFromPathSync(file));
                    form.append('consolidateHeader', '1');
                    form.append('consolidateCitations', '1');
                    form.append('includeRawCitations', '1');
                    form.append('includeRawAffiliations', '1');
                    form.append('segmentSentences', '1');
                    form.append('teiCoordinates', 'ref');
                    form.append('teiCoordinates', 'biblStruct');
                    form.append('teiCoordinates', 'persName');
                    form.append('teiCoordinates', 'figure');
                    form.append('teiCoordinates', 'formula');
                    form.append('teiCoordinates', 'head');
                    form.append('teiCoordinates', 's');

                    log.log(TAG, 'Requesting Grobid server');
                    createLoading({
                        id: 'parsePDF_' + file,
                        name: '智能解析中',
                        percent: 0,
                        cancelCmd: 'cancelParsePDF_' + file,
                    });
                    this._pendingReq[file] = got
                        .post(this._host + GROBID_API.FULLTEXT, {
                            body: form,
                            timeout: {
                                request: 60000,
                            },
                        })
                        .json();
                    this._pendingReq[file]
                        .then((res: any) => {
                            const dir = this._grobidCacheDir;
                            res = converter(res);
                            // log.log(TAG, 'Grobid result arrived', res);
                            cancelLoading('parsePDF_' + file);
                            if (saveResult) {
                                createFileSync(path.resolve(dir, md5 + '.json'));
                                writeFileSync(path.resolve(dir, md5 + '.json'), JSON.stringify(res));
                            }
                            // saveFRTImages(res, file, dir).catch((e) => {
                            //     log.error(TAG, 'saveFRTImages error', e);
                            // });
                            resolve(res);
                        })
                        .catch((err: any) => {
                            cancelLoading('parsePDF_' + file);
                            log.error(TAG, 'requesting grobid server error', err);
                            SaltDogMessageChannelMain.getInstance().execCommand(
                                'saltdog.showNotification',
                                'warning',
                                '文献智能解析失败',
                                err.message || '请稍后重试'
                            );
                        });
                })
                .catch((e: any) => {
                    log.error(TAG, 'pdfjs parse error', e);
                    SaltDogMessageChannelMain.getInstance().execCommand(
                        'saltdog.showNotification',
                        'error',
                        '文献智能解析失败',
                        '目标文件格式损坏'
                    );
                });
        });
    }
}
export default new GrobidClient();
