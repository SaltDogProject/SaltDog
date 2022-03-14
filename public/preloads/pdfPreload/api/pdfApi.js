const { waitUntilDocumentLoad } = require('./utils');
const ERROR = -1;
const SUCCESS = 0;
const jumpToSearch = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] requestSearch', args);
        window.PDFViewerApplication.findController._gotoMatch(args.pageIndex, args.matchIndex);
        callback({
            status: SUCCESS,
            msg: `success`,
        });
    });
};
const requestSearch = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] requestSearch', args);
        window.PDFViewerApplication.eventBus.dispatch('find', {
            sdpdfcoreRequestId: args.sdpdfcoreRequestId || -1,
            type: args.type || '',
            query: args.query || '',
            phraseSearch: args.phraseSearch || true,
            caseSensitive: args.caseSensitive || false,
            entireWord: args.entireWord || false,
            highlightAll: args.highlightAll || false,
            findPrevious: args.findPrevious || false,
            matchDiacritics: args.matchDiacritics || false,
        });
        callback({
            status: SUCCESS,
            msg: `success`,
        });
    });
};

const getOutline = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] getOutline', args);
        window.PDFViewerApplication.pdfDocument
            .getOutline()
            .then((o) => {
                callback &&
                    typeof callback == 'function' &&
                    callback({
                        status: SUCCESS,
                        msg: `success`,
                        outline: o,
                    });
            })
            .catch((e) => {
                callback({
                    status: ERROR,
                    msg: `error`,
                    target: e,
                });
            });
    });
};

// args pdfLinkServiceTargetId:string
const jumpToTarget = function (pdfLinkServiceTargetId, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] JumpToTarget', pdfLinkServiceTargetId);
        window.PDFViewerApplication.pdfLinkService.goToDestination(pdfLinkServiceTargetId);
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    });
    // "_OPENTOPIC_TOC_PROCESSING_d114e58055"
};

const getMetadata = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] getMetadata', args);
        const metadata = window.PDFViewerApplication.pdfDocument.getMetadata();
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
                metadata: metadata,
            });
    });
};

const requestPrint = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] requestPrint', args);
        window.PDFViewerApplication.triggerPrinting();
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    });
};

const download = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] download', args);
        window.PDFViewerApplication.triggerPrinting();
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    });
};

const pagesCount = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] pagesCount', args);
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
                pagesCount: window.PDFViewerApplication.pagesCount,
            });
    });
};

// args: number
const gotoPage = function (pageNumber, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] gotoPage', pageNumber);
        if (typeof pageNumber != 'number' && pageNumber > 0) {
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: ERROR,
                    msg: `Invalid arguments: ${pageNumber}`,
                });
        }
        if (pageNumber > window.PDFViewerApplication.pagesCount) {
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: ERROR,
                    msg: `Max pageNumber Exceedd. This pdf only has ${window.PDFViewerApplication.pagesCount} pages.`,
                });
        }
        window.PDFViewerApplication.page = pageNumber;
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    });
};

const nextPage = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] nextPage', args);
        let result = window.PDFViewerApplication.pdfViewer.nextPage();
        if (result) {
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: SUCCESS,
                    msg: `success`,
                });
        } else {
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: ERROR,
                    msg: `error: This document only has ${window.PDFViewerApplication.pagesCount} pages.`,
                });
        }
    });
};

const previousPage = function (args, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] previousPage', args);
        let result = window.PDFViewerApplication.pdfViewer.previousPage();
        if (result) {
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: SUCCESS,
                    msg: `success`,
                });
        } else {
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: ERROR,
                    msg: `error: This document is in page 1.`,
                });
        }
    });
};

//zoomsteps:number
const zoomIn = function (zoomsteps = 1, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] zoomin', zoomsteps);
        window.PDFViewerApplication.pdfViewer.increaseScale(zoomsteps);
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    });
};

const zoomOut = function (zoomsteps = 1, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] zoomOut', zoomsteps);
        window.PDFViewerApplication.pdfViewer.decreaseScale(zoomsteps);
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    });
};

