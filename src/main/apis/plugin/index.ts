import { SaltDogPluginActivator } from './activator';
import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron';
import { existsSync, readdirSync, readJsonSync, mkdirSync } from 'fs-extra';
import { startsWith, extend, set, has } from 'lodash';
import path from 'path';
import process from 'process';
import { ChildProcess } from 'child_process';
import SaltDogMessageChannel from './api/messageChannel';
import { loggerWriter } from '~/main/utils/logger';
const TAG = 'SaltDogPlugin';
class SaltDogPlugin {
    private _plugins: Map<string, ISaltDogPluginInfo> = new Map();
    private _pluginHost: BrowserWindow | null = null;
    private _activator: SaltDogPluginActivator | null = null;
    private isDevelopment = process.env.NODE_ENV == 'development';
    // 开发模式下加载文件路径内的插件，方便调试
    public pluginPath = path.normalize(
        this.isDevelopment ? path.join(__static, '../plugin_demo') : app.getPath('userData') + '/SaltDogPlugins'
    );
    constructor() {
        // ipcMain.on('restartPlugin', (e: IpcMainEvent, data: any) => {
        //     // {name}
        //     const res = this.restartPluginHost(data.name);
        //     e.returnValue = res;
        // });
        ipcMain.on('onTabsChange', (e, tabid) => {
            this.broadcastToPluginHost('onTabsChange', tabid);
        });
    }
    // 加载appdata/SaltDogPlugins下的所有插件
    // TODO: 禁用插件
    public init(): void {
        this._activator = new SaltDogPluginActivator(this);
        this._activator.initPluginHost();
        if (!existsSync(this.pluginPath)) {
            mkdirSync(this.pluginPath);
        }
        const plugindir = readdirSync(this.pluginPath).filter((item) => {
            return item.startsWith('saltdogplugin_');
        });
        // 读取插件manifest.json
        plugindir.forEach((item) => {
            if (existsSync(this.pluginPath + '/' + item + '/manifest.json')) {
                try {
                    const pluginInfo = readJsonSync(this.pluginPath + '/' + item + '/manifest.json');
                    this._plugins.set(
                        pluginInfo.name,
                        extend(pluginInfo, { rootDir: path.normalize(this.pluginPath + '/' + item) })
                    );
                } catch (e) {
                    console.log(
                        'Read plugin manifest.json error, path:',
                        path.normalize(this.pluginPath + '/' + item + '/manifest.json'),
                        e
                    );
                }
            }
        });
        //FIXME: 懒加载，workspace初始化的时候就要msgchannel了，而msgchannel实在activate生成的，应该提出来
        //ipcMain.once('WorkspaceWindowReady',()=>{
        this._plugins.forEach((item) => {
            // TODO: 依据激活事件激活插件 延迟激活(现在的问题是延迟激活以后会出现messageChannelTicket undefined)
            //process.nextTick(()=>{
            this._activator!.activatePlugin(item);
            //})
        });
        //});
    }
    public setPluginHost(host: BrowserWindow): void {
        this._pluginHost = host;
    }

    // public restartPluginHost(targetPlugin: string): boolean {
    //     const pluginHost = this._pluginHost;
    //     if (!pluginHost) {
    //         console.error(TAG, `Cannot restart Host :PluginHost not activated yet.`);
    //         return false;
    //     }
    //     pluginHost!.kill();
    //     this._activator!.initPluginHost();
    //     return true;
    // }

    public publishEventToPluginHost(event: string, data: any) {
        SaltDogMessageChannel.getInstance().publish(event, data);
    }
    public broadcastToPluginHost(event: string, data: any) {
        SaltDogMessageChannel.getInstance().publish(event, data);
    }

    public sendToPluginHost(channel: string, data: IPluginWebviewIPC) {
        SaltDogMessageChannel.getInstance().invokePluginHost(channel, data);
    }
    // public destroyAllPluginHosts() {
    //     if (!this._pluginHost) return;
    //     this._pluginHost.kill();
    // }
    public workspaceGetBasicPluginInfo(): any {
        const pluginInfo: any = {};
        this._plugins.forEach((plugin) => {
            const info = {};
            // 处理activitybar 即左侧sidebaricon数据
            if (has(plugin, 'contributes.viewsContainers.activitybar')) {
                set(info, 'sidebarIcon', []);
                // @ts-ignore
                plugin.contributes.viewsContainers.activitybar.forEach((item) => {
                    try {
                        // @ts-ignore
                        info.sidebarIcon.push({
                            iconPath: path.normalize(plugin.rootDir + '/' + item.icon),
                            command: `${plugin.name}.${item.id}`,
                        });
                    } catch (e) {
                        console.log(TAG, `plugin ${plugin.name} workspaceGetBasicPluginInfo-activitybar failed`, e);
                    }
                });
            }
            // 处理views 即左侧sidebar数据
            if (has(plugin, 'contributes.views')) {
                set(info, 'views', {});
                // @ts-ignore
                for (const key of Object.keys(plugin.contributes.views)) {
                    set(info, `views.${key}`, []);
                    // @ts-ignore
                    const views = plugin.contributes!.views[key];
                    try {
                        // @ts-ignore
                        info.views[key].push({
                            src: path.normalize(plugin.rootDir + '/' + views.src),
                            name: views.name,
                            // command: `${plugin.name}.${item.id}`,
                        });
                    } catch (e) {
                        console.log(TAG, `plugin ${plugin.name} workspaceGetBasicPluginInfo-views failed`, e);
                    }
                }
            }
            extend(info, {
                _messageChannelTicket: plugin.messageChannelTicket,
            });
            pluginInfo[plugin.name] = info;
        });
        return pluginInfo;
    }
    public collectSettingsInfo(): IPluginSettings[] {
        // 返回格式详见 ../db/settings_buildin.ts
        const settingsList = [] as IPluginSettings[];

        this._plugins.forEach((plugin) => {
            try {
                const temp = {};
                if (has(plugin, 'contributes.settings')) {
                    set(temp, 'title', plugin.name);
                    for (const key in plugin.contributes!.settings) {
                        const original = plugin.contributes!.settings[key];
                        extend(original, {
                            id: `plugins.${plugin.name}.${key}`,
                        });
                        set(temp, `children.${key}`, original);
                    }
                }
                settingsList.push(temp as IPluginSettings);
            } catch (e) {
                console.log(TAG, `plugin ${plugin.name} collectSettingsInfo failed`, e);
            }
        });
        return settingsList;
    }
}
export default new SaltDogPlugin();
