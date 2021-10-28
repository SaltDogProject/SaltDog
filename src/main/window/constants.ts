export enum IWindowList {
    ENTRY_WINDOW = 'ENTRY_WINDOW',
    WORKSPACE_WINDOW = 'WORKSPACE_WINDOW',
}
const isDevelopment = process.env.NODE_ENV !== 'production';

export const ENTRY_WINDOW_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'entry.html') as string}`
    : `saltdog://./entry.html`;

export const WORKSPACE_WINDOW_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'workspace.html') as string}`
    : `saltdog://./workspace.html`;
