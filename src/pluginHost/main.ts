import { ipcRenderer } from 'electron';
ipcRenderer.send('_pluginHostReady');

ipcRenderer.on('_pluginHostConfig', (e, config) => {
    console.log(config);
});

setInterval(function () {
    console.log('Plugin Host is Running ...');
}, 5000);
