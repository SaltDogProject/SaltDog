const viewer = document.getElementById('viewer');
viewer.onmouseup = function () {
    var selectionObj = null,
        rangeObj = null,
        selectedText = '',
        selectedHtml = '';
    selectionObj = window.getSelection();
    selectedText = selectionObj.toString();
    rangeObj = selectionObj.getRangeAt(0);
    var docFragment = rangeObj.cloneContents();
    var tempDiv = document.createElement('div');
    tempDiv.appendChild(docFragment);
    selectedHtml = tempDiv.innerHTML;
    console.log('Select Text', selectedText);
    console.log('Select Html', selectedHtml);
};
