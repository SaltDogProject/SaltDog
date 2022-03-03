function waitUntilDocumentLoad(fn, ...args) {
    if (!window.PDFViewerApplication.pdfDocument) {
        window.PDFViewerApplication.eventBus.on('documentloaded', () => {
            fn(...args);
        });
    } else {
        fn(...args);
    }
}

module.exports = { waitUntilDocumentLoad };
