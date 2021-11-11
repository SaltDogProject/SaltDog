import { ipcMain, dialog } from 'electron';
import { IWindowManager } from '~/utils/types/electron';
import { IWindowList } from './constants';
export function initIpc(windowManager: IWindowManager): void {
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
        window!.on('ready-to-show', () => {
            window!.show();
            if (windowManager.has(IWindowList.ENTRY_WINDOW)) {
                windowManager.deleteById(windowManager.get(IWindowList.ENTRY_WINDOW)!.id);
            }
        });
        window!.webContents.on('did-finish-load', () => {
            window!.webContents.send('initWorkspace', config);
        });
    });
}
