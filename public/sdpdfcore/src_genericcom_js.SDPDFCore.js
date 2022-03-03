"use strict";
(self["webpackChunksaltdogreader"] = self["webpackChunksaltdogreader"] || []).push([["src_genericcom_js"],{

/***/ "./src/download_manager.js":
/*!*********************************!*\
  !*** ./src/download_manager.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DownloadManager": function() { return /* binding */ DownloadManager; }
/* harmony export */ });
/* Copyright 2022 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Edited 2022 SaltDog Project
 */
/* eslint-disable */

//
// THIS FILE IS GENERATED AUTOMATICALLY, DO NOT EDIT MANUALLY!
//

const {createValidAbsoluteUrl, isPdfFile} = __webpack_require__(/*! pdfjs-dist */ "./node_modules/pdfjs-dist/build/pdf.js");
;
function download(blobUrl, filename) {
 const a = document.createElement("a");
 if (!a.click) {
  throw new Error('DownloadManager: "a.click()" is not supported.');
 }
 a.href = blobUrl;
 a.target = "_parent";
 if ("download" in a) {
  a.download = filename;
 }
 (document.body || document.documentElement).appendChild(a);
 a.click();
 a.remove();
}
class DownloadManager {
 constructor() {
  this._openBlobUrls = new WeakMap();
 }
 downloadUrl(url, filename) {
  if (!createValidAbsoluteUrl(url, "http://example.com")) {
   console.error(`downloadUrl - not a valid URL: ${ url }`);
   return;
  }
  download(url + "#pdfjs.action=download", filename);
 }
 downloadData(data, filename, contentType) {
  const blobUrl = URL.createObjectURL(new Blob([data], { type: contentType }));
  download(blobUrl, filename);
 }
 openOrDownloadData(element, data, filename) {
  const isPdfData = isPdfFile(filename);
  const contentType = isPdfData ? "application/pdf" : "";
  if (isPdfData) {
   let blobUrl = this._openBlobUrls.get(element);
   if (!blobUrl) {
    blobUrl = URL.createObjectURL(new Blob([data], { type: contentType }));
    this._openBlobUrls.set(element, blobUrl);
   }
   let viewerUrl;
   viewerUrl = "?file=" + encodeURIComponent(blobUrl + "#" + filename);
   try {
    window.open(viewerUrl);
    return true;
   } catch (ex) {
    console.error(`openOrDownloadData: ${ ex }`);
    URL.revokeObjectURL(blobUrl);
    this._openBlobUrls.delete(element);
   }
  }
  this.downloadData(data, filename, contentType);
  return false;
 }
 download(blob, url, filename, sourceEventType = "download") {
  const blobUrl = URL.createObjectURL(blob);
  download(blobUrl, filename);
 }
}



/***/ }),

/***/ "./src/generic_scripting.js":
/*!**********************************!*\
  !*** ./src/generic_scripting.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "docPropertiesLookup": function() { return /* binding */ docPropertiesLookup; },
/* harmony export */   "GenericScripting": function() { return /* binding */ GenericScripting; }
/* harmony export */ });
/* Copyright 2022 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Edited 2022 SaltDog Project
 */
/* eslint-disable */

//
// THIS FILE IS GENERATED AUTOMATICALLY, DO NOT EDIT MANUALLY!
//

const {getPdfFilenameFromUrl, loadScript} = __webpack_require__(/*! pdfjs-dist */ "./node_modules/pdfjs-dist/build/pdf.js");
async function docPropertiesLookup(pdfDocument) {
 const url = "", baseUrl = url.split("#")[0];
 let {info, metadata, contentDispositionFilename, contentLength} = await pdfDocument.getMetadata();
 if (!contentLength) {
  const {length} = await pdfDocument.getDownloadInfo();
  contentLength = length;
 }
 return {
  ...info,
  baseURL: baseUrl,
  filesize: contentLength,
  filename: contentDispositionFilename || getPdfFilenameFromUrl(url),
  metadata: metadata?.getRaw(),
  authors: metadata?.get("dc:creator"),
  numPages: pdfDocument.numPages,
  URL: url
 };
}
class GenericScripting {
 constructor(sandboxBundleSrc) {
  this._ready = loadScript(sandboxBundleSrc, true).then(() => {
   return window.pdfjsSandbox.QuickJSSandbox();
  });
 }
 async createSandbox(data) {
  const sandbox = await this._ready;
  sandbox.create(data);
 }
 async dispatchEventInSandbox(event) {
  const sandbox = await this._ready;
  setTimeout(() => sandbox.dispatchEvent(event), 0);
 }
 async destroySandbox() {
  const sandbox = await this._ready;
  sandbox.nukeSandbox();
 }
}



