import got from 'got-cjs';
import { IGrobidData } from './dataConverter';
import { distance } from 'fastest-levenshtein';
import log from 'electron-log';
import { getGotOptions } from '../../utils/network';
const TAG = '[Main/Grobid/Semantic]';

export function semanticQuery(semanticID: string) {
    return new Promise((resolve, reject) => {
        console.log('Query with semantic scholar');
        const htmlQ = got(getGotOptions('https://www.semanticscholar.org/api/1/paper/' + semanticID)).json();
        const citQ = got(
            getGotOptions('https://api.semanticscholar.org/graph/v1/paper/' + semanticID + '/references', {
                headers: {
                    Referer: 'https://semanticscholar.org/paper/' + semanticID,
                },
                searchParams: {
                    offset: 0,
                    limit: 500,
                    fields: 'isInfluential,corpusId,externalIds,title,abstract,venue,year,referenceCount,citationCount,influentialCitationCount,isOpenAccess,fieldsOfStudy,publicationDate,authors',
                },
            })
        ).json();
        Promise.allSettled([htmlQ, citQ]).then(([htmlTask, citejsonTask]) => {
            const result = { detail: null, citations: null };
            if (htmlTask.status == 'rejected') {
                log.error(TAG, 'Get figureExtraction Failed.', htmlTask.reason);
            } else {
                log.log(TAG, 'Get figureExtraction Success');
                result.detail = htmlTask.value as any;
            }

            if (citejsonTask.status == 'rejected') log.error(TAG, 'Get citation Failed.', citejsonTask.reason);
            else {
                log.log(TAG, 'Get citation Success');
                result.citations = citejsonTask.value as any;
            }
            resolve(result);
        });
    });
}

async function tryGetInfoByFullTitle(title: string) {
    log.log(TAG, 'tryGetInfoByTitle Query with semantic scholar ');
    const res = (await got(
        getGotOptions('https://api.semanticscholar.org/graph/v1/paper/search', {
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
        })
    ).json()) as any;
    log.log(TAG, 'tryGetInfoByTitle done');
    // 进行一个粗略的匹配防止查到的和本文不一样。。
    if (res.data.length == 0) {
        log.log(TAG, 'Cannot get search result.', null);
        return null;
    }
    let searchedTitle = res.data[0].title;
    title = title.replaceAll(' ', '').toLocaleLowerCase();
    searchedTitle = searchedTitle.replaceAll(' ', '').toLocaleLowerCase();
    // 完全一致
    if (title == searchedTitle) {
        log.log(TAG, 'Match Exactly!.', res.data[0].paperId);
        return res.data[0].paperId;
    }

    // 如果一样长并且编辑距离小于5，暂且认为就是同一个，可以防止grobid ocr错误
    if (title.length == searchedTitle.length && distance(title, searchedTitle) < 5) {
        log.log(TAG, 'Ambigious Matched!', res.data[0].paperId);
        return res.data[0].paperId;
    }
    // 关键字的互相包含
    if (title.indexOf(searchedTitle) != -1 || searchedTitle.indexOf(title) != -1) {
        log.log(TAG, 'Substring Matched!', res.data[0].paperId);
        return res.data[0].paperId;
    }
    log.log(TAG, 'Not matched.', null);
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
