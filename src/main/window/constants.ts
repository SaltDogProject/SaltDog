export enum IWindowList {
    ENTRY_WINDOW = 'ENTRY_WINDOW',
    WORKSPACE_WINDOW = 'WORKSPACE_WINDOW',
    PLUGIN_HOST = 'PLUGIN_HOST',
}
const isDevelopment = process.env.NODE_ENV === 'development';

export const ENTRY_WINDOW_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'entry.html') as string}`
    : `file://${__dirname}/entry.html`; // saltdog://./

export const WORKSPACE_WINDOW_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'workspace.html') as string}`
    : `file://${__dirname}/workspace.html`;

export const PLUGINHOST_URL = isDevelopment
    ? `${(process.env.WEBPACK_DEV_SERVER_URL + 'pluginhost.html') as string}`
    : `file://${__dirname}/pluginhost.html`;
