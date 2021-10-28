const isDevelopment = process.env.NODE_ENV !== 'production';

export const PDFVIEWER_WEBVIEW_URL = isDevelopment
    ? `${'./pdfviewer/web/viewer.html' as string}`
    : `saltdog://./pdfviewer/web/viewer.html`;
