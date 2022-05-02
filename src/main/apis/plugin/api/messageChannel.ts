import { BrowserWindow, ipcMain } from "electron";
import { EventEmitter } from "events";
import { noop, uniqueId } from "lodash";
import { IWindowList } from "~/main/window/constants";
import windowManager from "~/main/window/windowManager";
export default class SaltDogMessageChannelMain extends EventEmitter{
    private static _instance: SaltDogMessageChannelMain;
    private _host: BrowserWindow|null=null;
    private _workspace:BrowserWindow|null=null;
    private _callbackIDMap:Map<string,(data:any)=>void> = new Map();
    public static getInstance(): SaltDogMessageChannelMain {
        if (!this._instance) {
            this._instance = new SaltDogMessageChannelMain();
        }
        return this._instance;
    }
    constructor(){
        super();
        this._refreshBindingIfNeeded();
        ipcMain.on('SALTDOG_IPC_INVOKE_CALLBACK',(e,id:string,result:any)=>{
            const cbfn = this._callbackIDMap.get(id);
            if(!cbfn|| typeof cbfn !== 'function') {
                console.error(`callback ${id} is not a function`);
                return;
            }
            cbfn(result);
        });
    }
    private _refreshBindingIfNeeded(){
        if(!this._host||!this._workspace){
        this._host = windowManager.get(IWindowList.PLUGIN_HOST);
        this._workspace = windowManager.get(IWindowList.WORKSPACE_WINDOW);
        }
    }
    public invokePluginHost(api: string, args: any, callback?: (data: any) => void):void{
        this._refreshBindingIfNeeded();
        const id = uniqueId();
        this._callbackIDMap.set(id,callback?callback:()=>{noop()});
        this._host!.webContents.send('SALTDOG_IPC_INVOKE',api,args,id);
    }
    public invokeWorkspace(api: string, args: any, callback?: (data: any) => void):void{
        this._refreshBindingIfNeeded();
        this._refreshBindingIfNeeded();
        const id = uniqueId();
        this._callbackIDMap.set(id,callback?callback:()=>{noop()});
        this._workspace!.webContents.send('SALTDOG_IPC_INVOKE',api,args,id);
    }
    public publish(events:string,...args:any){
        this._refreshBindingIfNeeded();
        this._workspace!.webContents.send('SALTDOG_IPC_PUBLISH',events,...args);
    }
}