/***/ }),

/***/ "./src/genericcom.js":
/*!***************************!*\
  !*** ./src/genericcom.js ***!
  \***************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GenericCom": function() { return /* binding */ GenericCom; }
/* harmony export */ });
/* Copyright 2022 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Edited 2022 SaltDog Project
 */
/* eslint-disable */

//
// THIS FILE IS GENERATED AUTOMATICALLY, DO NOT EDIT MANUALLY!
//

const {DefaultExternalServices, PDFViewerApplication} = __webpack_require__(/*! ./app.js */ "./src/app.js");
const {BasePreferences} = __webpack_require__(/*! ./preferences.js */ "./src/preferences.js");
const {DownloadManager} = __webpack_require__(/*! ./download_manager.js */ "./src/download_manager.js");
const {GenericL10n} = __webpack_require__(/*! ./genericl10n.js */ "./src/genericl10n.js");
const {GenericScripting} = __webpack_require__(/*! ./generic_scripting.js */ "./src/generic_scripting.js");
;
const GenericCom = {};
class GenericPreferences extends BasePreferences {
 async _writeToStorage(prefObj) {
  localStorage.setItem("pdfjs.preferences", JSON.stringify(prefObj));
 }
 async _readFromStorage(prefObj) {
  return JSON.parse(localStorage.getItem("pdfjs.preferences"));
 }
}
class GenericExternalServices extends DefaultExternalServices {
 static createDownloadManager(options) {
  return new DownloadManager();
 }
 static createPreferences() {
  return new GenericPreferences();
 }
 static createL10n({
  locale = "en-US"
 }) {
  return new GenericL10n(locale);
 }
 static createScripting({sandboxBundleSrc}) {
  return new GenericScripting(sandboxBundleSrc);
 }
}
PDFViewerApplication.externalServices = GenericExternalServices;



/***/ }),

/***/ "./src/genericl10n.js":
/*!****************************!*\
  !*** ./src/genericl10n.js ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GenericL10n": function() { return /* binding */ GenericL10n; }
/* harmony export */ });
/* Copyright 2022 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Edited 2022 SaltDog Project
 */
/* eslint-disable */

//
// THIS FILE IS GENERATED AUTOMATICALLY, DO NOT EDIT MANUALLY!
//

__webpack_require__(/*! ./l10n.js */ "./src/l10n.js");
const {fixupLangCode, getL10nFallback} = __webpack_require__(/*! ./l10n_utils.js */ "./src/l10n_utils.js");
const webL10n = document.webL10n;
class GenericL10n {
 constructor(lang) {
  this._lang = lang;
  this._ready = new Promise((resolve, reject) => {
   webL10n.setLanguage(fixupLangCode(lang), () => {
    resolve(webL10n);
   });
  });
 }
 async getLanguage() {
  const l10n = await this._ready;
  return l10n.getLanguage();
 }
 async getDirection() {
  const l10n = await this._ready;
  return l10n.getDirection();
 }
 async get(key, args = null, fallback = getL10nFallback(key, args)) {
  const l10n = await this._ready;
  return l10n.get(key, args, fallback);
 }
 async translate(element) {
  const l10n = await this._ready;
  return l10n.translate(element);
 }
}



/***/ }),

/***/ "./src/l10n.js":
/*!*********************!*\
  !*** ./src/l10n.js ***!
  \*********************/
