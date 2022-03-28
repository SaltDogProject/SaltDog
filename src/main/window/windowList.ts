import { IWindowList, ENTRY_WINDOW_URL, WORKSPACE_WINDOW_URL } from './constants';
import { IWindowListItem } from '#/types/electron';
import { app, ipcMain } from 'electron';
import { IBrowserWindowOptions } from '#/types/browserWindow';
import { IpcMainEvent } from 'electron/main';
const windowList = new Map<IWindowList, IWindowListItem>();
declare const __static: string;
// entry
windowList.set(IWindowList.ENTRY_WINDOW, {
    isValid: true,
    multiple: false,
    options() {
        const options: IBrowserWindowOptions = {
            height: 450,
            width: 800,
            show: true,
            frame: true,
            center: true,
            fullscreenable: false,
            resizable: false,
            title: 'SaltDog',
            vibrancy: 'ultra-dark',
            transparent: true,
            titleBarStyle: 'hidden',
            webPreferences: {
                backgroundThrottling: false,
                nodeIntegration: true,
                contextIsolation: false,
                nodeIntegrationInWorker: true,
                webSecurity: false,
            },
        };
        if (process.platform !== 'darwin') {
            options.frame = false;
            options.backgroundColor = '#3f3c37';
            options.transparent = false;
            options.icon = `${__static}/images/logo.png`;
        }
        return options;
    },
    callback(window, windowManager) {
        window.loadURL(ENTRY_WINDOW_URL);
        if (process.env.NODE_ENV == 'development') window.webContents.openDevTools();
        window.on('closed', () => {
            if (process.platform === 'linux') {
                process.nextTick(() => {
                    app.quit();
                });
            }
        });
    },
});

// workspace
windowList.set(IWindowList.WORKSPACE_WINDOW, {
    isValid: true,
    multiple: true,
    options() {
        const options: IBrowserWindowOptions = {
            height: 800,
            width: 1200,
            show: true, //false, // 预加载
            frame: true,
            center: true,
            fullscreenable: false,
            resizable: true,
            title: 'SaltDog',
            vibrancy: 'ultra-dark',
            transparent: true,
            titleBarStyle: 'hidden',
            webPreferences: {
                backgroundThrottling: false,
                nodeIntegration: true,
                contextIsolation: false,
                nodeIntegrationInWorker: true,
                webSecurity: false,
                webviewTag: true,
            },
        };
        if (process.platform !== 'darwin') {
            options.frame = false;
            //options.backgroundColor = '#3f3c37';
            options.transparent = false;
            options.icon = `${__static}/images/logo.png`;
        }
        return options;
    },
    callback(window, windowManager) {
        window.loadURL(WORKSPACE_WINDOW_URL);
        window.webContents.openDevTools();
        ipcMain.on('getWindowId', (e: IpcMainEvent, str: string) => {
            e.returnValue = window.id;
        });
        window.on('closed', () => {
            if (process.platform === 'linux') {
                process.nextTick(() => {
                    app.quit();
                });
            }
        });
    },
});

export default windowList;
