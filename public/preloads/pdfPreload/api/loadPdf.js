const fs = require('fs');
const set = require('lodash/set');
const loadPdf = function (args, callback) {
    const fileBlob = fs.readFileSync(args.filePath);
    window.PDFViewerApplicationOptions.set('fileBlob', fileBlob);

    if (window.PDFViewerApplication.eventBus) {
        window.PDFViewerApplication.eventBus.dispatch('SDPDFCore_loadPDF');

        // window.PDFViewerApplication.run(window.viewerConfiguration);
        callback('initReady');
    }
};
module.exports = { loadPdf };
//'C:\\Users\\Dorapocket\\Desktop\\矩阵分析与应用\\国科大-李保滨老师-矩阵分析与应用考试题目大汇总-内含2019-2020回忆版\\期末复习\\教材.pdf'
