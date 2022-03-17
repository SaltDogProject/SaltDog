const { loadPdf } = require('./loadPdf');
const {_requestAddEventListener,_requestRemoveAddEventListener} = require('./event');
const nativeApis = require('./nativeApi');
const pdfApis = require('./pdfApi');
module.exports = { loadPdf, _requestAddEventListener,_requestRemoveAddEventListener,...pdfApis,...nativeApis };
