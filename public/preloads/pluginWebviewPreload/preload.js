const { ipcRenderer, contextBridge } = require('electron');
const uniqId = require('licia/uniqId');
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
const ticket = params.ticket;
const webviewId = params.webviewId;
const windowId = params.windowId;

//contextBridge.exposeInMainWorld('__sdConfig', params);
contextBridge.exposeInMainWorld('_pendingFunction', {});
contextBridge.exposeInMainWorld('saltdog', {
    init: () => {
        window.isMessageChannelInited = false;
        window._pendingFunction = {};
        ipcRenderer.on('PLUGINWEBVIEW_INVOKE_CALLBACK', (e, data) => {
            if (data.callbackId && window._pendingFunction[data.callbackId]) {
                window._pendingFunction[data.callbackId](data.data);
                delete window._pendingFunction[data.callbackId];
            }
        });
    },
    send: (channel, msg, callback) => {
        const id = uniqId();
        window._pendingFunction[id] = callback;
        // window.isMessageChannelInited ? null : (window.isMessageChannelInited = false);
        ipcRenderer.sendToHost('PLUGINWEBVIEW_IPC', {
            type: 'PLUGINWEBVIEW_INVOKE',
            channel: channel,
            data: msg,
            ticket: ticket,
            webviewId,
            windowId,
            callbackId: id,
        });
    },
    on: (event, callback) => {
        ipcRenderer.on('PLUGINHOST_TO_SIDEBAR_MESSAGE', (msg) => {
            callback(msg);
        });
    },
});
