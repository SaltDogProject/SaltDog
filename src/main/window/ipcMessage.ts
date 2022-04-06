import { ipcMain, dialog } from 'electron';
import { IWindowManager } from '~/utils/types/electron';
import { IWindowList } from './constants';
import { extend } from 'lodash';
import pluginManager from '../apis/plugin/index';
import db from '../apis/db/index';
export function initIpc(windowManager: IWindowManager): void {
    console.log('[IPC] inited');
    ipcMain.on('openFileDialog', (e, msg) => {
        dialog
            .showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Documents', extensions: ['pdf'] }] })
            .then((res) => {
                console.log(res);
                e.reply('openFileDialogReply', res);
            });
    });
    ipcMain.on('openWorkspace', (e, config) => {
        const window = windowManager.create(IWindowList.WORKSPACE_WINDOW, config);
        // window!.on('ready-to-show', () => {
        //     window!.show();
        //     // console.log(windowManager.has(IWindowList.ENTRY_WINDOW), windowManager.get(IWindowList.ENTRY_WINDOW)!.id);
        //     if (windowManager.has(IWindowList.ENTRY_WINDOW)) {
        //         windowManager.closeById(windowManager.get(IWindowList.ENTRY_WINDOW)!.id);
        //     }
        // });
        const _cfg = extend(config, { windowId: window!.id });
        window!.webContents.on('did-finish-load', () => {
            window!.webContents.send('initWorkspace', _cfg);
        });
    });
    ipcMain.on('minimize-window', (e, msg) => {
        windowManager.minimizeById(msg);
    });
    ipcMain.on('close-window', (e, msg) => {
        windowManager.closeById(msg);
    });
    ipcMain.on('getBasicInfoSync', (e, msg) => {
        // console.log('[IPC] getBasicInfoSync');
        e.returnValue = {
            plugins: pluginManager.workspaceGetBasicPluginInfo(),
        };
    });
    // plugin webview->plugin host
    ipcMain.on('PLUGINWEBVIEW_IPC', (e, msg) => {
        // console.log('[MAIN] PLUGINWEBVIEW_IPC', msg);
        pluginManager.sendToPluginHost(msg[0]);
    });

    // db
    ipcMain.on('DBSYNC',(e,method,key='',value='')=>{
        //const allowMethod = ['read','get','set','has','insert','unset','getById','removeById','getConfigPath'];
        let returnValue;
        switch(method){
            case 'read':
                returnValue=db.read();
                return;
            case 'get':
                returnValue = db.get(key);
                return;
            case 'set':
                returnValue = db.set(key,value);
                return;
            case 'has':
                returnValue = db.has(key);
                return;
            case 'insert':
                returnValue = db.insert(key,value);
                return;
            case 'unset':
                returnValue = db.unset(key,value);
                return;
            case 'getById':
                returnValue = db.getById(key,value);
                return;
            case 'removeById':
                returnValue = db.removeById(key,value);
                return;
            case 'getConfigPath':
                returnValue = db.getConfigPath();
                return;
            default:
                console.error('Bad DB IPC',method);
        }
        e.returnValue = returnValue;
    })
}
