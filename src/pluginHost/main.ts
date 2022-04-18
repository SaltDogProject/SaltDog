import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import { ISaltDogPluginMessageType } from '~/main/apis/plugin/constant';
import { NodeVM } from 'vm2';
import SaltDogApiModule from './api';
import { Module } from 'module';
import messageChannel from './messageChannel';
const TAG = '[PluginHostMain]';


ipcRenderer.on('_pluginHostConfig', (e, config) => {
    console.log(config);
});


__non_webpack_require__.cache[__non_webpack_require__.resolve('saltdog')] = {
    exports: SaltDogApiModule,
};

messageChannel.on('_activatePlugin', async (msg: any) => {
    console.log(TAG,` Activate Plugin ${msg.mainjs})`);
    __non_webpack_require__(msg.mainjs);
});

ipcRenderer.send('_pluginHostReady');

setInterval(function () {
    console.log('Plugin Host is Running ...');
}, 5000);
