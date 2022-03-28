export enum IWindowList {
    ENTRY_WINDOW = 'ENTRY_WINDOW',
    WORKSPACE_WINDOW = 'WORKSPACE_WINDOW',
    PLUGIN_HOST_WINDOW = 'PLUGIN_HOST_WINDOW',
}
const isDevelopment = process.env.NODE_ENV !== 'production';

export const ENTRY_WINDOW_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'entry.html') as string}`
    : `file://${__dirname}/entry.html`; // saltdog://./

export const WORKSPACE_WINDOW_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'workspace.html') as string}`
    : `file://${__dirname}/workspace.html`;
