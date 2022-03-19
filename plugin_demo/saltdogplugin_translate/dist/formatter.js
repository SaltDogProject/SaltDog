"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoReSegment = exports.reSegmentGoogle = exports.splitChn = exports.splitEng = exports.notEnglish = exports.normalizeText = exports.checkIsWord = exports.normalizeAppend = exports.engBreaks = exports.chnBreaks = exports.engEnds = exports.chnEnds = exports.sentenceEnds = void 0;
const lodash_1 = __importDefault(require("lodash"));
const sbd_1 = __importDefault(require("sbd"));
const patterns = [/([?!.])[ ]?\n/g, /([？！。])[ ]?\n/g]; //The first one is English like, the second is for Chinese like.
exports.sentenceEnds = /#([?？！!.。])#/g;
exports.chnEnds = /[？。！]/g;
exports.engEnds = /[?.!]/g;
exports.chnBreaks = /[？。！\n]/g;
exports.engBreaks = /[?.!\n]/g;
const optional_options = {};
function normalizeAppend(src, purify = true) {
    if (!purify)
        return src.trim().replace(/\r/, "");
    src = src.replace(/\r\n/g, "\n");
    src = src.replace(/\r/g, "\n");
    src = src.replace(/-\n/g, "");
    patterns.forEach(function (e) {
        src = src.replace(e, "#$1#");
    });
    src = src.replace(/\n/g, " ");
    src = src.replace(exports.sentenceEnds, "$1\n");
    return src;
}
exports.normalizeAppend = normalizeAppend;
function checkIsWord(text) {
    if (text.length > 100) {
        return false;
    }
    if (/^[a-zA-Z0-9 ]+$/.test(text) && text.split(" ").length <= 3) {
        return true;
    }
    else {
        return false;
    }
}
exports.checkIsWord = checkIsWord;
function isWord(text) {
    text = lodash_1.default.trimEnd(text.trim(), ",.!?. ");
    if (!checkIsWord(text)) {
        return false;
    }
    return true;
}
function normalizeText(text) {
    text = normalizeAppend(text, true);
    if (isWord(text)) {
        text = lodash_1.default.trimEnd(text.trim(), ",.!?. \n\r");
    }
    return text;
}
exports.normalizeText = normalizeText;
const chineseStyles = ["zh-CN", "zh-TW", "ja", "ko"];
function notEnglish(destCode) {
    return chineseStyles.includes(destCode);
}
exports.notEnglish = notEnglish;
function splitEng(text) {
    return lodash_1.default.compact(sbd_1.default.sentences(text.trim(), optional_options));
}
exports.splitEng = splitEng;
// split with seprator
function splitChn(text) {
    const sentences = lodash_1.default.compact(text.trim().split(exports.chnEnds));
    const ends = [];
    for (const c of text) {
        if ("？。！".includes(c)) {
            ends.push(c);
        }
    }
    if (ends.length == sentences.length || ends.length == sentences.length - 1) {
        for (let i = 0; i < ends.length; i++) {
            sentences[i] += ends[i];
        }
    }
    return sentences;
}
exports.splitChn = splitChn;
function countSentences(str, splitFunc) {
    const t = splitFunc(str);
    return t.length;
}
function reSegmentGoogle(text, result, srcCode, destCode) {
    const sentences = text.split("\n");
    const seprator = notEnglish(destCode) ? "" : " ";
    const ends = notEnglish(srcCode) ? exports.chnEnds : exports.engEnds;
    const splitFunc = notEnglish(srcCode) ? splitChn : splitEng;
    if (sentences.length == 1) {
        const resultString = result.join(seprator);
        return { resultString, paragraphs: [resultString] };
    }
    const counts = sentences.map((sentence) => countSentences(sentence, splitFunc));
    if (lodash_1.default.sum(counts) != result.length) {
        return { resultString: result.join("\n"), paragraphs: result };
    }
    let resultString = "";
    let index = 0;
    const paragraphs = [];
    counts.forEach((count) => {
        let para = "";
        for (let i = 0; i < count; i++) {
            para += seprator + result[index].trim();
            index++;
        }
        paragraphs.push(para);
        resultString += para;
        resultString += "\n";
    });
    return { resultString, paragraphs };
}
exports.reSegmentGoogle = reSegmentGoogle;
function autoReSegment(result) {
    const segmentFunc = reSegmentGoogle;
    let { resultString, paragraphs } = segmentFunc(result.text, result.trans.paragraphs, result.from, result.to);
    paragraphs = paragraphs.filter((sentence) => lodash_1.default.trim(sentence, "？。！?.! \n").length > 0);
    paragraphs = paragraphs.map((sentence) => lodash_1.default.trimStart(sentence.trim(), "？。！?.!"));
    resultString = paragraphs.join("\n");
    const new_result = { ...result, resultString };
    new_result.trans.paragraphs = paragraphs;
    return new_result;
}
exports.autoReSegment = autoReSegment;
