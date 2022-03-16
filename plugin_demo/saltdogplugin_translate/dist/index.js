"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const formatter_js_1 = require("./formatter.js");
function activate(saltdog) {
    console.log('activate');
    const text = (0, formatter_js_1.normalizeAppend)(`Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS). As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments. Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33). Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases. Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.`);
    // google_translate('welcome').then(res=>{
    //     console.log('google trans welcome:',res);
    // })
}
exports.activate = activate;
function deactivate(saltdog) {
    console.log('deactivate');
}
exports.deactivate = deactivate;
