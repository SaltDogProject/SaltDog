import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import { ISaltDogPluginMessageType } from '~/main/apis/plugin/constant';
import { NodeVM } from 'vm2';
import SaltDogApiModule from './api';
import { Module } from 'module';
import messageChannel from './messageChannel';
const TAG = '[PluginHostMain]';
const pluginMap = new Map<string,any>();

ipcRenderer.on('_pluginHostConfig', (e, config) => {
    console.log(config);
});

__non_webpack_require__.cache[__non_webpack_require__.resolve('saltdog')] = {
    exports: SaltDogApiModule,
};

messageChannel.onInvoke('_activatePlugin', async (msg: any) => {
    console.log(TAG,` Activate Plugin ${msg.mainjs})`);
    const plugin = __non_webpack_require__(msg.mainjs);
    pluginMap.set(msg.name, plugin);
    plugin.activate();
});

ipcRenderer.send('_pluginHostReady');

setInterval(function () {
    console.log('Plugin Host is Running ...');
}, 5000);