/***/ (function() {

/* Copyright 2022 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Edited 2022 SaltDog Project
 */
/* eslint-disable */

//
// THIS FILE IS GENERATED AUTOMATICALLY, DO NOT EDIT MANUALLY!
//


document.webL10n = function (window, document, undefined) {
 var gL10nData = {};
 var gTextData = '';
 var gTextProp = 'textContent';
 var gLanguage = '';
 var gMacros = {};
 var gReadyState = 'loading';
 var gAsyncResourceLoading = true;
 function getL10nResourceLinks() {
  return document.querySelectorAll('link[type="application/l10n"]');
 }
 function getL10nDictionary() {
  var script = document.querySelector('script[type="application/l10n"]');
  return script ? JSON.parse(script.innerHTML) : null;
 }
 function getTranslatableChildren(element) {
  return element ? element.querySelectorAll('*[data-l10n-id]') : [];
 }
 function getL10nAttributes(element) {
  if (!element)
   return {};
  var l10nId = element.getAttribute('data-l10n-id');
  var l10nArgs = element.getAttribute('data-l10n-args');
  var args = {};
  if (l10nArgs) {
   try {
    args = JSON.parse(l10nArgs);
   } catch (e) {
    console.warn('could not parse arguments for #' + l10nId);
   }
  }
  return {
   id: l10nId,
   args: args
  };
 }
 function xhrLoadText(url, onSuccess, onFailure) {
  onSuccess = onSuccess || function _onSuccess(data) {
  };
  onFailure = onFailure || function _onFailure() {
  };
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, gAsyncResourceLoading);
  if (xhr.overrideMimeType) {
   xhr.overrideMimeType('text/plain; charset=utf-8');
  }
  xhr.onreadystatechange = function () {
   if (xhr.readyState == 4) {
    if (xhr.status == 200 || xhr.status === 0) {
     onSuccess(xhr.responseText);
    } else {
     onFailure();
    }
   }
  };
  xhr.onerror = onFailure;
  xhr.ontimeout = onFailure;
  try {
   xhr.send(null);
  } catch (e) {
   onFailure();
  }
 }
 function parseResource(href, lang, successCallback, failureCallback) {
  var baseURL = href.replace(/[^\/]*$/, '') || './';
  function evalString(text) {
   if (text.lastIndexOf('\\') < 0)
    return text;
   return text.replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\b/g, '\b').replace(/\\f/g, '\f').replace(/\\{/g, '{').replace(/\\}/g, '}').replace(/\\"/g, '"').replace(/\\'/g, "'");
  }
  function parseProperties(text, parsedPropertiesCallback) {
   var dictionary = {};
   var reBlank = /^\s*|\s*$/;
   var reComment = /^\s*#|^\s*$/;
   var reSection = /^\s*\[(.*)\]\s*$/;
   var reImport = /^\s*@import\s+url\((.*)\)\s*$/i;
   var reSplit = /^([^=\s]*)\s*=\s*(.+)$/;
   function parseRawLines(rawText, extendedSyntax, parsedRawLinesCallback) {
    var entries = rawText.replace(reBlank, '').split(/[\r\n]+/);
    var currentLang = '*';
    var genericLang = lang.split('-', 1)[0];
    var skipLang = false;
    var match = '';
    function nextEntry() {
     while (true) {
      if (!entries.length) {
       parsedRawLinesCallback();
       return;
      }
      var line = entries.shift();
      if (reComment.test(line))
       continue;
      if (extendedSyntax) {
       match = reSection.exec(line);
       if (match) {
        currentLang = match[1].toLowerCase();
        skipLang = currentLang !== '*' && currentLang !== lang && currentLang !== genericLang;
        continue;
       } else if (skipLang) {
        continue;
       }
       match = reImport.exec(line);
       if (match) {
        loadImport(baseURL + match[1], nextEntry);
        return;
       }
      }
      var tmp = line.match(reSplit);
      if (tmp && tmp.length == 3) {
       dictionary[tmp[1]] = evalString(tmp[2]);
      }
     }
    }
    nextEntry();
   }
   function loadImport(url, callback) {
    xhrLoadText(url, function (content) {
     parseRawLines(content, false, callback);
    }, function () {
     console.warn(url + ' not found.');
     callback();
    });
   }
   parseRawLines(text, true, function () {
    parsedPropertiesCallback(dictionary);
   });
  }
  xhrLoadText(href, function (response) {
   gTextData += response;
   parseProperties(response, function (data) {
    for (var key in data) {
     var id, prop, index = key.lastIndexOf('.');
     if (index > 0) {
      id = key.substring(0, index);
      prop = key.substring(index + 1);
     } else {
      id = key;
      prop = gTextProp;
     }
     if (!gL10nData[id]) {
      gL10nData[id] = {};
     }
     gL10nData[id][prop] = data[key];
    }
    if (successCallback) {
     successCallback();
    }
   });
  }, failureCallback);
 }
 function loadLocale(lang, callback) {
  if (lang) {
   lang = lang.toLowerCase();
  }
  callback = callback || function _callback() {
  };
  clear();
  gLanguage = lang;
  var langLinks = getL10nResourceLinks();
  var langCount = langLinks.length;
  if (langCount === 0) {
   var dict = getL10nDictionary();
   if (dict && dict.locales && dict.default_locale) {
    console.log('using the embedded JSON directory, early way out');
    gL10nData = dict.locales[lang];
    if (!gL10nData) {
     var defaultLocale = dict.default_locale.toLowerCase();
     for (var anyCaseLang in dict.locales) {
      anyCaseLang = anyCaseLang.toLowerCase();
      if (anyCaseLang === lang) {
       gL10nData = dict.locales[lang];
       break;
      } else if (anyCaseLang === defaultLocale) {
       gL10nData = dict.locales[defaultLocale];
      }
     }
    }
    callback();
   } else {
    console.log('no resource to load, early way out');
   }
   gReadyState = 'complete';
   return;
  }
  var onResourceLoaded = null;
  var gResourceCount = 0;
  onResourceLoaded = function () {
   gResourceCount++;
   if (gResourceCount >= langCount) {
    callback();
    gReadyState = 'complete';
   }
  };
  function L10nResourceLink(link) {
   var href = link.href;
   this.load = function (lang, callback) {
    parseResource(href, lang, callback, function () {
     console.warn(href + ' not found.');
     console.warn('"' + lang + '" resource not found');
     gLanguage = '';
     callback();
    });
   };
  }
  for (var i = 0; i < langCount; i++) {
   var resource = new L10nResourceLink(langLinks[i]);
   resource.load(lang, onResourceLoaded);
  }
 }
 function clear() {
  gL10nData = {};
  gTextData = '';
  gLanguage = '';
 }
 function getPluralRules(lang) {
  var locales2rules = {
   'af': 3,
   'ak': 4,
   'am': 4,
   'ar': 1,
   'asa': 3,
   'az': 0,
   'be': 11,
   'bem': 3,
   'bez': 3,
   'bg': 3,
   'bh': 4,
   'bm': 0,
   'bn': 3,
   'bo': 0,
   'br': 20,
   'brx': 3,
   'bs': 11,
   'ca': 3,
   'cgg': 3,
   'chr': 3,
   'cs': 12,
   'cy': 17,
   'da': 3,
   'de': 3,
   'dv': 3,
   'dz': 0,
   'ee': 3,
   'el': 3,
   'en': 3,
   'eo': 3,
   'es': 3,
   'et': 3,
   'eu': 3,
   'fa': 0,
   'ff': 5,
   'fi': 3,
   'fil': 4,
   'fo': 3,
   'fr': 5,
   'fur': 3,
   'fy': 3,
   'ga': 8,
   'gd': 24,
   'gl': 3,
   'gsw': 3,
   'gu': 3,
   'guw': 4,
   'gv': 23,
   'ha': 3,
   'haw': 3,
   'he': 2,
   'hi': 4,
   'hr': 11,
   'hu': 0,
   'id': 0,
   'ig': 0,
   'ii': 0,
   'is': 3,
   'it': 3,
   'iu': 7,
   'ja': 0,
   'jmc': 3,
   'jv': 0,
   'ka': 0,
   'kab': 5,
   'kaj': 3,
   'kcg': 3,
   'kde': 0,
   'kea': 0,
   'kk': 3,
   'kl': 3,
   'km': 0,
   'kn': 0,
   'ko': 0,
   'ksb': 3,
   'ksh': 21,
   'ku': 3,
   'kw': 7,
   'lag': 18,
   'lb': 3,
   'lg': 3,
   'ln': 4,
   'lo': 0,
   'lt': 10,
   'lv': 6,
   'mas': 3,
   'mg': 4,
   'mk': 16,
   'ml': 3,
   'mn': 3,
   'mo': 9,
   'mr': 3,
   'ms': 0,
   'mt': 15,
   'my': 0,
   'nah': 3,
   'naq': 7,
   'nb': 3,
   'nd': 3,
   'ne': 3,
   'nl': 3,
   'nn': 3,
   'no': 3,
   'nr': 3,
   'nso': 4,
   'ny': 3,
   'nyn': 3,
   'om': 3,
   'or': 3,
   'pa': 3,
   'pap': 3,
   'pl': 13,
   'ps': 3,
   'pt': 3,
   'rm': 3,
   'ro': 9,
   'rof': 3,
   'ru': 11,
   'rwk': 3,
   'sah': 0,
   'saq': 3,
   'se': 7,
   'seh': 3,
   'ses': 0,
   'sg': 0,
   'sh': 11,
   'shi': 19,
   'sk': 12,
   'sl': 14,
   'sma': 7,
   'smi': 7,
   'smj': 7,
   'smn': 7,
   'sms': 7,
   'sn': 3,
   'so': 3,
   'sq': 3,
   'sr': 11,
   'ss': 3,
   'ssy': 3,
   'st': 3,
   'sv': 3,
   'sw': 3,
   'syr': 3,
   'ta': 3,
   'te': 3,
   'teo': 3,
   'th': 0,
   'ti': 4,
   'tig': 3,
   'tk': 3,
   'tl': 4,
   'tn': 3,
   'to': 0,
   'tr': 0,
   'ts': 3,
   'tzm': 22,
   'uk': 11,
   'ur': 3,
   've': 3,
   'vi': 0,
   'vun': 3,
   'wa': 4,
   'wae': 3,
   'wo': 0,
   'xh': 3,
   'xog': 3,
   'yo': 0,
   'zh': 0,
   'zu': 3
  };
  function isIn(n, list) {
   return list.indexOf(n) !== -1;
  }
  function isBetween(n, start, end) {
   return start <= n && n <= end;
  }
  var pluralRules = {
   '0': function (n) {
    return 'other';
   },
   '1': function (n) {
    if (isBetween(n % 100, 3, 10))
     return 'few';
    if (n === 0)
     return 'zero';
    if (isBetween(n % 100, 11, 99))
     return 'many';
    if (n == 2)
     return 'two';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '2': function (n) {
    if (n !== 0 && n % 10 === 0)
     return 'many';
    if (n == 2)
     return 'two';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '3': function (n) {
    if (n == 1)
     return 'one';
    return 'other';
   },
   '4': function (n) {
    if (isBetween(n, 0, 1))
     return 'one';
    return 'other';
   },
   '5': function (n) {
    if (isBetween(n, 0, 2) && n != 2)
     return 'one';
    return 'other';
   },
   '6': function (n) {
    if (n === 0)
     return 'zero';
    if (n % 10 == 1 && n % 100 != 11)
     return 'one';
    return 'other';
   },
   '7': function (n) {
    if (n == 2)
     return 'two';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '8': function (n) {
    if (isBetween(n, 3, 6))
     return 'few';
    if (isBetween(n, 7, 10))
     return 'many';
    if (n == 2)
     return 'two';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '9': function (n) {
    if (n === 0 || n != 1 && isBetween(n % 100, 1, 19))
     return 'few';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '10': function (n) {
    if (isBetween(n % 10, 2, 9) && !isBetween(n % 100, 11, 19))
     return 'few';
    if (n % 10 == 1 && !isBetween(n % 100, 11, 19))
     return 'one';
    return 'other';
   },
   '11': function (n) {
    if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14))
     return 'few';
    if (n % 10 === 0 || isBetween(n % 10, 5, 9) || isBetween(n % 100, 11, 14))
     return 'many';
    if (n % 10 == 1 && n % 100 != 11)
     return 'one';
    return 'other';
   },
   '12': function (n) {
    if (isBetween(n, 2, 4))
     return 'few';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '13': function (n) {
    if (isBetween(n % 10, 2, 4) && !isBetween(n % 100, 12, 14))
     return 'few';
    if (n != 1 && isBetween(n % 10, 0, 1) || isBetween(n % 10, 5, 9) || isBetween(n % 100, 12, 14))
     return 'many';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '14': function (n) {
    if (isBetween(n % 100, 3, 4))
     return 'few';
    if (n % 100 == 2)
     return 'two';
    if (n % 100 == 1)
     return 'one';
    return 'other';
   },
   '15': function (n) {
    if (n === 0 || isBetween(n % 100, 2, 10))
     return 'few';
    if (isBetween(n % 100, 11, 19))
     return 'many';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '16': function (n) {
    if (n % 10 == 1 && n != 11)
     return 'one';
    return 'other';
   },
   '17': function (n) {
    if (n == 3)
     return 'few';
    if (n === 0)
     return 'zero';
    if (n == 6)
     return 'many';
    if (n == 2)
     return 'two';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '18': function (n) {
    if (n === 0)
     return 'zero';
    if (isBetween(n, 0, 2) && n !== 0 && n != 2)
     return 'one';
    return 'other';
   },
   '19': function (n) {
    if (isBetween(n, 2, 10))
     return 'few';
    if (isBetween(n, 0, 1))
     return 'one';
    return 'other';
   },
   '20': function (n) {
    if ((isBetween(n % 10, 3, 4) || n % 10 == 9) && !(isBetween(n % 100, 10, 19) || isBetween(n % 100, 70, 79) || isBetween(n % 100, 90, 99)))
     return 'few';
    if (n % 1000000 === 0 && n !== 0)
     return 'many';
    if (n % 10 == 2 && !isIn(n % 100, [
      12,
      72,
      92
     ]))
     return 'two';
    if (n % 10 == 1 && !isIn(n % 100, [
      11,
      71,
      91
     ]))
     return 'one';
    return 'other';
   },
   '21': function (n) {
    if (n === 0)
     return 'zero';
    if (n == 1)
     return 'one';
    return 'other';
   },
   '22': function (n) {
    if (isBetween(n, 0, 1) || isBetween(n, 11, 99))
     return 'one';
    return 'other';
   },
   '23': function (n) {
    if (isBetween(n % 10, 1, 2) || n % 20 === 0)
     return 'one';
    return 'other';
   },
   '24': function (n) {
    if (isBetween(n, 3, 10) || isBetween(n, 13, 19))
     return 'few';
    if (isIn(n, [
      2,
      12
     ]))
     return 'two';
    if (isIn(n, [
      1,
      11
     ]))
     return 'one';
    return 'other';
   }
  };
  var index = locales2rules[lang.replace(/-.*$/, '')];
  if (!(index in pluralRules)) {
   console.warn('plural form unknown for [' + lang + ']');
   return function () {
    return 'other';
   };
  }
  return pluralRules[index];
 }
 gMacros.plural = function (str, param, key, prop) {
  var n = parseFloat(param);
  if (isNaN(n))
   return str;
  if (prop != gTextProp)
   return str;
  if (!gMacros._pluralRules) {
   gMacros._pluralRules = getPluralRules(gLanguage);
  }
  var index = '[' + gMacros._pluralRules(n) + ']';
  if (n === 0 && key + '[zero]' in gL10nData) {
   str = gL10nData[key + '[zero]'][prop];
  } else if (n == 1 && key + '[one]' in gL10nData) {
   str = gL10nData[key + '[one]'][prop];
  } else if (n == 2 && key + '[two]' in gL10nData) {
   str = gL10nData[key + '[two]'][prop];
  } else if (key + index in gL10nData) {
   str = gL10nData[key + index][prop];
  } else if (key + '[other]' in gL10nData) {
   str = gL10nData[key + '[other]'][prop];
  }
  return str;
 };
 function getL10nData(key, args, fallback) {
  var data = gL10nData[key];
  if (!data) {
   console.warn('#' + key + ' is undefined.');
   if (!fallback) {
    return null;
   }
   data = fallback;
  }
  var rv = {};
  for (var prop in data) {
   var str = data[prop];
   str = substIndexes(str, args, key, prop);
   str = substArguments(str, args, key);
   rv[prop] = str;
  }
  return rv;
 }
 function substIndexes(str, args, key, prop) {
  var reIndex = /\{\[\s*([a-zA-Z]+)\(([a-zA-Z]+)\)\s*\]\}/;
  var reMatch = reIndex.exec(str);
  if (!reMatch || !reMatch.length)
   return str;
  var macroName = reMatch[1];
  var paramName = reMatch[2];
  var param;
  if (args && paramName in args) {
   param = args[paramName];
  } else if (paramName in gL10nData) {
   param = gL10nData[paramName];
  }
  if (macroName in gMacros) {
   var macro = gMacros[macroName];
   str = macro(str, param, key, prop);
  }
  return str;
 }
 function substArguments(str, args, key) {
  var reArgs = /\{\{\s*(.+?)\s*\}\}/g;
  return str.replace(reArgs, function (matched_text, arg) {
   if (args && arg in args) {
    return args[arg];
   }
   if (arg in gL10nData) {
    return gL10nData[arg];
   }
   console.log('argument {{' + arg + '}} for #' + key + ' is undefined.');
   return matched_text;
  });
 }
 function translateElement(element) {
  var l10n = getL10nAttributes(element);
  if (!l10n.id)
   return;
  var data = getL10nData(l10n.id, l10n.args);
  if (!data) {
   console.warn('#' + l10n.id + ' is undefined.');
   return;
  }
  if (data[gTextProp]) {
   if (getChildElementCount(element) === 0) {
    element[gTextProp] = data[gTextProp];
   } else {
    var children = element.childNodes;
    var found = false;
    for (var i = 0, l = children.length; i < l; i++) {
     if (children[i].nodeType === 3 && /\S/.test(children[i].nodeValue)) {
      if (found) {
       children[i].nodeValue = '';
      } else {
       children[i].nodeValue = data[gTextProp];
       found = true;
      }
     }
    }
    if (!found) {
     var textNode = document.createTextNode(data[gTextProp]);
     element.insertBefore(textNode, element.firstChild);
    }
   }
   delete data[gTextProp];
  }
  for (var k in data) {
   element[k] = data[k];
  }
 }
 function getChildElementCount(element) {
  if (element.children) {
   return element.children.length;
  }
  if (typeof element.childElementCount !== 'undefined') {
   return element.childElementCount;
  }
  var count = 0;
  for (var i = 0; i < element.childNodes.length; i++) {
   count += element.nodeType === 1 ? 1 : 0;
  }
  return count;
 }
 function translateFragment(element) {
  element = element || document.documentElement;
  var children = getTranslatableChildren(element);
  var elementCount = children.length;
  for (var i = 0; i < elementCount; i++) {
   translateElement(children[i]);
  }
  translateElement(element);
 }
 return {
  get: function (key, args, fallbackString) {
   var index = key.lastIndexOf('.');
   var prop = gTextProp;
   if (index > 0) {
    prop = key.substring(index + 1);
    key = key.substring(0, index);
   }
   var fallback;
   if (fallbackString) {
    fallback = {};
    fallback[prop] = fallbackString;
   }
   var data = getL10nData(key, args, fallback);
   if (data && prop in data) {
    return data[prop];
   }
   return '{{' + key + '}}';
  },
  getData: function () {
   return gL10nData;
  },
  getText: function () {
   return gTextData;
  },
  getLanguage: function () {
   return gLanguage;
  },
  setLanguage: function (lang, callback) {
   loadLocale(lang, function () {
    if (callback)
     callback();
   });
  },
  getDirection: function () {
   var rtlList = [
    'ar',
    'he',
    'fa',
    'ps',
    'ur'
   ];
   var shortCode = gLanguage.split('-', 1)[0];
   return rtlList.indexOf(shortCode) >= 0 ? 'rtl' : 'ltr';
  },
  translate: translateFragment,
  getReadyState: function () {
   return gReadyState;
  },
  ready: function (callback) {
   if (!callback) {
    return;
   } else if (gReadyState == 'complete' || gReadyState == 'interactive') {
    window.setTimeout(function () {
     callback();
    });
   } else if (document.addEventListener) {
    document.addEventListener('localized', function once() {
     document.removeEventListener('localized', once);
     callback();
    });
   }
  }
 };
}(window, document);


/***/ }),

/***/ "./src/preferences.js":
/*!****************************!*\
  !*** ./src/preferences.js ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BasePreferences": function() { return /* binding */ BasePreferences; }
/* harmony export */ });
/* Copyright 2022 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Edited 2022 SaltDog Project
 */
/* eslint-disable */

//
// THIS FILE IS GENERATED AUTOMATICALLY, DO NOT EDIT MANUALLY!
//

const {AppOptions, OptionKind} = __webpack_require__(/*! ./app_options.js */ "./src/app_options.js");
class BasePreferences {
 constructor() {
  if (this.constructor === BasePreferences) {
   throw new Error("Cannot initialize BasePreferences.");
  }
  Object.defineProperty(this, "defaults", {
   value: Object.freeze(AppOptions.getAll(OptionKind.PREFERENCE)),
   writable: false,
   enumerable: true,
   configurable: false
  });
  this.prefs = Object.create(null);
  this._initializedPromise = this._readFromStorage(this.defaults).then(prefs => {
   for (const name in this.defaults) {
    const prefValue = prefs?.[name];
    if (typeof prefValue === typeof this.defaults[name]) {
     this.prefs[name] = prefValue;
    }
   }
  });
 }
 async _writeToStorage(prefObj) {
  throw new Error("Not implemented: _writeToStorage");
 }
 async _readFromStorage(prefObj) {
  throw new Error("Not implemented: _readFromStorage");
 }
 async reset() {
  await this._initializedPromise;
  this.prefs = Object.create(null);
  return this._writeToStorage(this.defaults);
 }
 async set(name, value) {
  await this._initializedPromise;
  const defaultValue = this.defaults[name];
  if (defaultValue === undefined) {
   throw new Error(`Set preference: "${ name }" is undefined.`);
  } else if (value === undefined) {
   throw new Error("Set preference: no value is specified.");
  }
  const valueType = typeof value;
  const defaultType = typeof defaultValue;
  if (valueType !== defaultType) {
   if (valueType === "number" && defaultType === "string") {
    value = value.toString();
   } else {
    throw new Error(`Set preference: "${ value }" is a ${ valueType }, expected a ${ defaultType }.`);
   }
  } else {
   if (valueType === "number" && !Number.isInteger(value)) {
    throw new Error(`Set preference: "${ value }" must be an integer.`);
   }
  }
  this.prefs[name] = value;
  return this._writeToStorage(this.prefs);
 }
 async get(name) {
  await this._initializedPromise;
  const defaultValue = this.defaults[name], prefValue = this.prefs[name];
  if (defaultValue === undefined) {
   throw new Error(`Get preference: "${ name }" is undefined.`);
  }
  return prefValue !== undefined ? prefValue : defaultValue;
 }
 async getAll() {
  await this._initializedPromise;
  const obj = Object.create(null);
  for (const name in this.defaults) {
   const prefValue = this.prefs[name];
   obj[name] = prefValue !== undefined ? prefValue : this.defaults[name];
  }
  return obj;
 }
}



/***/ })

}]);
//# sourceMappingURL=src_genericcom_js.SDPDFCore.js.map