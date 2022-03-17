import {normalizeAppend} from './formatter.js';
import {google_translate} from './google_translate.js';
export function activate(saltdog:any){
    console.log('activate');

    const text = normalizeAppend(`Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS). As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments. Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33). Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases. Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.`);
    // ui可能没有加载好，此时禁止对ui进行操作
    let pdfView:any;
    saltdog.on('panelOpen',(data:any,cb:any)=>{
        saltdog.getCurrentPDFView({},(v:any)=>{
            pdfView = v;
            pdfView.content.addEventListener('body','mouseup',(e:any)=>{
                pdfView.getSelectText({},(txt:any)=>{
                    console.log('Get Select Text!',txt);
                    saltdog.send('translate_result',txt);
                });
            },true);
        });
    });
    // google_translate('welcome').then(res=>{
    //     console.log('google trans welcome:',res);
    // })

}
export function deactivate(saltdog:any){
    console.log('deactivate');
}

