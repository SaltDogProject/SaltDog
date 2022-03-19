"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const formatter_js_1 = require("./formatter.js");
const google_translate_js_1 = require("./google_translate.js");
//Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS). As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments. Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33). Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases. Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.
function activate(saltdog) {
    console.log('activate');
    // ui可能没有加载好，此时禁止对ui进行操作
    let pdfView;
    saltdog.on('panelOpen', (data, cb) => {
        saltdog.getCurrentPDFView({}, (v) => {
            pdfView = v;
            pdfView.content.addEventListener('body', 'mouseup', (e) => {
                pdfView.getSelectText({}, (txt) => {
                    console.log('Get Select Text!', txt);
                    const text = (0, formatter_js_1.normalizeAppend)(txt);
                    if (text && text.trim().length != 0)
                        (0, google_translate_js_1.google_translate)(text).then((res) => {
                            saltdog.send('translate_result', res);
                        });
                });
            }, true);
        });
    });
}
exports.activate = activate;
function deactivate(saltdog) {
    console.log('deactivate');
}
exports.deactivate = deactivate;
(0, google_translate_js_1.google_translate)('can').then((res) => {
    console.log(JSON.stringify(res));
});
