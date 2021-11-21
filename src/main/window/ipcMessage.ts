import { ipcMain, dialog } from 'electron';
import { IWindowManager } from '~/utils/types/electron';
import { IWindowList } from './constants';
import { extend } from 'lodash';
import pluginManager from '../apis/plugin/index';
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
        console.log('[IPC] getBasicInfoSync');
        e.returnValue = {
            plugins: pluginManager.workspaceGetBasicPluginInfo(),
        };
    });
}
