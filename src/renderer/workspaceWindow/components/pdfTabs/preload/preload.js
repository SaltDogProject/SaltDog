// 为了在pdfpages执行node能力，对nodemodules的引用要用requireFunc
// 不要export default 否则要require().default
window.requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
let api = require('./api/api');
let electron = requireFunc('electron');
let uniqId = requireFunc('licia/uniqId');
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
