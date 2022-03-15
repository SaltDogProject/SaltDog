import {normalizeAppend} from './formatter';
import {google_translate} from './google_translate';
function activate(saltdog){
    console.log('activate');

    const text = normalizeAppend(`Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS). As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments. Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33). Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases. Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.`);
    // google_translate(text, {to: 'zh-CN',tld:'cn'}).then(res => {
    //     console.log(res.text);
    //     const srcArr = res.raw[0][4].filter(arr=>{
    //         return arr[0].trim().length!=0;
    //     });
    //     const dstArr = res.raw[1][0][0][5].filter(arr=>{
    //         return arr[0].trim().length!=0;
    //     });
    //     if(srcArr.length!=dstArr.length){
    //         console.error('Different paragraph length between src and dst!');
    //     }
    //     const finalPara = [];
    //     for(const i in srcArr){
    //         finalPara.push({
    //             src:srcArr[i][0],
    //             dst:dstArr[i][0]
    //         })
    //     }
    //     console.log(JSON.stringify(finalPara));
    // }).catch(err => {
    //     console.error(err);
    // });
    google_translate(text).then((res)=>{
        console.log(res);
    }).catch(e=>{
        console.error(e);
    });
}
function deactivate(saltdog){
    console.log('deactivate');
}
activate(null);
module.exports = {
    activate,
    deactivate
}