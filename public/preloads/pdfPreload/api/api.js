const { loadPdf } = require('./loadPdf');
const {_requestAddEventListener,_requestRemoveAddEventListener} = require('./event');
const pdfApis = require('./pdfApi');
module.exports = { loadPdf, _requestAddEventListener,_requestRemoveAddEventListener,...pdfApis };
