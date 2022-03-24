// const saltdog = window.saltdog;
// saltdog.init();
// saltdog.send('panelOpen', '', (msg) => {
//     console.log('From Host:', msg);
// });
// saltdog.on('translate_result', (txt) => {
//     console.log('Got Result!', txt);
// });

function hasDef(txt){
    return !!txt.dict;
}
let renderInfo = {};
function renderResult(res){
    renderInfo={};
    const sentences_raw = res.sentences;
    let src_text='';
    let dst_info=[];
    for(let s_index=0;s_index<sentences_raw.length-1;s_index++){
        src_text+=sentences_raw[s_index].orig;
        dst_info.push({
            id:s_index,
            src:sentences_raw[s_index].orig,
            text:sentences_raw[s_index].trans
        })
    }
    renderInfo.src_text = src_text;
    renderInfo.dst_info = dst_info;
    // src直接渲染到输入框
    const srcTxtArea = document.getElementById('srcTextArea');
    // 适应高度
    srcTxtArea.value = src_text;
    srcTxtArea.style.height = 'auto';
    srcTxtArea.scrollTop = 0;
    srcTxtArea.style.height = srcTxtArea.scrollHeight + 'px';
    const speech = sentences_raw[sentences_raw.length-1];
    // 读音
    const src_speechTextContainer = document.getElementById('src_speechTextContainer')
    const src_speechText = document.getElementById('src_speechText')
    const dst_speechTextContainer = document.getElementById('dst_speechTextContainer')
    const dst_speechText = document.getElementById('dst_speechText')
    if(speech&&speech.src_translit){
        renderInfo.src_translit = speech.src_translit;
        src_speechTextContainer.style.display = 'block';
        src_speechText.innerText = speech.src_translit;
    }else{
        src_speechTextContainer.style.display = 'none';
        src_speechText.innerText = '';
    }
    if(speech&&speech.translit){
        renderInfo.translit = speech.translit;
        dst_speechTextContainer.style.display = 'block';
        dst_speechText.innerText = speech.translit;
    }else{
        dst_speechTextContainer.style.display = 'none';
        dst_speechText.innerText = '';
    }
    const dstTxtArea = document.getElementById('dstTextHtmlContainer');
    let dstHtmlTemp = [];
    for(const dst of dst_info){
        dstHtmlTemp.push(
            `<span data-dst-id=${dst.id}>${dst.text}</span>`
        );
    }
    // 设置到目标语言
    dstTxtArea.innerHTML = dstHtmlTemp.join('');
    if(hasDef(res)){
        document.getElementById('defContainer').style.display='block';
        // 有定义信息
        renderDef(res);
    }else{
        document.getElementById('defContainer').style.display='none';
    }
}
function buildDictTable(cx){
    function buildexTrans(entry){
    let temp = '';
    for(const tr of entry)
    temp+=`<li style="display:inline">
        <span class="defexmword">${tr}</span>
    </li>`;
    return temp;
    }
    let dictTr = '';
    for(const i in cx.entry){
        dictTr+=`
        <tr style="height:1px">
        ${i==0?'<div style="color: #1a73e8;font-size: 14px;font-weight: 500;line-height: 20px;">'+cx.pos+'</div>':''}
        <th style="white-space: nowrap;vertical-align: top;">
            <div style="margin-top: 4px;">
                <span style="cursor: pointer;line-height: 24px;">${cx.entry[i].word}</span>
                
            </div>
        </th>
        <td style="color: #5f6368;width: 100%;vertical-align: top;">
            <ul role="list" style="direction: ltr;margin: 4px 8px 4px 12px;">
                ${buildexTrans(cx.entry[i].reverse_translation)}
            </ul>
        </td>
        <td style="white-space: nowrap;vertical-align: top;">
            <span style="padding: 12px 0;display: inline-flex;">
                ${cx.entry[i].score}
                <!--<div class="freqDot"></div>
                <div class="freqDot"></div>
                <div class="freqDot_gray"></div>-->
            </span>
        </td>
    </tr>`
    }
    return `
    <table style="position:relative;width:100%;margin-top:10px;
                        ">
                        <thead></thead>
                        <tbody>
    ${dictTr}
                            
                        </tbody>
                    </table>
    `
}
function renderDef(res){
    const defspan = document.getElementById('deftransspan');
    defspan.innerText = renderInfo.src_text;
    const dict = res.dict;
    let dicthtml = "";
    for(const cx of dict){
        dicthtml+=buildDictTable(cx);
    }
    document.getElementById('deftables').innerHTML = dicthtml;
}

renderResult(JSON.parse(`{"sentences":[{"trans":"你好","orig":"hello","backend":10},{"translit":"Nǐ hǎo","src_translit":"həˈlō"}],"dict":[{"pos":"感叹词","terms":["你好!","喂!"],"entry":[{"word":"你好!","reverse_translation":["Hello!","Hi!","Hallo!"],"score":0.13323711},{"word":"喂!","reverse_translation":["Hey!","Hello!"],"score":0.020115795}],"base_form":"Hello!","pos_enum":9}],"src":"en","alternative_translations":[{"src_phrase":"hello","alternative":[{"word_postproc":"你好","score":1000,"has_preceding_space":true,"attach_to_next_token":false,"backends":[10,3],"backend_infos":[{"backend":3}]},{"word_postproc":"您好","score":1000,"has_preceding_space":true,"attach_to_next_token":false,"backends":[10]},{"word_postproc":"喂","score":0,"has_preceding_space":true,"attach_to_next_token":false,"backends":[8]}],"srcunicodeoffsets":[{"begin":0,"end":5}],"raw_src_segment":"hello","start_pos":0,"end_pos":0}],"confidence":1.0,"spell":{},"ld_result":{"srclangs":["en"],"srclangs_confidences":[1.0],"extended_srclangs":["en"]},"definitions":[{"pos":"惊叹词","entry":[{"gloss":"used as a greeting or to begin a phone conversation.","definition_id":"m_en_gbus0460730.012","example":"hello there, Katie!"}],"base_form":"hello"},{"pos":"名词","entry":[{"gloss":"an utterance of “hello”; a greeting.","definition_id":"m_en_gbus0460730.025","example":"she was getting polite nods and hellos from people"}],"base_form":"hello"},{"pos":"动词","entry":[{"gloss":"say or shout “hello”; greet someone.","definition_id":"m_en_gbus0460730.034","example":"I pressed the phone button and helloed"}],"base_form":"hello"}],"examples":{"example":[{"text":"\u003cb\u003ehello\u003c/b\u003e there, Katie!","source_type":3,"definition_id":"m_en_gbus0460730.012"}]}}`))