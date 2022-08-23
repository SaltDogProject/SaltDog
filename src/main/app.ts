'use strict';
import * as path from 'path';
import { app, protocol, BrowserWindow, ipcMain, shell, nativeTheme, dialog } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { IWindowList } from './window/constants';
// import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";

import windowManager from './window/windowManager';
import { dbChecker } from './apis/db/dbChecker';
import SaltDogMessageChannelMain from './apis/plugin/api/messageChannel';
import saltDogPlugin from './apis/plugin/index';
import { initIpc } from './window/ipcMessage';
import { ISaltDogPluginMessageType } from './apis/plugin/constant';
import Parser from './apis/parser/parser';
import schemaParser from './schema';
import log from 'electron-log';
import { initLog } from './utils/logger';
import { checkUpdate } from './utils/updater';
import { GrobidClient } from './apis/grobid';
const isDevelopment = process.env.NODE_ENV !== 'production';
class LifeCycle {
    private pluginManager = saltDogPlugin;
    beforeReady() {
        // URL Schemes 参数获取 https://segmentfault.com/a/1190000040130782
        const schemaArgs = [];
        if (!app.isPackaged) {
            // dev模式下的测试
            schemaArgs.push(path.resolve(process.argv[1]));
        }
        app.setAsDefaultProtocolClient('saltdog', process.execPath, schemaArgs);
        // Windows监听URL Schema触发
        app.on('second-instance', (event, argv) => {
            if (process.platform === 'win32') {
                // console.log('second-instance', argv);
                schemaParser(argv[3]);
            }
        });

        // macOS监听URL Schema触发
        app.on('open-url', (event, urlStr) => {
            // FIXME: macos schema
            // handleUrl(urlStr);
            if (process.platform === 'darwin') {
                console.log('[WIP] MacOS schema is not supported yet');
            }
        });

        // Scheme must be registered before the app is ready
        protocol.registerSchemesAsPrivileged([{ scheme: 'saltdog', privileges: { secure: true, standard: true } }]);
        dbChecker();
        initIpc(windowManager);
        Parser.getInstance();
        SaltDogMessageChannelMain.getInstance();
        SaltDogMessageChannelMain.getInstance().subscribe('_pluginHostReady', () => {
            console.log('[Main] _pluginHostReady');
            saltDogPlugin.init();
            // 确保Renderer进程启动完毕在检查更新，不然没法弹出更新提示
            checkUpdate();
        });
        app.on('browser-window-focus', (e, window) => {
            windowManager.setFocusWindow(window);
        });
        // FIXME: disable
        nativeTheme.themeSource = 'light';
        // ipcMain.on('_rendererToPluginEvents', (e, events, data) => {
        //     this.pluginManager.publishEventToPluginHost(events, data);
        // });
    }
    onReady() {
        const readyFunction = async () => {
            console.log('App ready');
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
            windowManager.create(IWindowList.WORKSPACE_WINDOW);
            windowManager.create(IWindowList.PLUGIN_HOST);
            /**
             * Windows监听URL Schema触发时候要判断一下是否是第一次启动
             *  应用处于打开状态，会触发 second-instance 事件并接收这个 URL。
                应用处于未打开状态，在网页端通过浏览器调起应用之后不会触发 second-instance 事件；这个时候需要主动判断应用是否是从网页端调起，并主动触发 second-instance 事件；
                在 window 里面判断是否是从网页端的标准：如果是通过url schema启动，其启动参数会超过1个

             */
            if (process.argv.length > 1) {
                if (!app.isReady()) {
                    app.once('browser-window-created', () => {
                        // app 未打开时，通过 open-url打开 app，此时可能还没 ready，需要延迟发送事件
                        // 此段ready延迟无法触发 service/app/ open-url 处理，因为saga初始化需要时间
                        app.emit('second-instance', null, process.argv);
                    });
                } else {
                    app.emit('second-instance', null, process.argv);
                }
            }
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
        app.on('activate', (ev, hasVisibleWindows) => {
            // createProtocol('saltdog');
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            // app.emit('ready')
            // app.setLoginItemSettings({
            //     openAtLogin: db.get('settings.autoStart') || false
            //   })
            if (app.isReady() && !hasVisibleWindows) {
                if (!windowManager.has(IWindowList.WORKSPACE_WINDOW))
                    windowManager.create(IWindowList.WORKSPACE_WINDOW);
                if (!windowManager.has(IWindowList.PLUGIN_HOST)) windowManager.create(IWindowList.PLUGIN_HOST);
            }
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
            // if (process.platform !== 'darwin') {
            // this.pluginManager.destroyAllPluginHosts();
            app.quit();
            // }
        });
        app.on('will-quit', () => {
            // TODO: quit之前调用
            console.log('will-quit');
        });
        // Exit cleanly on request from parent process in development mode.
        if (isDevelopment) {
            if (process.platform === 'win32') {
                process.on('message', (data) => {
                    if (data === 'graceful-exit') {
                        console.log('Exit with:', data);
                        app.quit();
                    }
                });
            } else {
                process.on('SIGTERM', () => {
                    console.log('Exit with SIGTERM');
                    app.quit();
                });
            }
        }
    }
    launchApp() {
        initLog();
        // 获取单实例锁
        const gotTheLock = app.requestSingleInstanceLock();
        // 貌似macos会常驻，到时候直接创建窗口就行？
        if (!gotTheLock && process.platform != 'darwin') {
            // 如果获取失败，说明已经有实例在运行了，直接退出
            console.log('Already running ,exit');
            app.quit();
        }
        this.beforeReady();
        this.onReady();
        this.onRunning();
        this.onQuit();
    }
}
const saltDogApp = new LifeCycle();
export { saltDogApp };
