import lodash from "lodash";
import tokenizer from 'sbd';
const patterns: Array<RegExp> = [/([?!.])[ ]?\n/g, /([？！。])[ ]?\n/g]; //The first one is English like, the second is for Chinese like.
export const sentenceEnds = /#([?？！!.。])#/g;
export const chnEnds = /[？。！]/g;
export const engEnds = /[?.!]/g;
export const chnBreaks = /[？。！\n]/g;
export const engBreaks = /[?.!\n]/g;
const optional_options = {};

export function normalizeAppend(src: string, purify = true) {
  if (!purify) return src.trim().replace(/\r/, "");
  src = src.replace(/\r\n/g, "\n");
  src = src.replace(/\r/g, "\n");
  src = src.replace(/-\n/g, "");
  patterns.forEach(function (e) {
    src = src.replace(e, "#$1#");
  });
  src = src.replace(/\n/g, " ");
  src = src.replace(sentenceEnds, "$1\n");
  return src;
}
export function checkIsWord(text: string) {
  if (text.length > 100) {
    return false;
  }
  if (/^[a-zA-Z0-9 ]+$/.test(text) && text.split(" ").length <= 3) {
    return true;
  } else {
    return false;
  }
}
function  isWord(text: string) {
  text = lodash.trimEnd(text.trim(), ",.!?. ");
  if (
    !checkIsWord(text)
  ) {
    return false;
  }
  return true;
}
export function normalizeText(text: string) {
    text = normalizeAppend(text, true);
    if (isWord(text)) {
      text = lodash.trimEnd(text.trim(), ",.!?. \n\r");
    }
    return text;
}
const chineseStyles = ["zh-CN", "zh-TW", "ja", "ko"];
export function notEnglish(destCode: string) {
  return chineseStyles.includes(destCode);
}

export function splitEng(text: string): string[] {
  return lodash.compact(tokenizer.sentences(text.trim(), optional_options));
}

// split with seprator
export function splitChn(text: string): string[] {
  const sentences = lodash.compact(text.trim().split(chnEnds));
  const ends = [];
  for (const c of text) {
    if ("？。！".includes(c)) {
      ends.push(c);
    }
  }
  if (ends.length == sentences.length || ends.length == sentences.length - 1) {
    for (let i = 0; i < ends.length; i++) {
      sentences[i] += ends[i];
    }
  }
  return sentences;
}
function countSentences(str: string, splitFunc: (text: string) => string[]) {
  const t = splitFunc(str);

  return t.length;
}
export function reSegmentGoogle(
  text: string,
  result: string[],
  srcCode: string,
  destCode: string
): { resultString: string; paragraphs: string[] } {
  const sentences = text.split("\n");

  const seprator = notEnglish(destCode) ? "" : " ";
  const ends: RegExp = notEnglish(srcCode) ? chnEnds : engEnds;
  const splitFunc = notEnglish(srcCode) ? splitChn : splitEng;
  if (sentences.length == 1) {
    const resultString = result.join(seprator);
    return { resultString, paragraphs: [resultString] };
  }

  const counts = sentences.map((sentence) =>
    countSentences(sentence, splitFunc)
  );
  if (lodash.sum(counts) != result.length) {
    return { resultString: result.join("\n"), paragraphs: result };
  }

  let resultString = "";
  let index = 0;
  const paragraphs: string[] = [];
  counts.forEach((count) => {
    let para = "";
    for (let i = 0; i < count; i++) {
      para += seprator + result[index].trim();
      index++;
    }
    paragraphs.push(para);
    resultString += para;
    resultString += "\n";
  });
  return { resultString, paragraphs };
}


export function autoReSegment(result: any):any {
  const  segmentFunc = reSegmentGoogle;
  let { resultString, paragraphs } = segmentFunc(
    result.text,
    result.trans.paragraphs,
    result.from,
    result.to
  );
  paragraphs = paragraphs.filter(
    (sentence:string) => lodash.trim(sentence, "？。！?.! \n").length > 0
  );
  paragraphs = paragraphs.map((sentence:string) =>
    lodash.trimStart(sentence.trim(), "？。！?.!")
  );
  resultString = paragraphs.join("\n");
  const new_result = { ...result, resultString };
  new_result.trans.paragraphs = paragraphs;
  return new_result;
}