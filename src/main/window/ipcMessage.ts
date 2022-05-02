import { ipcMain, dialog } from 'electron';
import { IWindowManager } from '~/utils/types/electron';
import { IWindowList } from './constants';
import { extend } from 'lodash';
import pluginManager from '../apis/plugin/index';
import db from '../apis/db/index';
import LibraryDB from '../apis/db/libraryDB/libraryDB';
import Parser from '../apis/parser/parser';
import { buildSettingsTemplate } from '../apis/db/index';
const TAG = '[Main/IPC]';
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
        pluginManager.sendToPluginHost('PLUGINWEBVIEW_INVOKE', msg[0]);
    });

    // db
    ipcMain.on('DBSYNC', (e, method, key = '', value = '') => {
        //const allowMethod = ['read','get','set','has','insert','unset','getById','removeById','getConfigPath'];
        let returnValue;
        switch (method) {
            case 'read':
                returnValue = db.read();
                break;
            case 'get':
                returnValue = db.get(key);
                break;
            case 'set':
                returnValue = db.set(key, value);
                break;
            case 'has':
                returnValue = db.has(key);
                break;
            case 'insert':
                returnValue = db.insert(key, value);
                break;
            case 'unset':
                returnValue = db.unset(key, value);
                break;
            case 'getById':
                returnValue = db.getById(key, value);
                break;
            case 'removeById':
                returnValue = db.removeById(key, value);
                break;
            case 'getConfigPath':
                returnValue = db.getConfigPath();
                break;
            default:
                console.error('Bad DB IPC', method);
        }
        e.returnValue = returnValue;
    });

    ipcMain.on('getSettingsTemplate', (e) => {
        const pluginSettings = pluginManager.collectSettingsInfo();
        e.returnValue = buildSettingsTemplate(pluginSettings);
    });

    ipcMain.on('invokeLibraryMethod', (e, fn, id, ...args) => {
        console.log(TAG, 'invokeLibraryMethod', fn, id, ...args);
        try {
            const libraryDB = LibraryDB.getInstance();
            if (typeof libraryDB[fn] == 'function') {
                const rtData = libraryDB[fn](...args);
                e.sender.send('invokeLibraryMethodReply', id, null, rtData);
            } else {
                e.sender.send('invokeLibraryMethodReply', id, 'Bad Method', null);
            }
        } catch (err: any) {
            console.error(err);
            e.sender.send(`invokeLibraryMethodReply`, id, err.message ? err.message : JSON.stringify(err), null);
        }
    });

    ipcMain.on('retriveMetadata', async (e, id, type, data) => {
        console.log(TAG, 'retriveMetadata', id, type, data);
        try {
            const parser = Parser.getInstance();
            const _type = type,
                _data = data;
            // if (type == 'pdf') {
            //     const doi = await parser.extractID(data);
            //     _type = 'search';
            //     _data = doi.value;
            // }
            parser.query(_type, _data, (err: any, res: any) => {
                e.sender.send(`retriveMetadataReply_${id}`, err, res);
            });
        } catch (err: any) {
            console.error(err);
        }
    });
}
