const { getInfo } = require('./getInfo.js');
const { createWebview } = require('./webview.js');
const pdfApi = require('./pdfView.js');
const testHostApi = (arg, callback) => {
    console.log('Test Host Api has been successfully called!', arg);
    callback('From Host: OK!');
};
const command = (str) => {
    console.log('!!!!!!!!!!!!!str!!!!!!!!!!!!', str);
};
module.exports = {
    getInfo,
    command,
    testHostApi,
    createWebview,
    ...pdfApi,
};
