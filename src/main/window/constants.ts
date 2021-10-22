export enum IWindowList {
    ENTRY_WINDOW = 'ENTRY_WINDOW',
}
const isDevelopment = process.env.NODE_ENV !== 'production';

export const ENTRY_WINDOW_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'entry.html') as string}`
    : `saltdog://./entry.html`;
