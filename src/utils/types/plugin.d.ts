interface ISaltDogPluginInfo {
    name: string;
    version: string;
    description?: string;
    author?: string;
    localPath: string;
    rootDir: string;
    messageChannelTicket?: string;
    main: string;
    contributes?: {
        viewsContainers?: {
            activitybar?: {
                [key: string]: any;
            };
        };
        views?: {
            [key: string]: any;
        };
    };
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
interface ISaltDogPluginWebviewInvokeCallback {
    type: ISaltDogPluginMessageType;
    webviewId: string;
    windowId: string;
    data: any;
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
interface IPluginWebviewIPC {
    type: ISaltDogPluginMessageType;
    data: any;
    ticket: string;
    callbackId: string;
}
