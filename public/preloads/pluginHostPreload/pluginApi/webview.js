const { EventEmitter } = require('eventemitter3');
const messageChannel = require('../messageChannel.js');
const WebviewContent = require('./webviewContent');
const bus = require('../bus');
const uniqId = require('licia/uniqId');
const TAG = '[WebviewAgent]'
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

class WebviewAgent {
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

function createWebview(args, callback) {
    messageChannel.invoke('createWebview', args, (id) => {
        if(!id) callback&&callback();
        callback&&callback(new Proxy(new WebviewAgent(id),{
            get(target, key) {
                if (target[key]) return target[key];
                else {
                    console.log(TAG,`Call Webview Api "${key}".`);
                    return function (args, callback) {
                        messageChannel.invoke("_handleWebviewMethod", {
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

module.exports = {
    WebviewAgent,
    createWebview
}
