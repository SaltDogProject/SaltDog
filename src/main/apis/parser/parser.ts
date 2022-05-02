import { resolve } from 'path';
import { ChildProcess, fork } from 'child_process';
// import pdfjs, { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.js';
import got from 'got';
import { readFile } from 'fs';
const TAG = '[Main/parser]';

export default class Parser {
    private static _instance: Parser | null = null;
    private _isDev = process.env.NODE_ENV === 'development';
    private _serverPath = this._isDev ? resolve(__static, '../third_party/translation-server/src/server.js') : '';
    private _server: ChildProcess | null = null;
    public isServerReady = false;
    private _serverPort = 1969;
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
        translatorsDirectory: this._isDev
            ? resolve(__static, '../third_party/translation-server/modules/translators')
            : '',
    };
    private constructor() {
        console.log(TAG, `Init Parser in ${this._serverPath}`);
        const worker = fork(this._serverPath, {});
        this._server = worker;
        worker.send({
            type: 'init',
            data: this._initConfig,
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
    public _query(type: 'import' | 'web' | 'export' | 'search', data: string) {
        console.log(TAG, `Execute query ${type} with payload: ${data}`);
        return new Promise((resolve, reject) => {
            try {
                const url = `http://127.0.0.1:${this._serverPort}/${type}`;
                const res = got
                    .post(url, {
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                        body: data,
                    })
                    .json();
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    }
    public query(type: 'import' | 'web' | 'export' | 'search', data: string, callback: any) {
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
    // private async _getDOIFromArxiv(pdf: PDFDocumentProxy) {
    //     function matchArxiv(str: string, exact = false) {
    //         function extract(str: string) {
    //             return extractPre2007Ids(str).concat(extractPost2007Ids(str));
    //         }

    //         function extractPre2007Ids(str: string) {
    //             return extractIds(
    //                 str,
    //                 /(?:^|\s|\/)((?:arXiv:)?[a-z-]+(?:\.[A-Z]{2})?\/\d{2}(?:0[1-9]|1[012])\d{3}(?:v\d+)?(?=$|\s))/gi
    //             );
    //         }

    //         function extractPost2007Ids(str: string) {
    //             return extractIds(str, /(?:^|\s|\/)((?:arXiv:)?\d{4}\.\d{4,5}(?:v\d+)?(?=$|\s))/gi);
    //         }

    //         function extractIds(str: string, re: RegExp) {
    //             let match: RegExpExecArray | null = null;
    //             const matches = [];

    //             while ((match = re.exec(str)) !== null) {
    //                 matches.push(match[1]);
    //             }

    //             return matches.map(stripScheme);
    //         }

    //         function stripScheme(str: string) {
    //             return str.replace(/^arXiv:/i, '');
    //         }

    //         const parser = extract;
    //         return parser(str.replace('arXiv', ' arXiv'));
    //     }
    //     const page = await pdf.getPage(1);
    //     const textContent = await page.getTextContent();
    //     const textItems = textContent.items;
    //     const text = textContent.items
    //         .map(function (s: any) {
    //             return s.str;
    //         })
    //         .join('');
    //     return matchArxiv(text)[0];
    // }
    // private async _getDOIFromMetaData(pdf: PDFDocumentProxy) {
    //     // https://www.crossref.org/blog/dois-and-matching-regular-expressions/
    //     function matchDOI(str: string, exact = false) {
    //         const doiRegex = '(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)';
    //         const regexp = exact ? new RegExp('(?:^' + doiRegex + '$)') : new RegExp('(?:' + doiRegex + ')', 'g');
    //         if (!str) {
    //             return;
    //         }
    //         const suffixes: any[] = [];
    //         const newStr = str.replace(/\.[a-zA-Z]{1}[0-9]{3}$/g, function (s) {
    //             suffixes.push(s);
    //             return '';
    //         });
    //         const match = regexp.exec(newStr);
    //         if (match) {
    //             match[0] = str;
    //             match.push(suffixes.length ? suffixes[0] : '');
    //         }
    //         return match;
    //     }

    //     const info = await pdf.getMetadata();
    //     const matchRes = matchDOI(JSON.stringify(info));
    //     if (!matchRes || matchRes.length < 2) {
    //         throw new Error('No DOI found');
    //     }
    //     return matchRes[1];
    //     // console.log(await getMetaFromCrossRef(doi));
    // }

    // public extractID(path: string): Promise<{ type: string | null; value: string | null }> {
    //     return new Promise((resolve, reject) => {
    //         readFile('./1705.06963.pdf', {}, (err, data) => {
    //             if (err) {
    //                 console.error(TAG, `extractID readFile failed`, err);
    //                 reject(`Cannot read file ${path}`);
    //             }
    //             const binaryPDF = data;
    //             let doi: { type: string | null; value: string | null } = { type: null, value: null };
    //             pdfjs.getDocument(binaryPDF).promise.then(async (pdf) => {
    //                 try {
    //                     doi = {
    //                         type: 'DOI',
    //                         value: await this._getDOIFromMetaData(pdf),
    //                     };
    //                 } catch (e) {
    //                     console.error("PDF don't have doi", e);
    //                 }
    //                 if (!doi) {
    //                     try {
    //                         doi = {
    //                             type: 'arXiv',
    //                             value: await this._getDOIFromArxiv(pdf),
    //                         };
    //                     } catch (e) {
    //                         console.error("PDF don't have arxiv id", e);
    //                     }
    //                 }
    //                 if (doi && doi.type && doi.value) resolve(doi);
    //                 else reject(`无法通过PDF检索元数据，请换一种方式导入试试吧！`);
    //             });
    //         });
    //     });
    // }
}
