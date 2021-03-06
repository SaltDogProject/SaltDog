import { IWindowList, ENTRY_WINDOW_URL, WORKSPACE_WINDOW_URL, PLUGINHOST_URL } from './constants';
import { IWindowListItem } from '#/types/electron';
import { app, ipcMain } from 'electron';
import { IBrowserWindowOptions } from '#/types/browserWindow';
import { IpcMainEvent } from 'electron/main';
import saltDogPlugin from '../apis/plugin/index';
import SaltDogMessageChannelMain from '../apis/plugin/api/messageChannel';
import Reader from '../apis/reader';
const windowList = new Map<IWindowList, IWindowListItem>();
declare const __static: string;
const TAG = '[Main/WindowList]';
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
            options.icon = `${'file:///' + __static}/images/logo.png`;
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
    multiple: false,
    options() {
        const options: IBrowserWindowOptions = {
            height: 800,
            width: 1200,
            show: true, //false, // ?????????
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
            options.icon = `${'file:///' + __static}/images/logo.png`;
        }
        return options;
    },
    callback(window, windowManager) {
        window.loadURL(WORKSPACE_WINDOW_URL);
        window.webContents.openDevTools();
        Reader.getInstance();
        ipcMain.on('getWindowId', (e: IpcMainEvent, str: string) => {
            e.returnValue = window.id;
        });
        // ???????????????????????????????????????
        window.webContents.on('will-navigate', (event, url) => {
            console.log(TAG, 'will-navigate', url);
            if (
                process.env.NODE_ENV !== 'development' ||
                (process.env.NODE_ENV === 'development' && !url.startsWith('http://localhost'))
            ) {
                SaltDogMessageChannelMain.getInstance().publish('onCommand:saltdog.openExternal', url);
                event.preventDefault();
            }
        });

        window.on('closed', () => {
            // ?????????schema?????????????????????????????????app???????????????????????????quit???????????????????????????????????????
            try {
                const pluginHost = windowManager.get(IWindowList.PLUGIN_HOST);
                pluginHost && pluginHost.close();
                if (process.platform === 'linux') {
                    process.nextTick(() => {
                        app.quit();
                    });
                }
            } catch (e) {
                console.error(e);
            }
        });
    },
});

// PLUGIN_HOST
windowList.set(IWindowList.PLUGIN_HOST, {
    isValid: true,
    multiple: false,
    options() {
        const options: IBrowserWindowOptions = {
            height: 800,
            width: 1200,
            show: false,
            fullscreenable: false,
            resizable: false,
            title: 'SaltDog-PluginHost',
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
            options.icon = `${'file:///' + __static}/images/logo.png`;
        }
        return options;
    },
    callback(window, windowManager) {
        console.log('Starting PluginHost..');
        window.loadURL(PLUGINHOST_URL);
        window.webContents.openDevTools({
            mode: 'detach',
        });
        function getHostWindowIdSync(e: IpcMainEvent, str: string) {
            e.returnValue = window.webContents.id;
        }
        ipcMain.on('getPluginHostWindowId', getHostWindowIdSync);

        window.on('closed', () => {
            ipcMain.off('getPluginHostWindowId', getHostWindowIdSync);
            if (process.platform === 'linux') {
                process.nextTick(() => {
                    app.quit();
                });
            }
        });
    },
});

export default windowList;
