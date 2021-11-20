const { ipcRenderer, contextBridge } = require('electron');
contextBridge.exposeInMainWorld('saltdog', {
    send: (msg) => {
        ipcRenderer.sendToHost('SIDEBAR_MESSAGE', msg);
    },
});
