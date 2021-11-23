const fs = require('fs');
const set = require('lodash/set');
const loadPdf = function (args, callback) {
    try {
        var pdf = fs.readFileSync(args.path);
        set(window._sdConfig, 'pdfFile', pdf.buffer);
        window._runWebViewer();
    } catch (e) {
        console.error(`[PDFTab] Cannot open file:${args.path}`, e);
    }
};
module.exports = { loadPdf };
//'C:\\Users\\Dorapocket\\Desktop\\矩阵分析与应用\\国科大-李保滨老师-矩阵分析与应用考试题目大汇总-内含2019-2020回忆版\\期末复习\\教材.pdf'
