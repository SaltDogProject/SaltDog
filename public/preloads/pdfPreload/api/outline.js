const { waitUntilDocumentLoad } = require('./utils');
const getOutline = function (args, callback) {
    waitUntilDocumentLoad(() => {
        window.PDFViewerApplication.pdfDocument.getOutline().then((o) => {
            callback(o);
        });
    });
};

const jumpToTarget = function (pdfLinkServiceTargetId) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore] JumpToTarget', pdfLinkServiceTargetId);
        window.PDFViewerApplication.pdfLinkService.goToDestination(pdfLinkServiceTargetId);
    });
    // "_OPENTOPIC_TOC_PROCESSING_d114e58055"
};

module.exports = {
    getOutline,
    jumpToTarget,
};
