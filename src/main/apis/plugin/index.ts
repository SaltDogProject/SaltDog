import { SaltDogPluginActivator } from './activator';
import { app } from 'electron';
import { existsSync, readdirSync, readJsonSync } from 'fs-extra';
import { startsWith, extend } from 'lodash';
import { normalize } from 'path';
class SaltDogPlugin {
    private _plugins: Map<string, ISaltDogPluginInfo> = new Map();
    private _activator: SaltDogPluginActivator;
    public pluginPath = normalize(app.getPath('userData') + '/SaltDogPlugins');
    public pluginPreloadScript = normalize(app.getPath('userData') + '/SaltDogPlugins/preload.js');
    constructor() {
        this._activator = new SaltDogPluginActivator(this);
    }
    // 加载appdata/SaltDogPlugins下的所有插件
    // TODO: 禁用插件
    public init(): void {
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
                        extend(pluginInfo, { rootDir: normalize(this.pluginPath + '/' + item) })
                    );
                } catch (e) {
                    console.log(
                        'Read plugin manifest.json error, path:',
                        normalize(this.pluginPath + '/' + item + '/manifest.json'),
                        e
                    );
                }
            }
        });
        this._plugins.forEach((item) => {
            this._activator.activatePlugin(item);
        });
    }
}
export default SaltDogPlugin;
