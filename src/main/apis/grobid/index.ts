import got from 'got-cjs';
import log from 'electron-log';
import { FormData, File } from 'formdata-node';
import { existsSync } from 'fs-extra';
// @ts-ignore
import { fileFromPathSync } from 'formdata-node/lib/cjs/fileFromPath';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
const TAG = '[Main/GrobidClient]';
enum GROBID_API {
    ISALIVE = '/isalive',
    MARKER = '/reference-annotations',
    FULLTEXT = '/process-fulltext-document',
    REFERENCES = '/process-references',
    ANNOTATE = '/annotate-pdf',
    ONESTEP = '/process-fulltext-document-one-step',
}
export class GrobidClient {
    private _host = 'https://saltdog.imztj.cn/api/v1/files';
    constructor() {
        log.log('Grobid Client initialized.');
    }
    async checkIsAlive() {
        const body = (await got.get(this._host + GROBID_API.ISALIVE)).body;
        return body === 'true';
    }
    async getMarker(
        file: string,
        consolidateCitations: 0 | 1 | 2 = 1,
        includeRawCitations: 0 | 1 = 1,
        includeFiguresTables: 0 | 1 = 1
    ) {
        if (!existsSync(file)) {
            log.error('File not found: ' + file);
            throw new Error('File not exist.');
        }
        if (!pdfjs.isPdfFile(file)) {
            log.error('File is not a pdf file: ' + file);
            throw new Error('File is not a pdf file.');
        }
        // TODO: 检查文件大小，不能超过40页
        const form = new FormData();
        // const file = fs.readFileSync('F:\\研究生\\论文\\fpga\\a.pdf');
        // console.log('readfile', fileFromPathSync(file));
        form.set('file', fileFromPathSync(file));
        form.set('consolidateHeader', '0'.toString());
        form.set('consolidateCitations', '1'.toString());
        form.set('includeRawCitations', '1'.toString());
        form.set('includeFiguresTables', '1'.toString());

        const res = await got
            .post(this._host + GROBID_API.MARKER, {
                body: form,
            })
            .json();
        return res;
    }
}
