const messageChannel = require('../messageChannel.js');
const TAG = '[PluginHost/webviewContent]';
const bus = require('../bus');
const uniqId = require('licia/uniqId');
class WebviewContent {
    constructor(id) {
        this.webviewId = id;
        this.registeredEventName = {};
    }
    // 监听webview内部 dom的EventListener事件（直接映射）
    addEventListener(selector, event, cb, invokeTime) {
        return new Promise((resolve, reject) => {
            messageChannel.invoke(
                '_registerWebviewContentEvent',
                {
                    webviewId: this.webviewId,
                    selector,
                    eventName: event,
                    invokeTime,
                },
                (msg) => {
                    if (msg.status != 0) {
                        console.error(TAG, `addEventListener ${event} failed: ${msg.msg}`);
                        reject(new Error(`addEventListener ${event} failed: ${msg.msg}`));
                    } else {
                        bus.on(`Webview_${this.webviewId}_contentEvent:${msg.id}`, cb);
                        console.log(
                            'addEventListener listen event',
                            `Webview_${this.webviewId}_contentEvent:${msg.id}`
                        );
                        resolve(msg.id);
                    }
                }
            );
        });
    }
    removeEventListener(id) {
        messageChannel.invoke(
            '_removeWebviewContentEvent',
            {
                webviewId: this.webviewId,
                id,
            },
            (msg) => {
                if (msg.status != 0) {
                    console.error(TAG, `removeEventListener ${event} failed: ${msg.msg}`);
                    return false;
                } else {
                    bus.removeAllListeners(`Webview_${this.webviewId}_contentEvent:${id}`);
                    return true;
                }
            }
        );
    }
}

module.exports = WebviewContent;
