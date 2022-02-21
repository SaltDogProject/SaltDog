const isDevelopment = process.env.NODE_ENV !== 'production';


export const PDFVIEWER_WEBVIEW_PRELOAD_URL = isDevelopment
    ? `${'./pdfviewer/web/preload.js' as string}`
    : `saltdog://./pdfviewer/web/preload.js`;
