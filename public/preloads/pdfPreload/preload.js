// 为了在pdfpages执行node能力，对nodemodules的引用要用requireFunc
// 不要export default 否则要require().default
const { listenTextSelect } = require('./api/events/index');
const bus = require('./bus');
const { noop } = require('lodash');
const api = require('./api/api');
const electron = require('electron');
const uniqId = require('licia/uniqId');
const callbacks = {};

window.__sdConfig = {};
const __sdJSBridge = {
    // 向host发送信息
    invoke: function (method, params, callback) {
        const id = uniqId();
        if (callback) {
            callbacks[id] = callback;
        }
        const arg = {
            method,
            data: params,
            callbackId: id,
        };
        electron.ipcRenderer.sendToHost('WEBVIEW_INVOKE', arg);
    },
    // 从host接收信息
    on: function (method, args, callbackId) {
        if (api[method]) {
            api[method](args, (res) => {
                if (callbackId) {
                    electron.ipcRenderer.sendToHost('WEBVIEW_INVOKE_CALLBACK', {
                        callbackId: callbackId,
                        data: res,
                    });
                }
            });
        } else {
            console.warn('[SaltDog] Method not found', method);
        }
    },
    // webview向host发送事件
    publish: function (event, data) {
        console.log('sendtohost!', window._saltdogWebviewId, event, data);

        electron.ipcRenderer.sendToHost('WEBVIEW_PUBLISH', {
            event: `PDFVIEW_${window._saltdogWebviewId}:${event}`,
            data,
        });
    },
    // webview向host订阅事件
    subscribe: function (event, callback) {
        // TODO:
        noop();
    },
};
window.__sdJSBridge = __sdJSBridge;
function getQueryVariable() {
    let query = window.location.search.substring(1);
    let key_values = query.split('&');
    let params = {};
    key_values.map((key_val) => {
        let key_val_arr = key_val.split('=');
        params[key_val_arr[0]] = key_val_arr[1];
    });
    return params;
}
const params = getQueryVariable();
window._saltdogWebviewId = params.webviewId;
electron.ipcRenderer.on('HOST_INVOKE', (e, args) => {
    const arg = args;
    window.__sdJSBridge.on(arg.method, arg.data, arg.callbackId);
});
electron.ipcRenderer.on('HOST_INVOKE_CALLBACK', (e, args) => {
    const arg = args;
    const callback = callbacks[arg.callbackId];
    if (callback) {
        callback(arg.data);
    }
});
// listenTextSelect();
// bus.on('selectText', (txt) => {
//     window.__sdJSBridge.publish('selectText', txt);
// });
