import { extend, fromPairs, noop } from 'lodash';
import SaltDogPlugin from '.';
import apiFactory from './api/index';
import windowManager from '~/main/window/windowManager';
import path from 'path';
import SaltDogMessageChannel from './api/messageChannel';
import { loggerWriter } from '~/main/utils/logger';
import { app, BrowserWindow, ipcMain } from 'electron';
import { IWindowList } from '~/main/window/constants';
const TAG = '[Plugin Activator]';
const isDevelopment = process.env.NODE_ENV !== 'production';
export class SaltDogPluginActivator {
    private _pluginManager: typeof SaltDogPlugin;
    private _pluginHost: BrowserWindow | null = null;
    private _messageChannel: SaltDogMessageChannel | null = null;
    constructor(_plugin: typeof SaltDogPlugin) {
        this._pluginManager = _plugin;
    }
    // 一个WindowId对应一个插件宿主进程，所有插件运行在同一个宿主进程上下文。
    initPluginHost() {
        const pluginHost = windowManager.get(IWindowList.PLUGIN_HOST);
        if (!pluginHost) {
            throw new Error('Plugin host NOT start!');
        }
        pluginHost!.webContents.send('_pluginHostConfig', {
            logDir: app.getPath('userData'),
            rootDir: app.getPath('userData'),
        });
        console.log(TAG, `Init plugin host...`);
        try {
            this._pluginHost = pluginHost;
            const newApi = apiFactory.createApi() as ISaltDogPluginApi;
            const messageChannel = new SaltDogMessageChannel(newApi) as SaltDogMessageChannel;
            messageChannel.bindHost(this._pluginHost as BrowserWindow);
            this._messageChannel = messageChannel;
            this._pluginManager.setPluginHost(pluginHost);
            this._pluginManager.setMessageChannel(messageChannel);
        } catch (e: any) {
            console.error(e);
        }
    }

    activatePlugin(pluginInfo: ISaltDogPluginInfo, isReload = false): void {
        console.log(TAG, `Activate plugin ${pluginInfo}.`);
        if (!this._pluginHost || !this._messageChannel) {
            console.warn(
                'Can not connect to pluginHost while activatePlugin. Starting a new one...',
                this._pluginHost,
                this._messageChannel
            );
            windowManager.create(IWindowList.PLUGIN_HOST);
        }
        const pluginEnv = {
            name: pluginInfo.name,
            pluginManifest: JSON.stringify(pluginInfo),
            mainjs: path.resolve(pluginInfo.rootDir, pluginInfo.main),
        };
        try {
            this._pluginManager.setMessageChannelTicket(
                pluginInfo.name,
                this._messageChannel!.generatePluginTicket(pluginInfo)
            );
            this._messageChannel!.publishEventToPluginHost('_activatePlugin', pluginEnv);
        } catch (e: any) {
            console.error(`Activateing ${pluginInfo.name} error`, e);
        }
    }
}
