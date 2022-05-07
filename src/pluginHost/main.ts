import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import { ISaltDogPluginMessageType } from '~/main/apis/plugin/constant';
import { NodeVM } from 'vm2';
import SaltDogApiModule from './api';
import { Module } from 'module';
import SaltDogMessageChannelRenderer from './messageChannel';
import { any } from 'licia/Promise';
const TAG = '[PluginHostMain]';
const pluginMap = new Map<string, any>();
declare global {
    interface Window {
        _plugins: any;
    }
}

window._plugins = {};
SaltDogMessageChannelRenderer.getInstance().onInvoke('_pluginHostConfig', async (config) => {
    console.log(config);
    return {};
});

__non_webpack_require__.cache[__non_webpack_require__.resolve('saltdog')] = {
    exports: SaltDogApiModule,
};

SaltDogMessageChannelRenderer.getInstance().onInvoke('_activatePlugin', async (msg: any) => {
    console.log(TAG, ` Activate Plugin ${msg.mainjs}`);
    window._plugins[msg.name] = msg.pluginManifest;
    const plugin = __non_webpack_require__(msg.mainjs);
    pluginMap.set(msg.name, plugin);
    plugin.activate();
});

SaltDogMessageChannelRenderer.getInstance().publish('_pluginHostReady');

setInterval(function () {
    console.log('Plugin Host is Running ...');
}, 5000);
