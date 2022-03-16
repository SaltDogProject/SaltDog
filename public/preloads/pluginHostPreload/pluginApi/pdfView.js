const { EventEmitter } = require('eventemitter3');
const messageChannel = require('../messageChannel.js');
const bus = require('../bus');
const uniqId = require('licia/uniqId');
const TAG = '[PDFViewAgent]'
var eventList = [
    'load-commit',
    'did-finish-load',
    'did-fail-load',
    'did-frame-finish-load',
    'did-start-loading',
    'did-stop-loading',
    'did-attach',
    'dom-ready',
    'page-title-updated',
    'page-favicon-updated',
    'enter-html-full-screen',
    'leave-html-full-screen',
    'console-message',
    'found-in-page',
    'new-window',
    'will-navigate',
    'did-start-navigation',
    'did-redirect-navigation',
    'did-navigate',
    'did-frame-navigate',
    'did-navigate-in-page',
    'close',
    'ipc-message',
    'crashed',
    'plugin-crashed',
    'destroyed',
    'media-started-playing',
    'media-paused',
    'did-change-theme-color',
    'update-target-url',
    'devtools-opened',
    'devtools-closed',
    'devtools-focused',
    'context-menu',
];

class WebviewContent { 
    webviewId;
    registeredEventName = {};
    constructor(id){
        this.webviewId = id;
    }
    // 监听webview内部 dom的EventListener事件（直接映射）
    addEventListener(selector,event,cb,invokeTime){
            messageChannel.invoke('_registerWebviewContentListener',{
                webviewId:this.webviewId,
                selector,
                eventName:event,
                invokeTime
            },(msg)=>{
                if(msg.status!=0){
                    console.error(TAG,`addEventListener ${event} failed: ${msg.msg}`);
                }else{
                    bus.on(`Webview_${this.webviewId}_contentEvent:${msg.id}/${event}`,cb);
                    return msg.id;
                }
            }); 
        
    }
    removeEventListener(id){
        messageChannel.invoke('_removeWebviewContentListener',{
            webviewId:this.webviewId,
            id
        },(msg)=>{
            if(msg.status!=0){
                console.error(TAG,`removeEventListener ${event} failed: ${msg.msg}`);
            }
        }); 
    }
}
class PDFViewAgent {
    webviewId = "";
    content;
    constructor(id) {
        this.webviewId = id;
        this.content = new WebviewContent(id);
    };
    on(event,cb){
        if(eventList.indexOf(event)!=-1){
            bus.on(`Webview_${this.webviewId}_${event}`,(args)=>{
                console.log('[Webview Event]',event,args);
            cb(...args)});
        }else{
            console.log(TAG,'Invalid event name');
        }
    }
}

// 调用webview原生方法的途径：agent.xxx([electron规定的arg，按顺序写成一个list],callback方法)

// {title:,pdfPath:}
function createPDFView(args, callback) {
    messageChannel.invoke('createPDFView', args, (id) => {
        callback(new Proxy(new PDFViewAgent(id),{
            get(target, key) {
                if (target[key]) return target[key];
                else {
                    console.log(TAG,`Call PDFView Api "${key}".`);
                    return function (args, callback) {
                        messageChannel.invoke("_handlePDFViewMethod", {
                            webviewId:id,
                            method:key,
                            originalArgs:args
                        }, (res)=>{callback(res)});
                    };
                }
            },
        }));
    });
}

function getCurrentPDFView(args,callback){
    messageChannel.invoke('getCurrentTabInfo', args, (info) => {
        if(info&&info.isPdf){
        callback(new Proxy(new PDFViewAgent(info.webviewId),{
            get(target, key) {
                if (target[key]) return target[key];
                else {
                    console.log(TAG,`Call PDFView Api "${key}".`);
                    return function (args, callback) {
                        messageChannel.invoke("_handlePDFViewMethod", {
                            webviewId:info.webviewId,
                            method:key,
                            originalArgs:args
                        }, (res)=>{callback&&callback(res)});
                    };
                }
            },
        }));
    }else{
        console.error(TAG,`Current tab is not a PDF Tab.`);
        callback&&callback();
    }
    });
}
module.exports = {
    createPDFView,
    getCurrentPDFView,
}
