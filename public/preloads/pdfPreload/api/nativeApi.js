const { waitUntilDocumentLoad } = require('./utils');
const ERROR = -1;
const SUCCESS = 0;
const getSelectText = function (args, callback) {
    let selectionObj = null,
    rangeObj = null,
    selectedText = '';
if (window.getSelection) {
    selectionObj = window.getSelection();
    callback&&callback(selectionObj.toString());
} else if (document.selection) {
    selectionObj = document.selection;
    rangeObj = selectionObj.createRange();
    callback&&callback(rangeObj.text);
}
};
const getSelectHTML = function (args, callback) {
    let selectionObj = null,
    rangeObj = null,
    selectedHtml = '';
if (window.getSelection) {
    selectionObj = window.getSelection();
    rangeObj = selectionObj.getRangeAt(0);
    let docFragment = rangeObj.cloneContents();
    let tempDiv = document.createElement('div');
    tempDiv.appendChild(docFragment);
    callback&&callback(tempDiv.innerHTML);
} else if (document.selection) {
    selectionObj = document.selection;
    rangeObj = selectionObj.createRange();
    callback&&callback(rangeObj.htmlText);
}
};
module.exports = {
    getSelectText,
    getSelectHTML
}