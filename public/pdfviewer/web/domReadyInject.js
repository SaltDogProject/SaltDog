const viewer = document.getElementById('viewer');
const { ipcRenderer } = require('electron');
var lastSelect = '';
viewer.onmouseup = function () {
    var selectionObj = null,
        rangeObj = null,
        selectedText = '',
        selectedHtml = '';
    try {
        selectionObj = window.getSelection();
        selectedText = selectionObj.toString();
        // rangeObj = selectionObj.getRangeAt(0);
        // var docFragment = rangeObj.cloneContents();
        // var tempDiv = document.createElement('div');
        // tempDiv.appendChild(docFragment);
        // selectedHtml = tempDiv.innerHTML;
        if (selectedText.length > 0 && selectedText.length < 1000 && lastSelect != selectedText) {
            ipcRenderer.sendToHost('textSelect', selectedText);
            lastSelect = selectedText;
        }
    } catch (e) {
        console.error(e);
    }

    //console.log('Select Text', selectedText);
    //console.log('Select Html', selectedHtml);
};
