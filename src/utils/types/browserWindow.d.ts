export interface IBrowserWindowOptions {
    height: number;
    width: number;
    show: boolean;
    fullscreenable: boolean;
    resizable: boolean;
    webPreferences: {
        nodeIntegration: boolean;
        nodeIntegrationInWorker: boolean;
        backgroundThrottling: boolean;
        webSecurity?: boolean;
        contextIsolation: boolean;
        webviewTag?: boolean;
    };
    vibrancy?: string | any;
    frame?: boolean;
    center?: boolean;
    title?: string;
    titleBarStyle?: string | any;
    backgroundColor?: string;
    autoHideMenuBar?: boolean;
    transparent?: boolean;
    icon?: string;
    skipTaskbar?: boolean;
    alwaysOnTop?: boolean;
}
