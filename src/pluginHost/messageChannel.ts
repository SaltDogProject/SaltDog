import { ipcMain, ipcRenderer } from 'electron';
import EventEmitter from 'events';
import { uniqueId } from 'lodash';
import { SaltDogRendererType } from '../utils/consts';

export default class SaltDogMessageChannelRenderer extends EventEmitter implements SaltDogMessageChannelRenderer {
    private _workspaceID: number;
    private _hostID: number;
    private _whoami: SaltDogRendererType;
    private _callbackIDMap: Map<string, (data: any) => void> = new Map();
    private _bindFns: Map<string, any> = new Map();
    private static _instance: SaltDogMessageChannelRenderer | null = null;
    public static getInstance() {
        if (!this._instance) {
            this._instance = new SaltDogMessageChannelRenderer();
        }
        return this._instance;
    }
    constructor() {
        super();
        const { pluginHostID, workspaceID } = ipcRenderer.sendSync('getWindowInfoSync');
        this._hostID = pluginHostID;
        this._workspaceID = workspaceID;
        this._whoami = SaltDogRendererType.PLUGINHOST;
        ipcRenderer.on('SALTDOG_IPC_INVOKE', async (e, api, args, id) => {
            // console.log('__ONINCVOKE', e, api, args, id);
            const fn = this._bindFns.get(api);
            if (!fn || typeof fn !== 'function') {
                console.error(`${api} is not a function`);
                return;
            }
            const result = await fn(args);
            console.log('__SENDCALLBACK', id, result, e.sender, e.senderId);
            if (e.senderId == 0) {
                // main不知道为啥不能sendto
                e.sender.send('SALTDOG_IPC_INVOKE_CALLBACK', id, result);
            } else ipcRenderer.sendTo(e.senderId, 'SALTDOG_IPC_INVOKE_CALLBACK', id, result);
            // e.sender.send('SALTDOG_IPC_INVOKE_CALLBACK', id, result);
        });
        ipcRenderer.on('SALTDOG_IPC_INVOKE_CALLBACK', (e, id: string, result: any) => {
            const cbfn = this._callbackIDMap.get(id);
            if (!cbfn || typeof cbfn !== 'function') {
                console.error(`callback ${id} is not a function`);
                return;
            }
            cbfn(result);
        });
        ipcRenderer.on('SALTDOG_IPC_PUBLISH', (elee, e: string, ...args: any) => {
            this.emit(e, ...args);
        });
    }
    public invokeMainSync(api: string, args: any): any {
        return ipcRenderer.sendSync(api, args);
    }
    public invokeMain(api: string, args: any, callback: (data: any) => void): void {
        const id = uniqueId();
        this._callbackIDMap.set(id, callback);
        ipcRenderer.send('SALTDOG_IPC_INVOKE', api, args, id);
    }
    public invoke(api: string, args: any, callback: (data: any) => void): void {
        let targetid = null;
        switch (this._whoami) {
            case SaltDogRendererType.WORKSPACE:
                targetid = this._hostID;
                break;
            case SaltDogRendererType.PLUGINHOST:
                targetid = this._workspaceID;
                break;
            default:
                console.error('Bad targetid', targetid);
                return;
        }
        const id = uniqueId();
        this._callbackIDMap.set(id, callback);
        ipcRenderer.sendTo(targetid, 'SALTDOG_IPC_INVOKE', api, args, id);
    }
    public onInvoke(api: string, fn: (args: any) => Promise<any>): void {
        if (this._bindFns.has(api)) {
            console.warn(`Already regist ${api}, this will override`);
        }
        this._bindFns.set(api, fn);
    }
    public publish(event: string, ...args: any): void {
        let targetid = null;
        switch (this._whoami) {
            case SaltDogRendererType.WORKSPACE:
                targetid = this._hostID;
                break;
            case SaltDogRendererType.PLUGINHOST:
                targetid = this._workspaceID;
                break;
            default:
                console.error('Bad targetid', targetid);
                return;
        }
        ipcRenderer.sendTo(targetid, 'SALTDOG_IPC_PUBLISH', event, ...args);
        ipcRenderer.send('SALTDOG_IPC_PUBLISH', event, ...args);
    }
    public subscribe(e: string, callback: (...args: any) => void): void {
        this.on(e, callback);
    }
    public registerCommand(command: string, callback: (...args: any) => any) {
        this.on(`onCommand:${command}`, callback);
    }
    public execCommand(command: string, ...args: any) {
        this.emit(`onCommand:${command}`, ...args);
        this.publish(`onCommand:${command}`, ...args);
    }
}
