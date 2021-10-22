import { IWindowList, ENTRY_WINDOW_URL } from './constants';
import { IWindowListItem } from '#/types/electron';
import { app } from 'electron';
import { IBrowserWindowOptions } from '#/types/browserWindow';
const windowList = new Map<IWindowList, IWindowListItem>();

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
            options.icon = `../../static/logo.png`;
        }
        return options;
    },
    callback(window, windowManager) {
        window.loadURL(ENTRY_WINDOW_URL);
        if (!process.env.IS_TEST) window.webContents.openDevTools();
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
