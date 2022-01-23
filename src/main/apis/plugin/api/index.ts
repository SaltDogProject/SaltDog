import { ChildProcess } from 'child_process';
import windowManager from '~/main/window/windowManager';

export class SaltDogPluginApiFactory {
    private _pluginApis = new Map<string, ISaltDogPluginApi>();
    public createApi(pluginInfo: ISaltDogPluginInfo): ISaltDogPluginApi {
        const api = {
            testMainApi: (arg: any, callback?: any) => {
                console.log('Test Main Api has been successfully called!', arg);
                callback('From Main: OK!');
            },
            getPluginInfo: (arg: any, callback: any) => {
                callback(pluginInfo);
            },
            getCurrentWindow: (arg: any, callback: any) => {
                callback(windowManager.getCurrentWindow() ? windowManager.getCurrentWindow()!.id : null);
            },
        };
        this._pluginApis.set(pluginInfo.name, api as ISaltDogPluginApi);
        return api;
    }
    public getApi(pluginName: string): ISaltDogPluginApi | undefined {
        return this._pluginApis.get(pluginName);
    }
}
export default new SaltDogPluginApiFactory();
