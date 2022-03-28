import { fork, ForkOptions } from 'child_process';
import { extend, fromPairs, noop } from 'lodash';
import SaltDogPlugin from '.';
import apiFactory from './api/index';
import windowManager from '~/main/window/windowManager';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
import path from 'path';
import SaltDogMessageChannel from './api/messageChannel';
import { loggerWriter } from '~/main/utils/logger';
const TAG = '[Plugin Activator]';
export class SaltDogPluginActivator {
    private _pluginManager: typeof SaltDogPlugin;
    constructor(_plugin: typeof SaltDogPlugin) {
        this._pluginManager = _plugin;
    }
    activatePlugin(pluginInfo: ISaltDogPluginInfo, isReload = false): void {
        const newApi = (
            isReload ? apiFactory.getApi(pluginInfo.name) : apiFactory.createApi(pluginInfo)
        ) as ISaltDogPluginApi;
        const messageChannel = (
            isReload
                ? this._pluginManager.getMessageChannel(pluginInfo.name)
                : new SaltDogMessageChannel(pluginInfo, newApi)
        ) as SaltDogMessageChannel;
        const processConfig = {
            env: {
                pluginManifest: JSON.stringify(pluginInfo),
                messageChannelTicket: messageChannel.getTicket(),
                mainjs: path.resolve(pluginInfo.rootDir, pluginInfo.main),
                sdConfig: JSON.stringify(pluginInfo),
            },
            serialization: 'advanced',
        };

        if (process.env.NODE_ENV === 'development') {
            const port = 18044 + Math.floor(Math.random() * 1000);
            extend(processConfig, {
                execArgv: ['--inspect=' + port],
                env: {},
                // stdio: 'inherit',
            });
            console.log(TAG, `Plugin ${pluginInfo.name} is in develop mode, port: ${port}`);
        }
        try {
            const pluginHost = fork(
                __static + '/preloads/pluginHostPreload/build/preload.js',
                [],
                processConfig as ForkOptions
            );
            this._pluginManager.setPluginHost(pluginInfo.name, pluginHost);
            messageChannel.bindHost(pluginHost);
            this._pluginManager.setMessageChannel(pluginInfo.name, messageChannel);
            // pluginHost.stdout!.on('data', (data) => {
            //     loggerWriter(`plugin ${pluginInfo.name} : ${data}`);
            // });
            pluginHost.on('close', (message: any) => {
                console.warn(TAG, `plugin close`, message);
                loggerWriter(`plugin ${pluginInfo.name} close`);
            });
            pluginHost.on('disconnect', (message: any) => {
                console.warn(TAG, `plugin ${pluginInfo.name} disconnect`, message);
                loggerWriter(`plugin ${pluginInfo.name} disconnect`);
            });
            pluginHost.on('error', (message: any) => {
                console.error(TAG, `plugin ${pluginInfo.name} error`, message);
                loggerWriter(`plugin ${pluginInfo.name} error`, message);
            });
            pluginHost.on('exit', (message: any) => {
                console.warn(TAG, `plugin ${pluginInfo.name} exit`, message);
            });
        } catch (e: any) {
            loggerWriter(`Activateing ${pluginInfo.name} error`, e);
        }
        // messageChannel.publishEventToPluginHost('sdConfigReady', {
        //     message: 'ready',
        // });
    }
}
