interface IPluginHostEventMessage {
    event: string;
    data: string;
}
interface IPluginActivateMessage {
    name: string;
    pluginManifest: ISaltDogPluginInfo;
    mainjs: string;
}

abstract class SaltDogMessageChannel {
    abstract invoke(method: string, data: any,callback?:any): void;
    abstract _bindWindowId(windowId: number): void;
}