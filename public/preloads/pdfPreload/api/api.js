const { loadPdf } = require('./loadPdf');
const pdfApis = require('./pdfApi');
module.exports = { loadPdf, ...pdfApis };
