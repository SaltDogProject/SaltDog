import { ChildProcess } from 'child_process';

export class SaltDogPluginApiFactory {
    private _pluginApis = new Map<string, ISaltDogPluginApi>();
    public createApi(pluginInfo: ISaltDogPluginInfo): ISaltDogPluginApi {
        const api = {
            getPluginInfo: (arg: any, callback: any) => {
                callback(pluginInfo);
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
