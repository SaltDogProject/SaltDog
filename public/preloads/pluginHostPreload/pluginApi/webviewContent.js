const messageChannel = require('../messageChannel.js');
const TAG = '[PluginHost/webviewContent]';
const bus = require('../bus');
const uniqId = require('licia/uniqId');
class WebviewContent { 
    webviewId;
    registeredEventName = {};
    constructor(id){
        this.webviewId = id;
    }
    // 监听webview内部 dom的EventListener事件（直接映射）
    addEventListener(selector,event,cb,invokeTime){
            messageChannel.invoke('_registerWebviewContentEvent',{
                webviewId:this.webviewId,
                selector,
                eventName:event,
                invokeTime
            },(msg)=>{
                if(msg.status!=0){
                    console.error(TAG,`addEventListener ${event} failed: ${msg.msg}`);
                }else{
                    bus.on(`Webview_${this.webviewId}_contentEvent:${msg.id}`,cb);
                    console.log('addEventListener listen event',`Webview_${this.webviewId}_contentEvent:${msg.id}`)
                    return msg.id;
                }
            }); 
        
    }
    removeEventListener(id){
        messageChannel.invoke('_removeWebviewContentEvent',{
            webviewId:this.webviewId,
            id
        },(msg)=>{
            if(msg.status!=0){
                console.error(TAG,`removeEventListener ${event} failed: ${msg.msg}`);
            }else{
                bus.removeAllListeners(`Webview_${this.webviewId}_contentEvent:${id}`)
            }
        }); 
    }
}

module.exports = WebviewContent;