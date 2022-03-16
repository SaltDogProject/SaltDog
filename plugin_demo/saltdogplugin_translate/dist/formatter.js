"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeText = exports.checkIsWord = exports.normalizeAppend = exports.sentenceEnds = void 0;
const lodash_1 = __importDefault(require("lodash"));
const patterns = [/([?!.])[ ]?\n/g, /([？！。])[ ]?\n/g]; //The first one is English like, the second is for Chinese like.
exports.sentenceEnds = /#([?？！!.。])#/g;
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
