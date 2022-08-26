const fs = require('fs');
const set = require('lodash/set');
const userPreference = {
    colors: {
        highlight: [
            {
                color: '#ff0000',
                // opacity: 0.5,
            },
            {
                color: '#00ff00',
                // opacity: 0.5,
            },
            {
                color: '#0000ff',
                // opacity: 0.5,
            },
            {
                color: '#ff00ff',
                // opacity: 0.5,
            },
        ],
        underline: [
            {
                color: '#ff0000',
                // opacity: 1,
            },
            {
                color: '#00ff00',
                // opacity: 1,
            },
            {
                color: '#0000ff',
                // opacity: 1,
            },
            {
                color: '#ff00ff',
                // opacity: 1,
            },
        ],
        strikeout: [
            {
                color: '#ff0000',
                // opacity: 1,
            },
            {
                color: '#00ff00',
                // opacity: 1,
            },
            {
                color: '#0000ff',
                // opacity: 1,
            },
            {
                color: '#ff00ff',
                // opacity: 1,
            },
        ],
        area: [
            {
                color: '#ff0000',
                // opacity: 1,
            },
            {
                color: '#00ff00',
                // opacity: 1,
            },
            {
                color: '#0000ff',
                // opacity: 1,
            },
            {
                color: '#ff00ff',
                // opacity: 1,
            },
        ],
        text: [
            {
                color: '#000000',
                size: 10,
                // opacity: 1,
            },
            {
                color: '#00ff00',
                size: 10,
                // opacity: 1,
            },
            {
                color: '#0000ff',
                size: 5,
                // opacity: 1,
            },
            {
                color: '#ff00ff',
                size: 5,
                // opacity: 1,
            },
        ],
        draw: [
            {
                color: '#ff0000',
                opacity: 1,
                size: 2,
            },
            {
                color: '#00ff00',
                opacity: 1,
                size: 2,
            },
            {
                color: '#0000ff',
                opacity: 1,
                size: 2,
            },
            {
                color: '#ff00ff',
                opacity: 1,
                size: 2,
            },
        ],
        freeHandHighlight: [
            {
                color: '#ff0000',
                opacity: 0.2,
                size: 10,
            },
            {
                color: '#00ff00',
                opacity: 0.2,
                size: 10,
            },
            {
                color: '#0000ff',
                opacity: 0.2,
                size: 10,
            },
            {
                color: '#ff00ff',
                opacity: 0.2,
                size: 10,
            },
        ],
    },
    activePresetIndex: {
        highlight: 0,
        underline: 0,
        strikeout: 0,
        text: 0,
        area: 0,
        draw: 0,
        freeHandHighlight: 0,
    },
};
const loadPdf = function (args, callback) {
    const fileBlob = fs.readFileSync(args.filePath);
    window.PDFViewerApplicationOptions.set('fileBlob', fileBlob);
    window._itemInfo = args.itemInfo;
    let docId = args.filePath;
    window._isInLibrary = false;
    if (args.itemInfo) {
        // docId = args.itemInfo.localKey;
        window._isInLibrary = true;
    }
    window._documentId = docId;
    window.initOnlineAnnotation(docId, userPreference);
    if (window.PDFViewerApplication.eventBus) {
        window.PDFViewerApplication.eventBus.dispatch('SDPDFCore_loadPDF');
        // window.PDFViewerApplication.run(window.viewerConfiguration);
        callback('initReady');
    }
};

module.exports = { loadPdf };
