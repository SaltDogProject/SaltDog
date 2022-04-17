import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import { ISaltDogPluginMessageType } from '~/main/apis/plugin/constant';
import bus from './bus';
import { NodeVM } from 'vm2';
import SaltDogApiModule from './api';
import { Module } from 'module';

ipcRenderer.send('_pluginHostReady');

ipcRenderer.on('_pluginHostConfig', (e, config) => {
    console.log(config);
});

ipcRenderer.on(ISaltDogPluginMessageType.HOST_EVENT, (e, msg: IPluginHostEventMessage) => {
    bus.emit(msg.event, msg.data);
});

__non_webpack_require__.cache[__non_webpack_require__.resolve('saltdog')] = {
    exports: SaltDogApiModule,
};

bus.on('_activatePlugin', async (msg: any) => {
    console.log(msg.mainjs);
    __non_webpack_require__(msg.mainjs);
});

setInterval(function () {
    console.log('Plugin Host is Running ...');
}, 5000);
