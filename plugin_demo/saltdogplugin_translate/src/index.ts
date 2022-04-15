import * as saltdog from 'saltdog';
import { normalizeAppend } from './formatter.js';
import { google_translate } from './google_translate.js';
let pdfView: any;
let listenerId: any;

saltdog.command('wow');

//Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS). As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments. Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33). Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases. Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.
export async function activate(saltdog: any) {
    async function run() {
        const v = await saltdog.getCurrentPDFView();
        if (!v) return;
        pdfView = v;
        const listenerId = await pdfView.content.addEventListener(
            'body',
            'mouseup',
            async (e: any) => {
                const txt = await pdfView.getSelectText();
                console.log('Get Select Text!', txt);
                if (txt.trim().length == 0) return;
                const text = normalizeAppend(txt);
                saltdog.send('translate_getText', txt);
                if (text && text.trim().length != 0)
                    google_translate(text).then((res) => {
                        if (!res || res.error) {
                            saltdog.send('translate_error', res.error);
                        } else {
                            saltdog.send('translate_result', res);
                        }
                    });
            },
            true
        );
    }
    console.log('activate');
    saltdog.subscribe('onTabsChange', (tabid: any) => {
        console.log('onTabsChange!');
        listenerId && saltdog.removeEventListener(listenerId);
        run();
    });
    saltdog.on('panelOpen', run);
}
export function deactivate(saltdog: any) {
    console.log('deactivate');
}
// google_translate('can').then((res) => {
//     console.log(JSON.stringify(res));
// });
