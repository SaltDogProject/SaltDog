import {ipcRenderer} from 'electron';
import EventEmitter from 'events';
import { uniqueId } from 'lodash';
import { ISaltDogPluginMessageType } from '~/main/apis/plugin/constant';

class PluginHostMessageChannel extends EventEmitter implements SaltDogMessageChannel{
    private _rendererWindowId: number|null = null;
    private _callbackMap = new Map<string,(data:any)=>void>();
    constructor(){
        super();
        ipcRenderer.on(ISaltDogPluginMessageType.PLUGINHOST_INVOKE_CALLBACK,(e,msg:ISaltDogPluginInvokeCallback)=>{
            if(msg.callbackId=='-1') return;
            if(this._callbackMap.has(msg.callbackId)){
                const cbfn = this._callbackMap.get(msg.callbackId);
                cbfn&&cbfn(msg.data);
                this._callbackMap.delete(msg.callbackId);
            }
        });
        ipcRenderer.on(ISaltDogPluginMessageType.PLUGINWEBVIEW_INVOKE,(e,msg:ISaltDogPluginWebviewInvoke)=>{
            this.emit(`webviewMessage:${msg.channel}`,msg);
        });
        ipcRenderer.on(ISaltDogPluginMessageType.HOST_EVENT, (e, msg: IPluginHostEventMessage) => {
            this.emit(msg.event, msg.data);
        });
        
    }
    // bind renderer windowId
    _bindWindowId(windowId: number){
        this._rendererWindowId = windowId;
    }

    // send message to main process, if api don't exist, will send to renderer
    invoke(api: string, args: any,callback?:(data:any)=>void){
        let callbackId = '-1';
        if(callback&&callback instanceof Function){
            callbackId=uniqueId('callback_');
            this._callbackMap.set(callbackId,callback);
        }
        ipcRenderer.emit(ISaltDogPluginMessageType.PLUGINHOST_INVOKE,{
            windowId: this._rendererWindowId,
            api,
            args,
            callbackId
        } as ISaltDogPluginInvoke);
    }


    _sendPluginWebviewCallback(data:any) {
        return (cbdata:any)=>{
        if(cbdata)
        ipcRenderer.emit(ISaltDogPluginMessageType.PLUGINWEBVIEW_INVOKE_CALLBACK,{
            webviewId: data.webviewId,
            windowId: data.windowId,
            data: cbdata,
            callbackId: data.callbackId,
        });
    }
    }
    // plugin use this method to listen webview's "send" request
    onWebviewInvoke(channel:string,callback:(data:string,callback:(result:any)=>void)=>void){
        this.on(`webviewMessage:${channel}`, (data)=>{
            callback(data.data,this._sendPluginWebviewCallback(data));
        });
    }
    onceWebviewInvoke(channel:string,callback:(data:string,callback:(result:any)=>void)=>void){
        this.once(`webviewMessage:${channel}`, (data)=>{
            callback(data.data,this._sendPluginWebviewCallback(data));
        });
    }

    // host use this method to send message to sidebar
    sendToSidebar(name:string,event:string,data:any){
        this.invoke('_hostToSidebarMsg',{
            event,data,
            name
        });
    }
}

export default new PluginHostMessageChannel();