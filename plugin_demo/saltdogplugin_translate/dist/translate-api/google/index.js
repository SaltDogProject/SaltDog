"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
// @ts-nocheck
const querystring = require('querystring');
const got = require('got');
const languages = require('./languages');
function extract(key, res) {
    const re = new RegExp(`"${key}":".*?"`);
    const result = re.exec(res.body);
    if (result !== null) {
        return result[0].replace(`"${key}":"`, '').slice(0, -1);
    }
    return '';
}
function translate(text, opts, gotopts) {
    opts = opts || {};
    gotopts = gotopts || {};
    let e;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(lang)) {
            e = new Error();
            e.code = 400;
            e.message = "The language '" + lang + "' is not supported";
        }
    });
    if (e) {
        return new Promise(function (resolve, reject) {
            reject(e);
        });
    }
    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'zh-CN';
    opts.tld = opts.tld || 'cn';
    opts.autoCorrect = opts.autoCorrect === undefined ? false : Boolean(opts.autoCorrect);
    opts.rpcId = opts.rpcId || 'MkEWBc';
    opts.from = languages.getCode(opts.from);
    opts.to = languages.getCode(opts.to);
    let url = 'https://translate.google.' + opts.tld;
    // according to translate.google.com constant rpcids seems to have different values with different POST body format.
    // * MkEWBc - returns translation
    // * AVdN8 - return suggest
    // * exi25c - return some technical info
    const rpcids = opts.rpcId;
    return got(url, gotopts)
        .then(function (res) {
        const data = {
            rpcids: rpcids,
            'source-path': '/',
            'f.sid': extract('FdrFJe', res),
            bl: extract('cfb2h', res),
            hl: 'zh-CN',
            'soc-app': 1,
            'soc-platform': 1,
            'soc-device': 1,
            _reqid: Math.floor(1000 + Math.random() * 9000),
            rt: 'c',
        };
        console.log('reqData：', data);
        return data;
    })
        .then(function (data) {
        url = url + '/_/TranslateWebserverUi/data/batchexecute?' + querystring.stringify(data);
        // === format for freq below is only for rpcids = MkEWBc ===
        const freq = [[[rpcids, JSON.stringify([[text, 'en', 'zh-CN', true], [null]]), null, 'generic']]];
        gotopts.body = 'f.req=' + JSON.stringify(freq) + '&';
        gotopts.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        gotopts.headers['origin'] = 'https://translate.google.cn';
        gotopts.headers['referer'] = 'https://translate.google.cn/';
        gotopts.headers['accept'] = '*/*';
        gotopts.headers['accept-encoding'] = 'gzip, deflate, br';
        gotopts.headers['accept-language'] = 'zh-CN,zh;q=0.9';
        gotopts.headers['dnt'] = 1;
        gotopts.headers['user-agent'] =
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36';
        console.log(url, gotopts);
        return got
            .post(url, gotopts)
            .then(function (res) {
            return res.body;
            // let json = res.body.slice(6);
            // let length = '';
            // let result = {
            //     text: '',
            //     pronunciation: '',
            //     from: {
            //         language: {
            //             didYouMean: false,
            //             iso: ''
            //         },
            //         text: {
            //             autoCorrected: false,
            //             value: '',
            //             didYouMean: false
            //         }
            //     },
            //     raw: ''
            // };
            // try {
            //     length = /^\d+/.exec(json)[0];
            //     json = JSON.parse(json.slice(length.length, parseInt(length, 10) + length.length));
            //     json = JSON.parse(json[0][2]);
            //     result.raw = json;
            // } catch (e) {
            //     return result;
            // }
            // if (json[1][0][0][5] === undefined || json[1][0][0][5] === null) {
            //     // translation not found, could be a hyperlink or gender-specific translation?
            //     result.text = json[1][0][0][0];
            // } else {
            //     result.text = json[1][0][0][5]
            //         .map(function (obj) {
            //             return obj[0];
            //         })
            //         .filter(Boolean)
            //         // Google api seems to split text per sentences by <dot><space>
            //         // So we join text back with spaces.
            //         // See: https://github.com/vitalets/google-translate-api/issues/73
            //         .join(' ');
            // }
            // result.pronunciation = json[1][0][0][1];
            // // From language
            // if (json[0] && json[0][1] && json[0][1][1]) {
            //     result.from.language.didYouMean = true;
            //     result.from.language.iso = json[0][1][1][0];
            // } else if (json[1][3] === 'auto') {
            //     result.from.language.iso = json[2];
            // } else {
            //     result.from.language.iso = json[1][3];
            // }
            // // Did you mean & autocorrect
            // if (json[0] && json[0][1] && json[0][1][0]) {
            //     let str = json[0][1][0][0][1];
            //     str = str.replace(/<b>(<i>)?/g, '[');
            //     str = str.replace(/(<\/i>)?<\/b>/g, ']');
            //     result.from.text.value = str;
            //     if (json[0][1][0][2] === 1) {
            //         result.from.text.autoCorrected = true;
            //     } else {
            //         result.from.text.didYouMean = true;
            //     }
            // }
            // return result;
        })
            .catch(function (err) {
            err.message += `\nUrl: ${url}`;
            if (err.statusCode !== undefined && err.statusCode !== 200) {
                err.code = 'BAD_REQUEST';
            }
            else {
                err.code = 'BAD_NETWORK';
            }
            throw err;
        });
    });
}
exports.translate = translate;
