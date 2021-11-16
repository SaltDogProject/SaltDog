import { SaltDogPluginActivator } from './activator';
class SaltDogPlugin {
    private ctx: any;
    private _plugins: Array<ISaltDogPluginInfo> = [];
    private _activator: SaltDogPluginActivator;
    constructor(ctx: any) {
        this.ctx = ctx;
        this._activator = new SaltDogPluginActivator();
    }
}
