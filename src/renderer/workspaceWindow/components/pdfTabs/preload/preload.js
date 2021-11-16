// 为了在pdfpages执行node能力，对nodemodules的引用要用requireFunc
// 不要export default 否则要require().default
window.requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
import { listenTextSelect } from './api/events/index';
import bus from './bus';
const { noop } = require('lodash');
const api = require('./api/api');
const electron = requireFunc('electron');
const uniqId = requireFunc('licia/uniqId');
const callbacks = {};

window._sdConfig = {};
window.__sdJSBridge = {
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
        electron.ipcRenderer.sendToHost('WEBVIEW_INVOKE', JSON.stringify(arg));
    },
    // 从host接收信息
    on: function (method, args, callbackId) {
        if (api[method]) {
            api[method](args, (res) => {
                if (callbackId) {
                    electron.ipcRenderer.sendToHost(
                        'WEBVIEW_INVOKE_CALLBACK',
                        JSON.stringify({
                            callbackId: callbackId,
                            data: res,
                        })
                    );
                }
            });
        } else {
            console.warn('[SaltDog] Method not found', method);
        }
    },
    // webview向host发送事件
    publish: function (event, data) {
        console.log('sendtohost!');
        electron.ipcRenderer.sendToHost('WEBVIEW_PUBLISH', JSON.stringify({ event, data }));
    },
    // webview向host订阅事件
    subscribe: function (event, callback) {
        // TODO:
        noop();
    },
};

electron.ipcRenderer.on('HOST_INVOKE', (e, args) => {
    const arg = JSON.parse(args);
    window.__sdJSBridge.on(arg.method, arg.data, arg.callbackId);
});
electron.ipcRenderer.on('HOST_INVOKE_CALLBACK', (e, args) => {
    const arg = JSON.parse(args);
    const callback = callbacks[arg.callbackId];
    if (callback) {
        callback(arg.data);
    }
});
listenTextSelect();
bus.on('selectText', (txt) => {
    console.log('select! sending!');
    window.__sdJSBridge.publish('selectText', txt);
});
