import {normalizeText} from './formatter';
import got from 'got';
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
// http://translate.google.cn/translate_a/t?client=gtx&sl=en&tl=zh-CN&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=2&ssel=0&tsel=0&kc=1&tk=


export async function google_translate(text:string){
    text = normalizeText(text);
    const response = await got(`http://translate.google.cn/translate_a/single?client=gtx&dt=t&dt=at&dt=ex&dt=ss&dt=ex&dt=md&tl=zh-CN&hl=zh-CN&ie=UTF-8&oe=UTF-8&otf=2&ssel=0&tsel=0&kc=1&tk=${new Date().getTime()}&q=${encodeURI(text)}`,{
        headers:{
            referer:'https://translate.google.cn'
        }
    }).json();
    return response;
}