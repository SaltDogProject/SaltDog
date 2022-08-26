import { BrowserWindow, ipcMain } from 'electron';
import { EventEmitter } from 'events';
import { noop, uniqueId } from 'lodash';
import { IWindowList } from '~/main/window/constants';
import windowManager from '~/main/window/windowManager';
import log from 'electron-log';
export default class SaltDogMessageChannelMain extends EventEmitter {
    private static _instance: SaltDogMessageChannelMain;
    private _host: BrowserWindow | null = null;
    private _workspace: BrowserWindow | null = null;
    private _callbackIDMap: Map<string, (data: any) => void> = new Map();
    private _bindFns: Map<string, any> = new Map();
    public static getInstance(): SaltDogMessageChannelMain {
        if (!this._instance) {
            this._instance = new SaltDogMessageChannelMain();
        }
        return this._instance;
    }
    constructor() {
        super();
        this._refreshBindingIfNeeded();
        ipcMain.on('SALTDOG_IPC_INVOKE', async (e, api, args, id) => {
            // console.log('__ONINCVOKE', e, api, args, id);
            const fn = this._bindFns.get(api);
            if (!fn || typeof fn !== 'function') {
                console.error(`${api} is not a function`);
                return;
            }
            try {
                const result = await fn(args);
                e.sender.send('SALTDOG_IPC_INVOKE_CALLBACK', id, null, result);
            } catch (err) {
                e.sender.send('SALTDOG_IPC_INVOKE_CALLBACK', id, JSON.stringify(err), null);
            }
            // e.sender.send('SALTDOG_IPC_INVOKE_CALLBACK', id, result);
        });
        ipcMain.on('SALTDOG_IPC_INVOKE_CALLBACK', (e, id: string, err: any, result: any) => {
            if (err) {
                log.error('ipc invoke callback err', JSON.parse(err));
            }
            const cbfn = this._callbackIDMap.get(id);
            if (!cbfn || typeof cbfn !== 'function') {
                console.error(`callback ${id} is not a function`);
                return;
            }
            cbfn(result);
        });
        ipcMain.on('SALTDOG_IPC_PUBLISH', (elee, e: string, ...args: any) => {
            // console.log('SALTDOG_IPC_PUBLISH', e);
            this.emit(e, ...args);
        });
    }
    private _refreshBindingIfNeeded() {
        if (!this._host || !this._workspace) {
            this._host = windowManager.get(IWindowList.PLUGIN_HOST);
            this._workspace = windowManager.get(IWindowList.WORKSPACE_WINDOW);
        }
    }
    public invokeSelf(api: string, args: any, callback: (data: any) => void): void {
        const fn = this._bindFns.get(api);
        if (!fn || typeof fn !== 'function') {
            console.error(`${api} is not a function`);
            return;
        }
        callback(fn(args));
    }

    public invokePluginHost(api: string, args: any, callback?: (data: any) => void): void {
        this._refreshBindingIfNeeded();
        const id = uniqueId();
        this._callbackIDMap.set(
            id,
            callback
                ? callback
                : () => {
                      noop();
                  }
        );
        this._host!.webContents.send('SALTDOG_IPC_INVOKE', api, args, id);
    }
    public invokeWorkspace(api: string, args: any, callback?: (data: any) => void): void {
        this._refreshBindingIfNeeded();
        const id = uniqueId();
        this._callbackIDMap.set(
            id,
            callback
                ? callback
                : () => {
                      noop();
                  }
        );
        this._workspace!.webContents.send('SALTDOG_IPC_INVOKE', api, args, id);
    }
    public publish(events: string, ...args: any) {
        this._refreshBindingIfNeeded();
        this._workspace!.webContents.send('SALTDOG_IPC_PUBLISH', events, ...args);
        this._host!.webContents.send('SALTDOG_IPC_PUBLISH', events, ...args);
    }
    public subscribe(events: string, callback: (...args: any) => any) {
        this.on(events, callback);
    }
    public onInvoke(api: string, fn: (args: any) => Promise<any>): void {
        if (this._bindFns.has(api)) {
            console.warn(`Already regist ${api}, this will override`);
        }
        this._bindFns.set(api, fn);
    }
    public onInvokeSync(api: string, fn: (e: Electron.IpcMainEvent, ...args: any[]) => void): void {
        ipcMain.on(api, fn);
    }
    public execCommand(command: string, ...args: any) {
        this.emit(`onCommand:${command}`, ...args);
        this.publish(`onCommand:${command}`, ...args);
    }
}
