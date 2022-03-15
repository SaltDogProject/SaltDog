import { SaltDogPluginActivator } from './activator';
import { app, ipcMain } from 'electron';
import { existsSync, readdirSync, readJsonSync, mkdirSync } from 'fs-extra';
import { startsWith, extend, set, has } from 'lodash';
import path from 'path';
import { ChildProcess } from 'child_process';
import SaltDogMessageChannel from './api/messageChannel';
const TAG = 'SaltDogPlugin';
class SaltDogPlugin {
    private _plugins: Map<string, ISaltDogPluginInfo> = new Map();
    private _pluginHosts: Map<string, ChildProcess> = new Map();
    private _pluginMessageChannelTicket: Map<string, SaltDogMessageChannel> = new Map(); // string为ticket
    private _activator: SaltDogPluginActivator;
    private isDevelopment = process.env.NODE_ENV !== 'production';
    // 开发模式下加载文件路径内的插件，方便调试
    public pluginPath = path.normalize(this.isDevelopment?path.join(__static,'../plugin_demo'):app.getPath('userData') + '/SaltDogPlugins');
    constructor() {
        this._activator = new SaltDogPluginActivator(this);
    }
    // 加载appdata/SaltDogPlugins下的所有插件
    // TODO: 禁用插件
    public init(): void {
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
        ipcMain.once('WorkspaceWindowReady',()=>{
this._plugins.forEach((item) => {
            // TODO: 依据激活事件激活插件
            this._activator.activatePlugin(item);
        });
        });
        
        ipcMain.on('saltdog-plugin-message', (event, arg) => {
            const { ticket } = arg;
            const channel = this._pluginMessageChannelTicket.get(ticket);
        });
    }
    public setPluginHost(name: string, host: ChildProcess): void {
        this._pluginHosts.set(name, host);
    }
    public setMessageChannel(name: string, channel: SaltDogMessageChannel): void {
        const ticket = channel.getTicket();
        this._pluginMessageChannelTicket.set(ticket, channel);
        this._plugins.get(name)!.messageChannelTicket = ticket;
    }
    public publishEventToPluginHost(target:string,event:string,data:any){
        const messageChannel = this._pluginMessageChannelTicket.get(target);
        messageChannel!.publishEventToPluginHost(event,data);
    }

    public sendToPluginHost(data: IPluginWebviewIPC) {
        const messageChannel = this._pluginMessageChannelTicket.get(data.ticket);
        messageChannel!.sendToPluginHost(data);
    }
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
}
export default new SaltDogPlugin();
