import { extend, fromPairs, noop } from 'lodash';
import SaltDogPlugin from '.';
import apiFactory from './api/index';
import windowManager from '~/main/window/windowManager';
import path from 'path';
import SaltDogMessageChannelMain from './api/messageChannel';
import { app, BrowserWindow, ipcMain } from 'electron';
import { IWindowList } from '~/main/window/constants';
const TAG = '[Plugin Activator]';
const isDevelopment = process.env.NODE_ENV !== 'production';
export class SaltDogPluginActivator {
    private _pluginManager: typeof SaltDogPlugin;
    private _pluginHost: BrowserWindow | null = null;
    constructor(_plugin: typeof SaltDogPlugin) {
        this._pluginManager = _plugin;
    }
    // 一个WindowId对应一个插件宿主进程，所有插件运行在同一个宿主进程上下文。
    initPluginHost() {
        const pluginHost = windowManager.get(IWindowList.PLUGIN_HOST);
        if (!pluginHost) {
            throw new Error('Plugin host NOT start!');
        }
        SaltDogMessageChannelMain.getInstance().invokePluginHost(
            '_pluginHostConfig',
            {
                pluginDir: this._pluginManager!.pluginPath,
                // plugins: this._pluginManager.getPluginInfoJSON(),
            },
            (data) => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }
            }
        );

        try {
            this._pluginHost = pluginHost;
            const newApi = apiFactory.createApi() as ISaltDogPluginApi;
            this._pluginManager.setPluginHost(pluginHost);
        } catch (e: any) {
            console.error(e);
        }
    }

    activatePlugin(pluginInfo: ISaltDogPluginInfo, isReload = false): void {
        console.log(TAG, `Activate plugin ${pluginInfo}.`);
        if (!this._pluginHost) {
            console.warn('Can not connect to pluginHost while activatePlugin. Starting a new one...', this._pluginHost);
            windowManager.create(IWindowList.PLUGIN_HOST);
        }

        const pluginEnv = {
            name: pluginInfo.name,
            pluginManifest: pluginInfo,
            mainjs: path.resolve(pluginInfo.rootDir, pluginInfo.main),
        };

        try {
            SaltDogMessageChannelMain.getInstance().invokePluginHost('_activatePlugin', pluginEnv);
        } catch (e: any) {
            console.error(`Activateing ${pluginInfo.name} error`, e);
        }
    }
}
