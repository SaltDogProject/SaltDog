import { fork, ForkOptions } from 'child_process';
import { extend, fromPairs, noop } from 'lodash';
import SaltDogPlugin from '.';
import apiFactory from './api/index';
import windowManager from '~/main/window/windowManager';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
import path from 'path';
import SaltDogMessageChannel from './api/messageChannel';
export class SaltDogPluginActivator {
    private _pluginManager: SaltDogPlugin;
    constructor(_plugin: SaltDogPlugin) {
        this._pluginManager = _plugin;
    }
    activatePlugin(pluginInfo: ISaltDogPluginInfo): void {
        const processConfig = {
            env: {
                pluginManifest: JSON.stringify(pluginInfo),
            },
            serialization: 'advanced',
        };
        if (process.env.NODE_ENV === 'development') {
            const port = 18044 + Math.floor(Math.random() * 1000);
            extend(processConfig, {
                execArgv: ['--inspect=' + port],
                // FIXME:debug
                stdio: 'inherit',
            });
            console.log(`[Plugin] Plugin ${pluginInfo.name} is in develop mode, port: ${port}`);
        }
        const pluginHost = fork(__static + '/plugin/preload/preload.js', [], processConfig as ForkOptions);
        this._pluginManager.setPluginHost(pluginInfo.name, pluginHost);
        const newApi = apiFactory.createApi(pluginHost, pluginInfo);
        const messageChannel = new SaltDogMessageChannel(pluginHost, pluginInfo, newApi);
        this._pluginManager.setMessageChannel(pluginInfo.name, messageChannel);
        pluginHost.on('close', (message: any) => {
            console.log('plugin close', message);
        });
        pluginHost.on('disconnect', (message: any) => {
            console.log('plugin disconnect', message);
        });
        pluginHost.on('error', (message: any) => {
            console.log('plugin error', message);
        });
        pluginHost.on('exit', (message: any) => {
            console.log('plugin exit', message);
        });
        messageChannel.publishEventToPluginHost('sdConfigReady', {
            message: 'ready',
        });
    }
}
