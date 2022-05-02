const { afterDomReady } = require('./contentReady');
const bus = require('../../bus');
function _listenSelect() {
    const viewer = document.getElementById('viewer');
    console.log('run listen');
    viewer.onmouseup = function () {
        var selectionObj = null,
            rangeObj = null,
            selectedText = '',
            selectedHtml = '';
        if (window.getSelection) {
            selectionObj = window.getSelection();
            selectedText = selectionObj.toString();
            rangeObj = selectionObj.getRangeAt(0);
            var docFragment = rangeObj.cloneContents();
            var tempDiv = document.createElement('div');
            tempDiv.appendChild(docFragment);
            selectedHtml = tempDiv.innerHTML;
        } else if (document.selection) {
            selectionObj = document.selection;
            rangeObj = selectionObj.createRange();
            selectedText = rangeObj.text;
            selectedHtml = rangeObj.htmlText;
        }
        window.__sdJSBridge.publish('onTextSelect', selectedText);
        window.__sdJSBridge.publish('onHtmlSelect', selectedHtml);
    };
}
function listenTextSelect() {
    afterDomReady(_listenSelect);
}
module.exports = { listenTextSelect };
