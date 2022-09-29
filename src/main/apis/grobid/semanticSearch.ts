import { Parser, DomUtils, DomHandler, parseDocument } from 'htmlparser2';
import got from 'got-cjs';
import { IGrobidData } from './dataConverter';
import { distance } from 'fastest-levenshtein';
import log from 'electron-log';
const utils = DomUtils;
const TAG = '[Main/Grobid/Semantic]';
export async function semanticQuery(semanticID: string) {
    console.log('Query with semantic scholar');
    const html = await got('https://www.semanticscholar.org/paper/' + semanticID, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        },
    });
    console.log('done');
    const dom = parseDocument(html.body);
    const databdy = utils.findOne((ele) => {
        return ele.name == 'body';
    }, dom.children);
    const scriptsData = utils.findOne((ele) => {
        return ele.name == 'script' && utils.innerText(ele.children).indexOf('var DATA') != -1;
    }, databdy!.children);
    const str = utils.innerText(scriptsData!.children);
    const DATA = decodeURIComponent(decode(str.substring(12, str.length - 2)));
    const dataObj = JSON.parse(DATA);
    const result = { detail: null, citations: null };
    for (let i = 0; i < dataObj.length; i++) {
        if (dataObj[i]['actionType'] == 'API_REQUEST_COMPLETE' && dataObj[i]['requestType'] == 'PAPER_DETAIL')
            result.detail = dataObj[i]['resultData'];
        if (dataObj[i]['actionType'] == 'API_REQUEST_COMPLETE' && dataObj[i]['requestType'] == 'SEARCH_CITATIONS')
            result.citations = dataObj[i]['resultData'];
    }
    return result;
}
function decode(str: string) {
    const base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const base64DecodeChars = [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59,
        60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
        43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1,
    ];
    let c1, c2, c3, c4;
    let i, out;
    const len = str.length;
    i = 0;
    out = '';
    while (i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1) break;
        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1) break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61) return out;
            c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1) break;
        out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));
        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61) return out;
            c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1) break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}
async function tryGetInfoByFullTitle(title: string) {
    console.log('tryGetInfoByTitle Query with semantic scholar ');
    const res = (await got('https://api.semanticscholar.org/graph/v1/paper/search', {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        },
        searchParams: {
            query: title,
            fields: 'paperId,externalIds,url,title,abstract,venue,year,referenceCount,citationCount,influentialCitationCount,isOpenAccess,fieldsOfStudy,s2FieldsOfStudy,publicationTypes,publicationDate,journal,authors',
            offset: 0,
            limit: 5,
        },
    }).json()) as any;
    console.log('done');
    // 进行一个粗略的匹配防止查到的和本文不一样。。
    if (res.data.length == 0) return null;
    let searchedTitle = res.data[0].title;
    title = title.replaceAll(' ', '').toLocaleLowerCase();
    searchedTitle = searchedTitle.replaceAll(' ', '').toLocaleLowerCase();
    // 完全一致
    if (title == searchedTitle) return res.data[0].paperId;

    // 如果一样长并且编辑距离小于1，暂且认为就是同一个，可以防止grobid ocr错误
    if (title.length == searchedTitle.length && distance(title, searchedTitle) < 5) return res.data[0].paperId;
    // 关键字的互相包含
    if (title.indexOf(searchedTitle) != -1 || searchedTitle.indexOf(title) != -1) return res.data[0].paperId;
    return null;
}
function _mergeData(gdata: IGrobidData, sdata: any) {
    const sfig = sdata.detail.figureExtractions.figures;
    for (const key in gdata.figures) {
        let desc = gdata.figures[key].description
            .replaceAll(' ', '')
            .toLocaleLowerCase()
            .match(/[\u4e00-\u9fa5_a-zA-Z0-9]/g);
        if (!desc) continue;
        desc = desc.join('');
        for (const sf of sfig) {
            let sfs = sf.caption
                .replaceAll(' ', '')
                .toLocaleLowerCase()
                .match(/[\u4e00-\u9fa5_a-zA-Z0-9]/g);
            if (!sfs) continue;
            sfs = sfs.join('');
            if (sfs == desc || sfs.indexOf(desc) != -1 || desc.indexOf(sfs) != -1) {
                gdata.figures[key].description = sf.caption;
                gdata.figures[key].imageUri = sf.uri || '';
                gdata.figures[key].imageCdnUri = sf.cdnUri || '';
            }
        }
    }
    return gdata;
}

export async function appendSemanticData(gdata: IGrobidData) {
    if (!gdata.general.title) {
        log.warn('Cannot append semanticscholar data because title dont recognized.');
        return gdata;
    }
    try {
        const id = await tryGetInfoByFullTitle(gdata.general.title);
        if (!id) {
            log.warn('Cannot append semanticscholar data because cannot search this paper in semanticscholar.');
            return gdata;
        }
        const paperInfo = await semanticQuery(id);
        gdata.semantic = paperInfo;
        return _mergeData(gdata, paperInfo);
    } catch (e) {
        log.error('Cannot append semanticscholar data because getting info failed.', e);
        return gdata;
    }
}
