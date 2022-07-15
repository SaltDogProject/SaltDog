import { ChildProcess, fork } from 'child_process';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import got from 'got';
import * as fs from 'fs';
import * as path from 'path';
import SaltDogMessageChannelMain from '../plugin/api/messageChannel';
// import pdfjs, { PDFDocumentProxy } from 'pdfjs-dist';
import log from 'electron-log';
const TAG = '[Main/parser]';
const isDev = process.env.NODE_ENV === 'development';
export default class Parser {
    private static _instance: Parser | null = null;
    private _isDev = process.env.NODE_ENV === 'development';
    private _serverPath = this._isDev
        ? path.resolve(__static, '../third_party/translation-server/src/server.js')
        : path.resolve(__static, 'dist/translation-server-build.js');
    // FIXME: download path
    private _downloadURL = 'https://github.com/SaltDogProject/translators/archive/refs/tags/0.0.1.zip';

    private _server: ChildProcess | null = null;
    public isServerReady = false;
    private _serverPort = 11804;
    private _pendingQuery: any = [];

    private _initConfig = {
        allowedOrigins: [], // CORS
        blacklistedDomains: [],
        deproxifyURLs: false, // Automatically try deproxified versions of URLs
        identifierSearchLambda: '', // Identifier search Lambda function for text search
        port: this._serverPort,
        host: '0.0.0.0', // host to listen on
        httpMaxResponseSize: 10, // Max size of requested response to load; triggers 400 ResponseSize error when exceeded
        textSearchTimeout: 5,
        translators: {
            'CrossrefREST.email': 'service@saltdog.cn', // Pass an email to Crossref REST API to utilize the faster servers pool
        },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/61.0 SaltDog/1.0',
        translatorsDirectory: path.resolve(__static, 'translators'),
    };
    constructor() {
        this.initParser();
    }
    public async initParser() {
        console.log(TAG, `Init Parser in ${this._serverPath}`);
        const worker = fork(this._serverPath, {});
        this._server = worker;
        worker.send({
            type: 'init',
            data: this._initConfig,
            translators: await this._loadTranslator(),
        });
        worker.on('message', (message: any) => {
            if (message.type === 'ready') {
                console.log(TAG, 'Receive server ready');
                for (const i in this._pendingQuery) {
                    this._pendingQuery[i]();
                }
                delete this._pendingQuery;
                this.isServerReady = true;
            }
        });
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new Parser();
        }
        return this._instance;
    }
    public _query(type: 'import' | 'web' | 'export' | 'search' | 'file', data: string) {
        return new Promise((resolve, reject) => {
            SaltDogMessageChannelMain.getInstance().invokePluginHost(
                '_beforeRetrieve',
                { type, data },
                ({ type, data }) => {
                    console.log(TAG, `Execute query ${type} with payload: ${data}`);

                    try {
                        const url = `http://127.0.0.1:${this._serverPort}/${type}`;
                        const res = got
                            .post(url, {
                                headers: {
                                    'Content-Type': 'text/plain',
                                },
                                body: data,
                            })
                            .json()
                            .then((res) => {
                                SaltDogMessageChannelMain.getInstance().invokePluginHost(
                                    '_afterRetrieve',
                                    JSON.parse(JSON.stringify(res)),
                                    (res) => {
                                        resolve(res);
                                    }
                                );
                            });
                    } catch (e) {
                        reject(e);
                    }
                }
            );
        });
    }

    public async query(type: 'import' | 'web' | 'export' | 'search' | 'file', data: string, callback: any) {
        if (type == 'file') {
            try {
                const doi = await this.extractID(data);
                if (doi.value) {
                    log.debug(TAG, 'DOI found: ' + doi.value);
                    type = 'search';
                    data = doi.value;
                }
            } catch (e) {
                log.warn(e);
            }
        }
        if (this.isServerReady) {
            this._query(type, data)
                .then((data) => {
                    callback(null, data);
                })
                .catch((e: any) => {
                    console.error(TAG, `Query Request Error`, e);
                    callback(e, null);
                });
        } else {
            this._pendingQuery.push(() => {
                this._query(type, data)
                    .then((data) => {
                        callback(null, data);
                    })
                    .catch((e: any) => {
                        console.error(TAG, `Query Request Error`, e);
                        callback(e, null);
                    });
            });
        }
    }
    private async _loadTranslator(update = false) {
        const translatorsDirPath = this._initConfig.translatorsDirectory;
        const cacheJSONPath = path.resolve(translatorsDirPath, '_cacheMeta.json');
        if (!update) {
            if (await new Promise((resolve) => fs.access(cacheJSONPath, (err) => resolve(!err)))) {
                console.log(TAG, 'Get metadata from cache');
                return JSON.parse(fs.readFileSync(cacheJSONPath, 'utf-8'));
            }
        }

        if (!(await new Promise((resolve) => fs.access(translatorsDirPath, (err) => resolve(!err))))) {
            throw new Error(
                'Translators directory ' +
                    translatorsDirPath +
                    ' is not ' +
                    'accessible. Please set this correctly in config.js.\n'
            );
        }

        const translatorFilePaths = (await new Promise((resolve, reject) =>
            fs.readdir(translatorsDirPath, (err, files) => (err ? reject(err) : resolve(files)))
        )) as any[];
        const translators: any[] = [];
        for (let filePath of translatorFilePaths) {
            if (filePath[0] === '.' || filePath.substr(filePath.length - 3) !== '.js') continue;
            filePath = path.resolve(translatorsDirPath, filePath);
            let data = (await new Promise((resolve, reject) =>
                fs.readFile(filePath, 'utf8', (err, data) => (err ? reject(err) : resolve(data)))
            )) as string;

            // Strip off byte order mark, if one exists
            if (data[0] === '\uFEFF') data = data.substr(1);

            // We assume lastUpdated is at the end to avoid running the regexp on more than necessary
            const lastUpdatedIndex = data.indexOf('"lastUpdated"');
            if (lastUpdatedIndex == -1) {
                console.log('Invalid or missing translator metadata JSON object in ' + filePath);
                continue;
            }

            // Add 50 characters to clear lastUpdated timestamp and final "}"
            const header = data.substr(0, lastUpdatedIndex + 50);
            const infoRe = /^\s*{[\S\s]*?}\s*?[\r\n]/;
            const m = infoRe.exec(header);
            if (!m) {
                console.log('Invalid or missing translator metadata JSON object in ' + filePath);
                continue;
            }

            const metadataString = m[0];
            let info;
            try {
                info = JSON.parse(metadataString);
            } catch (e) {
                console.log('Invalid or missing translator metadata JSON object in ' + filePath);
                continue;
            }
            info.cacheCode = false;
            info.localPath = filePath;
            // info.code = data;
            // We don't ever want to reload from disk again (and don't have the code to do that either)
            // info.cacheCode = true;

            translators.push(info);
        }

        new Promise((resolve, reject) => {
            if (fs.existsSync(cacheJSONPath)) {
                fs.unlinkSync(cacheJSONPath);
            }
            fs.writeFile(cacheJSONPath, JSON.stringify(translators), 'utf-8', (err) => {
                console.error('Create translator cache failed');
            });
        });
        return translators;
    }
    private async _getDOIFromArxiv(pdf: pdfjs.PDFDocumentProxy) {
        function matchArxiv(str: string, exact = false) {
            function extract(str: string) {
                return extractPre2007Ids(str).concat(extractPost2007Ids(str));
            }

            function extractPre2007Ids(str: string) {
                return extractIds(
                    str,
                    /(?:^|\s|\/)((?:arXiv:)?[a-z-]+(?:\.[A-Z]{2})?\/\d{2}(?:0[1-9]|1[012])\d{3}(?:v\d+)?(?=$|\s))/gi
                );
            }

            function extractPost2007Ids(str: string) {
                return extractIds(str, /(?:^|\s|\/)((?:arXiv:)?\d{4}\.\d{4,5}(?:v\d+)?(?=$|\s))/gi);
            }

            function extractIds(str: string, re: RegExp) {
                let match: RegExpExecArray | null = null;
                const matches = [];

                while ((match = re.exec(str)) !== null) {
                    matches.push(match[1]);
                }

                return matches.map(stripScheme);
            }

            function stripScheme(str: string) {
                return str.replace(/^arXiv:/i, '');
            }

            const parser = extract;
            return parser(str.replace('arXiv', ' arXiv'));
        }
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;
        const text = textContent.items
            .map(function (s: any) {
                return s.str;
            })
            .join('');
        return matchArxiv(text)[0];
    }
    private async _getDOIFromMetaData(pdf: pdfjs.PDFDocumentProxy) {
        // https://www.crossref.org/blog/dois-and-matching-regular-expressions/
        function matchDOI(str: string, exact = false) {
            const doiRegex = '(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)';
            const regexp = exact ? new RegExp('(?:^' + doiRegex + '$)') : new RegExp('(?:' + doiRegex + ')', 'g');
            if (!str) {
                return;
            }
            const suffixes: any[] = [];
            const newStr = str.replace(/\.[a-zA-Z]{1}[0-9]{3}$/g, function (s) {
                suffixes.push(s);
                return '';
            });
            const match = regexp.exec(newStr);
            if (match) {
                match[0] = str;
                match.push(suffixes.length ? suffixes[0] : '');
            }
            return match;
        }

        const info = await pdf.getMetadata();
        const matchRes = matchDOI(JSON.stringify(info));
        if (!matchRes || matchRes.length < 2) {
            throw new Error('No DOI found');
        }
        return matchRes[1];
        // console.log(await getMetaFromCrossRef(doi));
    }

    public extractID(docpath: string): Promise<{ type: string | null; value: string | null }> {
        return new Promise((resolve, reject) => {
            fs.readFile(docpath, {}, (err, data) => {
                if (err) {
                    console.error(TAG, `extractID readFile failed`, err);
                    reject(`Cannot read file ${docpath}`);
                }
                const binaryPDF = data;
                let doi: { type: string | null; value: string | null } = { type: null, value: null };
                pdfjs.GlobalWorkerOptions.workerSrc = path.resolve(__static, 'scripts/pdf.worker.js');
                pdfjs.getDocument(binaryPDF).promise.then(async (pdf) => {
                    try {
                        doi = {
                            type: 'DOI',
                            value: await this._getDOIFromMetaData(pdf),
                        };
                    } catch (e) {
                        console.error("PDF don't have doi", e);
                    }
                    if (!doi.value) {
                        try {
                            doi = {
                                type: 'arXiv',
                                value: await this._getDOIFromArxiv(pdf),
                            };
                        } catch (e) {
                            console.error("PDF don't have arxiv id", e);
                        }
                    }
                    if (doi && doi.type && doi.value) resolve(doi);
                    else reject(`无法通过PDF检索元数据，请换一种方式导入试试吧！`);
                });
            });
        });
    }
}
