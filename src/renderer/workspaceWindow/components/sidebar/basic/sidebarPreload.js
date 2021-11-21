const { ipcRenderer, contextBridge } = require('electron');
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

contextBridge.exposeInMainWorld('__sdConfig', getQueryVariable());
contextBridge.exposeInMainWorld('saltdog', {
    send: (msg) => {
        ipcRenderer.sendToHost('SIDEBAR_TO_PLUGINHOST_MESSAGE', msg);
    },
    on: (event, callback) => {
        ipcRenderer.on('PLUGINHOST_TO_SIDEBAR_MESSAGE', (msg) => {
            callback(msg);
        });
    },
});
