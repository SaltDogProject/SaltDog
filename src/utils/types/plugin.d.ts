interface ISaltDogPluginInfo {
    name: string;
    version: string;
    description?: string;
    author?: string;
    localPath: string;
}
interface ISaltDogPluginApi {
    [key: string]: any;
}
interface ISaltDogPluginInvoke {
    type: ISaltDogPluginMessageType;
    api: string;
    args: any;
    pluginInfo: ISaltDogPluginInfo;
    callbackId: string;
}
interface ISaltDogPluginInvokeCallback {
    type: ISaltDogPluginMessageType;
    data: any;
    callbackId: string;
}
interface ISaltDogPluginHostEventToPlugin {
    type: ISaltDogPluginMessageType;
    event: string;
    data: any;
}
