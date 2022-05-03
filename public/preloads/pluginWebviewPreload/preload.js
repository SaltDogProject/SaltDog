// eslint-disable-next-line no-undef
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
const { ipcRenderer, contextBridge } = requireFunc('electron');
// const uniqId = require('licia/uniqId');
const { EventEmitter } = require('eventemitter3');
const bus = new EventEmitter();
ipcRenderer.sendToHost('_getSidebarInfo');
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
const name = params.name;
const webviewId = params.webviewId;
const windowId = params.windowId;

ipcRenderer.on('PLUGINHOST_TO_SIDEBAR_MESSAGE', (e, msg) => {
    // msg={data,event,ticket}
    console.log('Receive Message from Host', msg);
    bus.emit(msg.event, msg.data);
});

//contextBridge.exposeInMainWorld('__sdConfig', params);
contextBridge.exposeInMainWorld('_pendingFunction', {});
contextBridge.exposeInMainWorld('saltdog', {
    init: () => {
        // window.isMessageChannelInited = false;
        // window._pendingFunction = {};
        // ipcRenderer.on('PLUGINWEBVIEW_INVOKE_CALLBACK', (e, data) => {
        //     if (data.callbackId && window._pendingFunction[data.callbackId]) {
        //         window._pendingFunction[data.callbackId](data.data);
        //         delete window._pendingFunction[data.callbackId];
        //     }
        // });
    },
    send: (channel, ...args) => {
        // const id = uniqId();
        // window._pendingFunction[id] = callback;
        // window.isMessageChannelInited ? null : (window.isMessageChannelInited = false);
        // ipcRenderer.sendToHost('PLUGINWEBVIEW_IPC', {
        //     channel: channel,
        //     data: msg,
        //     name,
        //     webviewId,
        //     windowId,
        //     callbackId: id,
        // });
        ipcRenderer.sendToHost(channel, ...args);
    },
    on: (event, callback) => {
        ipcRenderer.on(event, (e, ...args) => {
            callback(...args);
        });
    },
});
