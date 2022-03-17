// @ts-nocheck
import mainTabManager from '../../components/tabs/tabManager';
const TAG = '[SaltDogPlugin Webview]';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function createWebview(arg:any,callback:any):void{
    console.log(TAG,"Create Webview",arg);
    mainTabManager.addPluginTab(this,arg.title,arg.url,(id)=>{
        callback&&callback(id);
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
    callback&&callback(ret);
    }else{
        console.error(TAG,'No such webview');
        callback&&callback({message:"No such webview"})
    }
}

function _registerWebviewContentEvent(arg:any,callback?:any):void{
    const {webviewId} = arg;
    const handler = mainTabManager.getMessageHandler(webviewId);
    if(handler){
    console.log(TAG,"_registerWebviewContentEvent",arg);
    arg.owner = this.hostIdentity;
    handler.invokeWebview('_requestAddEventListener',arg,(msg)=>{
        callback&&callback(msg)
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
        callback&&callback(msg)
    });
    }else{
        console.error(TAG,'No such webview');
    }
}

function getCurrentTabInfo(arg:any,callback?:any){
    const webviewId = mainTabManager.getCurrentTab();
    const info = mainTabManager.getTabInfo(webviewId);
    callback&&callback(info);
}

function getTabInfo(arg:any,callback?:any){
    callback&&callback(mainTabManager.getTabInfo(arg.webviewId));
}

function createPDFView(arg:any,callback?:any){
    console.log(TAG,"Create PDFView",arg);
    const id = mainTabManager.addPdfTab(arg.title,arg.pdfPath,this.owner);
    callback&&callback(id);
}
function _handlePDFViewMethod(arg:any,callback?:any){
    const info = mainTabManager.getTabInfo(arg.webviewId);
    if(!info||!info.isPdf){
        console.error(TAG,'_handlePDFViewMethod target must be a pdfView!');
    }
    const handler=mainTabManager.getMessageHandler(arg.webviewId);
    handler.invokeWebview(
        arg.method,
        arg.originalArgs,
        (msg: any) => {
            callback&&callback(msg);
        }
    );
}
export default {
getCurrentTabInfo,
getTabInfo,

createPDFView,
createWebview,
_handleWebviewMethod,
_handlePDFViewMethod,
_registerWebviewContentEvent,
_removeWebviewContentEvent
}