// @ts-nocheck
import mainTabManager from '../../components/tabs/tabManager';
const TAG = '[SaltDogPlugin Webview]';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function createWebview(arg:any,callback:any):void{
    console.log(TAG,"Create Webview",arg);
    mainTabManager.addPluginTab(this,arg.title,arg.url,(id)=>{
        callback(id);
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function _handleWebviewMethod(arg:any,callback:any):void{

    const webviewId = arg.webviewId;
    const args = arg.originalArgs;
    const method = arg.method;
    const webview = mainTabManager.getWebviewById(webviewId);
    if(webview){
    console.log(TAG,"_handleWebviewMethod",arg);
    const ret = webview[method](...args);
    callback(ret);
    }else{
        console.error(TAG,'No such webview');
        callback({message:"No such webview"})
    }
}

function _registerWebviewContentEvent(arg:any,callback?:any):void{
    const {webviewId} = arg;
    const handler = mainTabManager.getMessageHandler(webviewId);
    if(handler){
    console.log(TAG,"_registerWebviewContentEvent",arg);
    arg.owner = this.hostIdentity;
    handler.invokeWebview('_requestAddEventListener',arg,(msg)=>{
        callback(msg)
    });
    }else{
        console.error(TAG,'No such webview');
    }
}

function _removeWebviewContentEvent(arg:any,callback?:any):void{
    const {webviewId} = arg;
    const handler = mainTabManager.getMessageHandler(webviewId);
    if(handler){
    console.log(TAG,"_registerWebviewContentEvent",arg);
    handler.invokeWebview('_requestRemoveAddEventListener',arg,(msg)=>{
        callback(msg)
    });
    }else{
        console.error(TAG,'No such webview');
    }
}
export default {
createWebview,
_handleWebviewMethod,
_registerWebviewContentEvent,
_removeWebviewContentEvent
}