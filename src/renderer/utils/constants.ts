const isDevelopment = process.env.NODE_ENV !== 'production';

export const PDFVIEWER_WEBVIEW_PRELOAD_URL = isDevelopment
    ? `${'./pdfviewer/web/preload.js' as string}`
    : `file://${__dirname}/pdfviewer/web/preload.js`;

export const PDFAPISTAT = {
    SUCCESS: 0,
    ERROR: 1,
};
