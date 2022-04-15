"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const saltdog = __importStar(require("saltdog"));
const formatter_js_1 = require("./formatter.js");
const google_translate_js_1 = require("./google_translate.js");
let pdfView;
let listenerId;
saltdog.command('wow');
//Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS). As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments. Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33). Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases. Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.
async function activate(saltdog) {
    async function run() {
        const v = await saltdog.getCurrentPDFView();
        if (!v)
            return;
        pdfView = v;
        const listenerId = await pdfView.content.addEventListener('body', 'mouseup', async (e) => {
            const txt = await pdfView.getSelectText();
            console.log('Get Select Text!', txt);
            if (txt.trim().length == 0)
                return;
            const text = (0, formatter_js_1.normalizeAppend)(txt);
            saltdog.send('translate_getText', txt);
            if (text && text.trim().length != 0)
                (0, google_translate_js_1.google_translate)(text).then((res) => {
                    if (!res || res.error) {
                        saltdog.send('translate_error', res.error);
                    }
                    else {
                        saltdog.send('translate_result', res);
                    }
                });
        }, true);
    }
    console.log('activate');
    saltdog.subscribe('onTabsChange', (tabid) => {
        console.log('onTabsChange!');
        listenerId && saltdog.removeEventListener(listenerId);
        run();
    });
    saltdog.on('panelOpen', run);
}
exports.activate = activate;
function deactivate(saltdog) {
    console.log('deactivate');
}
exports.deactivate = deactivate;
// google_translate('can').then((res) => {
//     console.log(JSON.stringify(res));
// });
