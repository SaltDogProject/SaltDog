import log from 'electron-log';
const TAG = '[Main/Grobid/DataConverter]';

function parseObjOrArr(target: any, cb: (a: any) => any) {
    if (!target) return;
    if (target && Array.isArray(target)) {
        for (let i = 0; i < target.length; i++) {
            try {
                cb(target[i]);
            } catch (err: any) {
                log.error(TAG, 'Error deal convert', err);
                log.error(TAG, 'Error stack', err.stack || null);
                log.error(TAG, 'Error target id:', i);
                log.error(TAG, 'Error target:', JSON.stringify(target[i]));
            }
        }
    } else {
        try {
            cb(target);
        } catch (err: any) {
            log.error(TAG, 'Error deal convert', err);
            log.error(TAG, 'Error stack', err.stack || null);
            log.error(TAG, 'Error target:', JSON.stringify(target));
        }
    }
}

function parseAuthor(author: any) {
    function parseName(nameLike: any) {
        let name = '';
        parseObjOrArr(nameLike.forename, (f) => {
            name += f['#content'] + '. ';
        });
        name += nameLike.surname || '';
        return name;
    }
    return {
        name: parseName(author.persName),
        role: author.persName.roleName || null,
        email: author.email || null,
        identifier: author.idno ? idnoArrayGene(author.idno) : null,
    };
}
function parseIdentifier(id: any) {
    return {
        id: id['#content'],
        type: id['-type'],
    };
}
function authorArrayGene(authorArr: any) {
    const a = [] as any[];
    parseObjOrArr(authorArr, (au) => {
        a.push(parseAuthor(au));
    });
    return a;
}
function idnoArrayGene(idnoArr: any) {
    const a = [] as any[];
    parseObjOrArr(idnoArr, (id) => {
        a.push(parseIdentifier(id));
    });
    return a;
}
function insertPageSentencesCoords(df_grobid_data: any, content: any, coords: any) {
    df_grobid_data.sentenceGroups.push({
        content,
        coords,
    });
    const firstPage = Number(coords.split(',')[0]);
    const gnum = df_grobid_data.sentenceGroups.length - 1;
    if (!df_grobid_data.pages[firstPage].sentence) df_grobid_data.pages[firstPage].sentence = [];
    if (df_grobid_data.pages[firstPage]) df_grobid_data.pages[firstPage].sentence.push(gnum);
    return gnum;
}
function insertRefs(df_grobid_data: any, type: any, target: any, coords: any) {
    const firstPage = Number(coords.split(',')[0]);
    if (!df_grobid_data.pages[firstPage].marker) df_grobid_data.pages[firstPage].marker = [];
    df_grobid_data.pages[firstPage].marker.push({
        coords,
        type,
        target,
    });
}
function dealFacsimile(targetObj: any, facsimile: any) {
    const { surface } = facsimile;
    for (const i of surface) {
        targetObj.pages.push({ size: { width: Number(i['-lrx']), height: Number(i['-lry']) } });
    }
}

