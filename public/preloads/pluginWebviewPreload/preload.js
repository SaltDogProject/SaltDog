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
const ticket = getQueryVariable().ticket;
contextBridge.exposeInMainWorld('__sdConfig', getQueryVariable());
contextBridge.exposeInMainWorld('_pendingFunction', {});
contextBridge.exposeInMainWorld('saltdog', {
    send: (msg, callback) => {
        const id = uniqId();
        if (!window._pendingFunction) {
            window._pendingFunction = {};
        }
        window._pendingFunction[id] = callback;
        ipcRenderer.sendToHost('PLUGINWEBVIEW_IPC', {
            type: 'PLUGINWEBVIEW_INVOKE',
            data: msg,
            ticket: ticket || window.__sdConfig.ticket || 'error: no ticket',
            callbackId: id,
        });
    },
    on: (event, callback) => {
        ipcRenderer.on('PLUGINHOST_TO_SIDEBAR_MESSAGE', (msg) => {
            callback(msg);
        });
    },
});