const zoomReset = function (zoomsteps = 1, callback) {
    waitUntilDocumentLoad(() => {
        console.log('[SDPDFCore-API] zoomReset', zoomsteps);
        window.PDFViewerApplication.zoomReset();
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    });
};

// scale: 0.1<=scale<=10 || 'auto' || 'page-actual' || 'page-fit' || 'page-width' || 'custom' || 'page-height'
const setScale = function (scale, callback) {
    if (
        (typeof scale == 'number' && (scale < 10 || scale > 0.1)) ||
        scale == 'auto' ||
        scale == 'page-actual' ||
        scale == 'page-fit' ||
        scale == 'page-width' ||
        scale == 'custom' ||
        scale == 'page-height'
    ) {
        waitUntilDocumentLoad(() => {
            console.log('[SDPDFCore-API] setScale', scale);
            window.PDFViewerApplication.pdfViewer.currentScaleValue = scale;
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: SUCCESS,
                    msg: `success`,
                });
        });
    } else {
        callback &&
            typeof callback == 'function' &&
            callback({
                status: ERROR,
                msg: `error: got unknown scale ${scale}, allowed value: 0.1<=scale<=10 || 'auto' || 'page-actual' || 'page-fit' || 'page-width' || 'custom'`,
            });
    }
};
// angle +-90的倍数
const rotate = function (angle, callback) {
    console.log('[SDPDFCore-API] rotate', angle);
    if (typeof angle != 'number' || angle % 90 != 0) {
        callback &&
            typeof callback == 'function' &&
            callback({
                status: ERROR,
                msg: `error: Angle must be multiple of 90, got ${angle}`,
            });
    } else {
        window.PDFViewerApplication.rotatePages(angle);
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    }
};

// mode number见下
const changeScrollMode = function (mode, callback) {
    const ScrollMode = {
        UNKNOWN: -1,
        VERTICAL: 0,
        HORIZONTAL: 1,
        WRAPPED: 2,
        PAGE: 3,
    };
    console.log('[SDPDFCore-API] changeScrollMode', mode);
    if (Number.isInteger(mode) && Object.values(ScrollMode).includes(mode) && mode !== ScrollMode.UNKNOWN) {
        waitUntilDocumentLoad(() => {
            window.PDFViewerApplication.pdfViewer.scrollMode = mode;
            callback &&
                typeof callback == 'function' &&
                callback({
                    status: SUCCESS,
                    msg: `success`,
                });
        });
    } else {
        callback &&
            typeof callback == 'function' &&
            callback({
                status: ERROR,
                msg: `error: Invalid mode, mode is a number : VERTICAL: 0,HORIZONTAL: 1,WRAPPED: 2,PAGE: 3`,
            });
    }
};

// mode number见下
const changeSpreadMode = function (mode, callback) {
    const SpreadMode = {
        UNKNOWN: -1,
        NONE: 0,
        ODD: 1,
        EVEN: 2,
    };
    console.log('[SDPDFCore-API] changeSpreadMode', mode);
    if (Number.isInteger(mode) && Object.values(SpreadMode).includes(mode) && mode !== SpreadMode.UNKNOWN) {
        window.PDFViewerApplication.pdfViewer.spreadMode = mode;
        callback &&
            typeof callback == 'function' &&
            callback({
                status: SUCCESS,
                msg: `success`,
            });
    } else {
        callback &&
            typeof callback == 'function' &&
            callback({
                status: ERROR,
                msg: `error: Invalid mode, mode is a number : NONE: 0,ODD: 1,EVEN: 2`,
            });
    }
};

module.exports = {
    getOutline,
    requestSearch,
    jumpToSearch,
    jumpToTarget,
    getMetadata,
    requestPrint,
    download,
    pagesCount,
    gotoPage,
    nextPage,
    previousPage,
    zoomIn,
    zoomOut,
    zoomReset,
    setScale,
    rotate,
    changeScrollMode,
    changeSpreadMode,
};
