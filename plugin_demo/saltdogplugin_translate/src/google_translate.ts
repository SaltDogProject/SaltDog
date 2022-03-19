import { normalizeText } from './formatter.js';
import axios from 'axios';
// 评论里有说到dt参数的作用，这里说明一下，dt决定了最终返回的数据，可以包含多个dt参数，以下是dt的一些值：
// • t - 源text的翻译
// • at - 会额外返回一些近义词
// • ex - examples
// • ss - 如果翻译的是单个词，会返回与该词相关的动词、形容词、名词
// • md - 如果翻译的是单个词，返回该词的定义
// • rw - 组词
// • bd
// • rm
// http://translate.google.cn/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=google
// http://translate.google.cn/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=auto&tl=zh_TW&q=calculate
// http://translate.google.cn/translate_a/t?client=gtx&sl=en&tl=zh-CN&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=2&ssel=0&tsel=0&kc=1&tk=
export async function google_translate(text: string) {
    text = normalizeText(text);
    //URL1// const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=at&dt=bd&dt=ex&dt=ss&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&q=${encodeURI(
    //     text
    // )}`;
    const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=at&dt=bd&dt=ex&dt=ss&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dj=1&ie=UTF-8&sl=auto&tl=zh_CN&q=${encodeURI(
        text
    )}`;
    const req = await axios.get(targetUrl, {
        headers: {
            referer: 'https://translate.google.cn/',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9',
            dnt: 1,
            'sec-ch-ua': ' " Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': 1,
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36',
        },
    });
    const rawData = req.status == 200 ? req.data : '';
    return rawData;
    // 使用URL1时需要进行解析
    // console.log(JSON.stringify(rawData));
    // //const rawData = JSON.parse(`[[["欢迎","welcome",null,null,10],[null,null,"Huānyíng","ˈwelkəm"]],[["名词",["欢迎","欢迎光临"],[["欢迎",["welcome","greeting","reception"],null,0.7548396],["欢迎光临",["welcome"]]],"welcome",1],["动词",["欢迎","迎","迎接","赞同","赞成","赞许","迓","揖","赞","接"],[["欢迎",["welcome","greet","compliment"],null,0.7548396],["迎",["welcome","meet","greet","move towards"],null,0.018604068],["迎接",["meet","greet","welcome","receive","salute"],null,0.0023652418],["赞同",["approve","applaud","welcome","commend","approbate","smile on"],null,0.00007603058],["赞成",["approve","concur","welcome","applaud","commend","smile on"],null,0.00005391375],["赞许",["approve","applaud","commend","welcome","smile on","smile upon"],null,0.000014064242],["迓",["receive as a guest","welcome"],null,0.0000056824674],["揖",["greet","meet","welcome"],null,0.0000056824674],["赞",["praise","approve","commend","applaud","eulogize","welcome"],null,0.0000056824674],["接",["connect","receive","meet","take over","join","welcome"],null,0.0000028130255]],"welcome",2],["形容词",["受欢迎","爽快","顗"],[["受欢迎",["popular","welcome"],null,0.023888096],["爽快",["straightforward","frank","cheery","cheerful","pleasant","welcome"],null,0.000008530394],["顗",["pleasing","lovely","pleasurable","delightful","gratifying","welcome"],null,0.0000056824674]],"welcome",3]],"en",null,null,[["welcome",null,[["欢迎",1000,true,false,[10,3],null,[[3]]],["令人愉快的",1000,true,false,[10]],["接待",1000,true,false,[10]],["欢迎光临",0,true,false,[8]]],[[0,7]],"welcome",0,0]],1,[],[["en"],null,[1],["en"]],null,null,[["名词",[[["greeting","salutation","hail","welcoming","reception","warm reception","favorable reception","acceptance","hospitality","red carpet","fáilte"],"m_en_gbus1148500.005"]],"welcome"],["动词",[[["greet","say hello to","salute","bid someone welcome","play host/hostess to","show hospitality to","receive","meet","embrace","receive with open arms","roll out the red carpet for","fete","usher in"],"m_en_gbus1148500.013"],[["give the thumbs up to"],"m_en_gbus1148500.020",[["informal"]]],[["express pleasure/satisfaction at","be pleased by","be glad about","take pleasure in","approve of","appreciate","accept","embrace"],"m_en_gbus1148500.020"]],"welcome"],["形容词",[[["gladly received","wanted","appreciated","popular","desirable","acceptable","accepted"],"m_en_gbus1148500.031"],[["pleasing","agreeable","encouraging","gratifying","heartening","promising","refreshing","favorable","propitious","cheering","much needed","pleasant","to one's liking","to one's taste"],"m_en_gbus1148500.033"]],"welcome"]],[["名词",[["an instance or manner of greeting someone.","m_en_gbus1148500.005","you will receive a warm welcome"]],"welcome"],["惊叹词",[["used to greet someone in a glad or friendly way.","m_en_gbus1148500.010","welcome to the Wildlife Park"]],"welcome"],["动词",[["greet (someone arriving) in a glad, polite, or friendly way.","m_en_gbus1148500.013","hotels should welcome guests in their own language"]],"welcome"],["形容词",[["(of a guest or new arrival) gladly received.","m_en_gbus1148500.031","visitors with disabilities are always welcome"]],"welcome"]],[[["anyone is <b>welcome</b> to join them at their midday meal",null,null,null,3,"m_en_gbus1148500.034"],["he went to meet them with his hand stretched out in <b>welcome</b>",null,null,null,3,"m_en_gbus1148500.005"],["after your walk, the cafe serves a <b>welcome</b> pot of coffee",null,null,null,3,"m_en_gbus1148500.033"],["hotels should <b>welcome</b> guests in their own language",null,null,null,3,"m_en_gbus1148500.013"],["<b>welcome</b> to the Wildlife Park",null,null,null,3,"m_en_gbus1148500.010"],["deregulation is <b>welcome</b> to consumers",null,null,null,3,"m_en_gbus1148500.033"],["visitors with disabilities are always <b>welcome</b>",null,null,null,3,"m_en_gbus1148500.031"],["the job is all yours and you're <b>welcome</b> to it!",null,null,null,3,"m_en_gbus1148500.035"],["we <b>welcome</b> any comments",null,null,null,3,"m_en_gbus1148500.019"],["you will receive a warm <b>welcome</b>",null,null,null,3,"m_en_gbus1148500.005"]]]]`);
    // if (rawData.length == 0) throw new Error('No translate response data');
    // //console.log(JSON.stringify(rawData));
    // const paragraph = [];
    // const speech = {
    //     src: '',
    //     dst: '',
    // };
    // const isWord = rawData[0][rawData[0].length - 1].length >= 4;
    // for (let i = 0; i < rawData[0].length - 1; i++) {
    //     if (rawData[0][i][0] && rawData[0][i][1])
    //         paragraph.push({
    //             src: rawData[0][i][0],
    //             dst: rawData[0][i][1],
    //         });
    // }
    // (speech['src'] = isWord ? rawData[0][rawData[0].length - 1][2] : null),
    //     (speech['dst'] = rawData[0][rawData[0].length - 1][3] || null);
    // if (!isWord)
    //     return {
    //         speech,
    //         paragraph,
    //         isWord,
    //     };

    // const word_translate_raw = rawData[1];
    // const word_translate = []; // src的翻译和近义词
    // for (const tr of word_translate_raw) {
    //     const oneTr = {
    //         word_type: tr[0],
    //     };
    //     const temp = [];
    //     for (const sm of tr[2]) {
    //         temp.push({
    //             dst_word: sm[0],
    //             probable_src: sm[1],
    //             dst_word_freq: sm.length >= 4 ? sm[3] : 0,
    //         });
    //     }
    //     // @ts-ignore
    //     oneTr['similar_word'] = temp;
    //     word_translate.push(oneTr);
    // }
    // let word_def = {}; // src的原始定义
    // const word_def_raw = rawData[11];
    // const word_phrase_example_raw = rawData[12];

    // for (const def of word_def_raw) {
    //     // @ts-ignore
    //     word_def[def[0]] = {
    //         // key是词性
    //         similar_prase: def[1][0][0],
    //     };
    // }

    // for (const defex of word_phrase_example_raw) {
    //     // @ts-ignore
    //     if (!word_def[defex[0]]) word_def[defex[0]] = {};
    //     // @ts-ignore
    //     word_def[defex[0]]['definition'] = defex[1][0][0];
    //     // @ts-ignore
    //     word_def[defex[0]]['example'] = defex[1][0][2];
    // }

    // const temp_def = [];
    // for (const cx of Object.keys(word_def)) {
    //     temp_def.push({
    //         word_type: cx || null,
    //         // @ts-ignore
    //         definition: word_def[cx]['definition'] || null,
    //         // @ts-ignore
    //         example: word_def[cx]['example'] || null,
    //         // @ts-ignore
    //         similar_prase: word_def[cx]['similar_prase'] || null,
    //     });
    // }

    // word_def = temp_def;

    // const word_example_raw = rawData[13][0];
    // const word_example = [];
    // for (const exp of word_example_raw) {
    //     word_example.push(exp[0]);
    // }

    // return {
    //     isWord,
    //     speech,
    //     paragraph,
    //     word_def,
    //     word_translate,
    //     word_example,
    // };
}

// [[["小胶质细胞是中枢神经系统 (CNS) 的主要组织驻留免疫细胞。","Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS).",null,null,3,null,null,[[]],[[["041e86f75565b6341f86f9972f755ac9","en_zh_2021q4.md"]]]],["作为中枢神经系统实质的巨噬细胞，小胶质细胞通过吞噬凋亡细胞和神经元突触元件来塑造神经发育。","As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments.",null,null,3,null,null,[[]],[[["041e86f75565b6341f86f9972f755ac9","en_zh_2021q4.md"]]]],["小胶质细胞还积极调查和响应大脑环境的变化，对多种信号分子做出反应，例如神经递质、细胞因子和“警报”，例如 ATP 和白细胞介素 33 (IL-33)。","Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33).",null,null,3,null,null,[[]],[[["041e86f75565b6341f86f9972f755ac9","en_zh_2021q4.md"]]]],["小胶质细胞功能障碍与发育障碍和神经退行性疾病有关，暗示它们是各种神经系统 疾病的潜在驱动因素和治疗靶点。","Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases.",null,null,3,null,null,[[]],[[["041e86f75565b6341f86f9972f755ac9","en_zh_2021q4.md"]]]],["然而，尽管有这种强烈的兴趣，但小胶质细胞在时间、空间、性别和疾病状态方面的异质性才刚刚开始被阐明。","Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.",null,null,3,null,null,[[]],[[["041e86f75565b6341f86f9972f755ac9","en_zh_2021q4.md"]]]],[null,null,"Xiǎo jiāo zhí xìbāo shì zhōngshū shénjīng xìtǒng (CNS) de zhǔyào zǔzhī zhù liú miǎnyì xìbāo. Zuòwéi zhōngshū shénjīng xìtǒng shízhì de jù shì xìbāo, xiǎo jiāo zhí xìbāo tōngguò tūnshì diāo wáng xìbāo hé shénjīng yuán tú chù yuánjiàn lái sùzào shénjīng fāyù. Xiǎo jiāo zhí xìbāo hái jījí diàochá hé xiǎngyìng dànǎo huánjìng de biànhuà, duì duō zhǒng xìnhào fēnzǐ zuò chū fǎnyìng, lìrú shénjīng dì zhì, xìbāo yīnzǐ hé “jǐngbào”, lìrú ATP hé báixìbāo jiè sù 33 (IL-33). Xiǎo jiāo zhí xìbāo gōngnéng zhàng'ài yǔ fāyù zhàng'ài hé shénjīng tuìxíng xìng jíbìng yǒuguān, ànshì tāmen shì gè zhǒng shénjīng xìtǒng jíbìng de qiánzài qūdòng yīnsù hé zhìliáo bǎ diǎn. Rán'ér, jǐnguǎn yǒu zhè zhǒng qiángliè de xìngqù, dàn xiǎo jiāo zhí xìbāo zài shíjiān, kōngjiān, xìngbié hé jíbìng zhuàngtài fāngmiàn de yì zhí xìng cái gānggāng kāishǐ bèi chǎnmíng."]],null,"en",null,null,[["Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS).",null,[["小胶质细胞是中枢神经系统 (CNS) 的主要组织驻留免疫细胞。",0,true,false,[3],null,[[3]]],["小胶质细胞是中枢神经系统（CNS）的主要组织驻留免疫细胞。",0,true,false,[8]]],[[0,91]],"Microglia are the primary tissue-residentimmune cells of the central nervous sys-tem (CNS).",0,0],["As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments.",null,[["作为中枢神经系统实质的巨噬细胞，小胶质细胞通过吞噬凋亡细胞和神经元突触元件来塑造神经发育。",0,true,false,[3],null,[[3]]],["作为中枢神经系统实 质的巨噬细胞，小胶质细胞通过吞噬凋亡细胞和神经元突触元件形成神经发育。",0,true,false,[8]]],[[0,146]],"As the macrophages of theCNS parenchyma, microglia shape neuraldevelopment through phagocytosis ofapoptotic cells and neuronal synaptic ele-ments.",0,0],["Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33).",null,[["小胶质细胞还积极调查和响应大脑环境的变化，对多种信号分子做出反应，例如神经递质、细胞因子和“警报”，例如 ATP 和白细胞介 素 33 (IL-33)。",0,true,false,[3],null,[[3]]],["小胶质细胞还积极调查和响应大脑环境的变化，对各种各样的信号分子做出反应，例如神经递质、细胞因子和“警报”，例如 ATP 和白细胞介素 33 (IL-33)。",0,true,false,[8]]],[[0,225]],"Microglia also actively survey andrespond to changes in the brain environ-ment, responding to a wide variety ofsignaling molecules such as neurotrans-mitters, cytokines, and ‘‘alarmins’’ suchas ATP and interleukin-33 (IL-33).",0,0],["Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases.",null,[["小胶质细胞功能障碍与发育障碍和神经退行性疾病有关，暗示它们是各种神经系统疾病的潜在驱动因素和治疗靶点。",0,true,false,[3],null,[[3]]],["小胶质细胞功能障碍与发育障碍和神经退行性疾病有关，暗示它们是多种神经 系统疾病的潜在驱动因素和治疗目标。",0,true,false,[8]]],[[0,188]],"Micro-glial dysfunction is linked to both develop-mental and neurodegenerative disorders,implicating them as potential drivers andtherapeutic targets for a variety of neuro-logic diseases.",0,0],["Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.",null,[["然而，尽管有这种强烈的兴趣，但小胶质细胞在时间、空间、性别和疾病状态方面的异质性才刚刚开始被阐明。",0,true,false,[3],null,[[3]]],["然而，尽管有如此强烈的兴趣，小胶质细胞在时间、空间、性别和疾 病状态方面的异质性才刚刚开始被阐明。",0,true,false,[8]]],[[0,145]],"Yet despite this intenseinterest, the heterogeneity of microgliaacross time, space, gender, and diseasestates is only beginning to be elucidated.",0,0]],1,[],[["en"],null,[1],["en"]]]

//[[["欢迎","welcome",null,null,10],[null,null,"Huānyíng","ˈwelkəm"]],[["名词",["欢迎","欢迎光临"],[["欢迎",["welcome","greeting","reception"],null,0.7548396],["欢迎光临",["welcome"]]],"welcome",1],["动词",["欢迎","迎","迎接","赞同","赞成","赞许","迓","揖","赞","接"],[["欢迎",["welcome","greet","compliment"],null,0.7548396],["迎",["welcome","meet","greet","move towards"],null,0.018604068],["迎接",["meet","greet","welcome","receive","salute"],null,0.0023652418],["赞同",["approve","applaud","welcome","commend","approbate","smile on"],null,0.00007603058],["赞成",["approve","concur","welcome","applaud","commend","smile on"],null,0.00005391375],["赞许",["approve","applaud","commend","welcome","smile on","smile upon"],null,0.000014064242],["迓",["receive as a guest","welcome"],null,0.0000056824674],["揖",["greet","meet","welcome"],null,0.0000056824674],["赞",["praise","approve","commend","applaud","eulogize","welcome"],null,0.0000056824674],["接",["connect","receive","meet","take over","join","welcome"],null,0.0000028130255]],"welcome",2],["形容词",["受欢迎","爽快","顗"],[["受欢迎",["popular","welcome"],null,0.023888096],["爽快",["straightforward","frank","cheery","cheerful","pleasant","welcome"],null,0.000008530394],["顗",["pleasing","lovely","pleasurable","delightful","gratifying","welcome"],null,0.0000056824674]],"welcome",3]],"en",null,null,[["welcome",null,[["欢迎",1000,true,false,[10,3],null,[[3]]],["令人愉快的",1000,true,false,[10]],["接待",1000,true,false,[10]],["欢迎光临",0,true,false,[8]]],[[0,7]],"welcome",0,0]],1,[],[["en"],null,[1],["en"]],null,null,[["名词",[[["greeting","salutation","hail","welcoming","reception","warm reception","favorable reception","acceptance","hospitality","red carpet","fáilte"],"m_en_gbus1148500.005"]],"welcome"],["动词",[[["greet","say hello to","salute","bid someone welcome","play host/hostess to","show hospitality to","receive","meet","embrace","receive with open arms","roll out the red carpet for","fete","usher in"],"m_en_gbus1148500.013"],[["give the thumbs up to"],"m_en_gbus1148500.020",[["informal"]]],[["express pleasure/satisfaction at","be pleased by","be glad about","take pleasure in","approve of","appreciate","accept","embrace"],"m_en_gbus1148500.020"]],"welcome"],["形容词",[[["gladly received","wanted","appreciated","popular","desirable","acceptable","accepted"],"m_en_gbus1148500.031"],[["pleasing","agreeable","encouraging","gratifying","heartening","promising","refreshing","favorable","propitious","cheering","much needed","pleasant","to one's liking","to one's taste"],"m_en_gbus1148500.033"]],"welcome"]],[["名词",[["an instance or manner of greeting someone.","m_en_gbus1148500.005","you will receive a warm welcome"]],"welcome"],["惊叹词",[["used to greet someone in a glad or friendly way.","m_en_gbus1148500.010","welcome to the Wildlife Park"]],"welcome"],["动词",[["greet (someone arriving) in a glad, polite, or friendly way.","m_en_gbus1148500.013","hotels should welcome guests in their own language"]],"welcome"],["形容词",[["(of a guest or new arrival) gladly received.","m_en_gbus1148500.031","visitors with disabilities are always welcome"]],"welcome"]],[[["anyone is <b>welcome</b> to join them at their midday meal",null,null,null,3,"m_en_gbus1148500.034"],["he went to meet them with his hand stretched out in <b>welcome</b>",null,null,null,3,"m_en_gbus1148500.005"],["after your walk, the cafe serves a <b>welcome</b> pot of coffee",null,null,null,3,"m_en_gbus1148500.033"],["hotels should <b>welcome</b> guests in their own language",null,null,null,3,"m_en_gbus1148500.013"],["<b>welcome</b> to the Wildlife Park",null,null,null,3,"m_en_gbus1148500.010"],["deregulation is <b>welcome</b> to consumers",null,null,null,3,"m_en_gbus1148500.033"],["visitors with disabilities are always <b>welcome</b>",null,null,null,3,"m_en_gbus1148500.031"],["the job is all yours and you're <b>welcome</b> to it!",null,null,null,3,"m_en_gbus1148500.035"],["we <b>welcome</b> any comments",null,null,null,3,"m_en_gbus1148500.019"],["you will receive a warm <b>welcome</b>",null,null,null,3,"m_en_gbus1148500.005"]]]]
