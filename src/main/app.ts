'use strict';

import { app, protocol, BrowserWindow, ipcMain, shell } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { IWindowList } from './window/constants';
// import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== 'production';
import windowManager from './window/windowManager';
import { dbChecker } from './apis/db/dbChecker';
import SaltDogMessageChannelMain from './apis/plugin/api/messageChannel';
import saltDogPlugin from './apis/plugin/index';
import { initIpc } from './window/ipcMessage';
import { ISaltDogPluginMessageType } from './apis/plugin/constant';
import Parser from './apis/parser/parser';
class LifeCycle {
    private pluginManager = saltDogPlugin;
    beforeReady() {
        // Scheme must be registered before the app is ready
        protocol.registerSchemesAsPrivileged([{ scheme: 'saltdog', privileges: { secure: true, standard: true } }]);
        dbChecker();
        initIpc(windowManager);
        Parser.getInstance();
        SaltDogMessageChannelMain.getInstance();
        SaltDogMessageChannelMain.getInstance().subscribe('_pluginHostReady', () => {
            console.log('[Main] _pluginHostReady');
            saltDogPlugin.init();
        });
        app.on('browser-window-focus', (e, window) => {
            windowManager.setFocusWindow(window);
        });
        // ipcMain.on('_rendererToPluginEvents', (e, events, data) => {
        //     this.pluginManager.publishEventToPluginHost(events, data);
        // });
    }
    onReady() {
        const readyFunction = async () => {
            /* disable this to accelerate launch speed in debug mode*/
            // if (isDevelopment && !process.env.IS_TEST) {
            //     // Install Vue Devtools
            //     try {
            //         await installExtension(VUEJS3_DEVTOOLS);
            //     } catch (e: any) {
            //         console.error("Vue Devtools failed to install:", e.toString());
            //     }
            // }
            // Create the entry window.
            //windowManager.create(IWindowList.ENTRY_WINDOW, {});
            // FIXME: debug create the WORKSPACE window
            windowManager.create(IWindowList.WORKSPACE_WINDOW);
            windowManager.create(IWindowList.PLUGIN_HOST);
        };
        if (!app.isReady()) {
            // This method will be called when Electron has finished
            // initialization and is ready to create browser windows.
            // Some APIs can only be used after this event occurs.
            app.on('ready', readyFunction);
        } else {
            readyFunction();
        }
    }
    onRunning() {
        app.on('activate', () => {
            createProtocol('saltdog');
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            // if (!windowManager.has(IWindowList.ENTRY_WINDOW)) {
            //     windowManager.create(IWindowList.ENTRY_WINDOW);
            // }
            // app.setLoginItemSettings({
            //     openAtLogin: db.get('settings.autoStart') || false
            //   })
            if (process.platform === 'win32') {
                app.setAppUserModelId('top.lgyserver.saltdog');
            }
        });
    }
    onQuit() {
        // Quit when all windows are closed.
        app.on('window-all-closed', () => {
            // On macOS it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            console.log('window-all-closed');
            if (process.platform !== 'darwin') {
                // this.pluginManager.destroyAllPluginHosts();
                app.quit();
            }
        });
        app.on('will-quit', () => {
            // TODO: quit之前调用
        });
        // Exit cleanly on request from parent process in development mode.
        if (isDevelopment) {
            if (process.platform === 'win32') {
                process.on('message', (data) => {
                    if (data === 'graceful-exit') {
                        app.quit();
                    }
                });
            } else {
                process.on('SIGTERM', () => {
                    app.quit();
                });
            }
        }
    }
    launchApp() {
        this.beforeReady();
        this.onReady();
        this.onRunning();
        this.onQuit();
    }
}
const saltDogApp = new LifeCycle();
export { saltDogApp };
