const { loadPdf } = require('./loadPdf');
const { _requestAddEventListener, _requestRemoveAddEventListener } = require('./event');
const { saveAnnotations } = require('./annotations');
const nativeApis = require('./nativeApi');
const pdfApis = require('./pdfApi');
module.exports = {
    loadPdf,
    saveAnnotations,
    _requestAddEventListener,
    _requestRemoveAddEventListener,
    ...pdfApis,
    ...nativeApis,
};
