import lodash from "lodash";

const patterns: Array<RegExp> = [/([?!.])[ ]?\n/g, /([？！。])[ ]?\n/g]; //The first one is English like, the second is for Chinese like.
export const sentenceEnds = /#([?？！!.。])#/g;

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