function dealTeiHeader(targetObj: any, teiHeader: any) {
    const { fileDesc, profileDesc } = teiHeader;
    targetObj.general.language = teiHeader['-lang'];
    if (fileDesc) {
        targetObj.general.publicationStatemant = fileDesc.publicationStmt || null;
        if (fileDesc.sourceDesc && fileDesc.sourceDesc.biblStruct) {
            targetObj.general.author = [];
            if (fileDesc.sourceDesc.biblStruct.analytic) {
                parseObjOrArr(fileDesc.sourceDesc.biblStruct.analytic.author, (author) => {
                    targetObj.general.author.push(parseAuthor(author));
                });
                targetObj.general.title = null;
                if (fileDesc.sourceDesc.biblStruct.analytic.title)
                    targetObj.general.title =
                        fileDesc.sourceDesc.biblStruct.analytic.title.length == undefined
                            ? fileDesc.sourceDesc.biblStruct.analytic.title['#content']
                            : fileDesc.sourceDesc.biblStruct.analytic.title[0]['#content'];
            }
            targetObj.general.identifier = null;
            if (fileDesc.sourceDesc.biblStruct.idno) {
                targetObj.general.identifier = {
                    id: fileDesc.sourceDesc.biblStruct.idno['#content'],
                    idType: fileDesc.sourceDesc.biblStruct.idno['-type'],
                };
            }
        }
    }
    if (profileDesc) {
        const { abstract, textClass } = profileDesc;
        targetObj.general.abstract = '';
        if (abstract) {
            if (abstract.div)
                parseObjOrArr(abstract.div, (div) => {
                    if (div.p)
                        parseObjOrArr(div.p, (p) => {
                            if (p.s)
                                parseObjOrArr(p.s, (s) => {
                                    targetObj.general.abstract += s['#content'];
                                    insertPageSentencesCoords(targetObj, s['#content'], s['-coords']);
                                });
                        });
                });
        }
        targetObj.general.keywords = [];
        if (textClass && textClass.keywords) {
            for (const k of Object.keys(textClass.keywords)) {
                const a = textClass.keywords[k];
                if (textClass.keywords[k].length) {
                    for (let i = 0; i < textClass.keywords[k].length; i++) {
                        const w = textClass.keywords[k][i];
                        if (typeof w == 'string') targetObj.general.keywords.push(w);
                        else break;
                    }
                }
            }
        }
    }
}
function dealText(targetObj: any, text: any) {
    const { back, body } = text;
    const backHeader = [] as any[];
    const bodyHeader = [] as any[];
    function addBackDIV(divInfo: any) {
        if (divInfo['-type'] == 'references') {
            parseObjOrArr(divInfo.listBibl.biblStruct, (bib) => {
                // console.log('Analyzing ', bib['-id']);
                targetObj.references[bib['-id']] = {
                    coords: bib['-coords'],
                    author:
                        bib.analytic && bib.analytic.author
                            ? authorArrayGene(bib.analytic.author)
                            : bib.monogr && bib.monogr.author
                            ? authorArrayGene(bib.monogr.author)
                            : null,
                    identifier: bib.analytic && bib.analytic.idno ? idnoArrayGene(bib.analytic.idno) : null,
                    title:
                        bib.analytic && bib.analytic.title
                            ? Array.isArray(bib.analytic.title)
                                ? bib.analytic.title[0]['#content']
                                : bib.analytic.title['#content']
                            : null,
                    publishTime:
                        bib.monogr && bib.monogr.imprint && bib.monogr.imprint.date
                            ? bib.monogr.imprint.date['-when']
                            : null,
                    publisher:
                        bib.monogr && bib.monogr.imprint && bib.monogr.imprint.publisher
                            ? bib.monogr.imprint.publisher
                            : null,
                    publichArea:
                        bib.monogr && bib.monogr.imprint && bib.monogr.imprint.title
                            ? Array.isArray(bib.monogr.imprint.title)
                                ? bib.monogr.imprint.title[0]['#content']
                                : bib.monogr.imprint.title['#content']
                            : null,
                };
                parseObjOrArr(bib.note, (note) => {
                    if (note['-type'] == 'raw_reference') targetObj.references[bib['-id']].raw = note['#content'];
                });
            });
        } else {
            if (divInfo.div && divInfo.div.head) {
                backHeader.push({ content: divInfo.div.head['#content'], coords: divInfo.div.head['-coords'] });
            }
        }
    }

    function addBodyDIV(divInfo: any) {
        if (divInfo.head) {
            bodyHeader.push({ content: divInfo.head['#content'], coords: divInfo.head['-coords'] });
        }
        if (divInfo.p)
            parseObjOrArr(divInfo.p, (p) => {
                if (p.s)
                    parseObjOrArr(p.s, (s) => {
                        insertPageSentencesCoords(targetObj, s['#content'], s['-coords']);
                        if (s.ref)
                            parseObjOrArr(s.ref, (ref) => {
                                insertRefs(targetObj, ref['-type'], ref['-target'] || null, ref['-coords']);
                            });
                    });
            });
    }
    if (back.div) {
        parseObjOrArr(back.div, (cont) => {
            addBackDIV(cont);
        });
    }
    if (body.div) {
        parseObjOrArr(body.div, (cont) => {
            addBodyDIV(cont);
        });
    }
    if (body.figure) {
        parseObjOrArr(body.figure, (fig) => {
            let text = '';
            let textCoords = '';
            if (fig.figDesc && fig.figDesc.div)
                parseObjOrArr(fig.figDesc.div, (d) => {
                    if (d.p)
                        parseObjOrArr(d.p, (p) => {
                            if (p.s)
                                parseObjOrArr(p.s, (s) => {
                                    text += s['#content'];
                                    textCoords += s['-coords'] + ';';
                                    insertPageSentencesCoords(targetObj, s['#content'], s['-coords']);
                                });
                        });
                });
            if (textCoords.endsWith(';')) textCoords = textCoords.substring(0, textCoords.length - 1);
            targetObj.figures[fig['-id']] = {
                figCoords: fig.graphic ? fig.graphic['-coords'] : fig.table ? fig['-coords'] : null,
                descCoords: textCoords,
                description: text,
                head: fig.head ? fig.head : null,
            };
        });
    }
    targetObj.general.contents = bodyHeader.concat(backHeader);
}
export interface IGrobidData {
    general: any;
    // start at 1
    pages: any[];
    sentenceGroups: any[];
    references: any;
    figures: any;
    semantic: any;
}
export default function dataConverter(grobidRawData: any): IGrobidData | null {
    if (!grobidRawData) return null;
    if (grobidRawData.TEI) grobidRawData = grobidRawData.TEI;
    const df_grobid_data = {
        general: {},
        // start at 1
        pages: [
            {
                size: { width: null, height: null },
                sentence: [
                    /* Group number */
                ],
                marker: [], //bibr,figure
            },
        ],
        sentenceGroups: [],
        references: {},
        figures: {},
        semantic: null,
        // tables: {},
        // formulas: {},
    };
    dealFacsimile(df_grobid_data, grobidRawData.facsimile);
    dealTeiHeader(df_grobid_data, grobidRawData.teiHeader);
    dealText(df_grobid_data, grobidRawData.text);
    return df_grobid_data;
}
