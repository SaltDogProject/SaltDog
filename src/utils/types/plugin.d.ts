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
        settings?: {
            [key: string]: any;
        };
    };
}
interface IPluginSettings {
    title: string;
    desc?: string;
    type: 'boolean' | 'text';
    id?: string;
}
interface ISaltDogPluginApi {
    [key: string]: any;
}
interface ISaltDogPluginInvoke {
    windowId?: string | null;
    api: string;
    args: any;
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
interface ISaltDogPluginWebviewInvoke {
    channel: string;
    data: any;
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

interface IStatusBarItem {
    alignment: StatusBarAlignment;
    backgroundColor?: string;
    color?: string;
    command?: string;
    id: string;
    name?: string;
    priority?: number;
    text: string;
    tooltip?: string;
    show?: boolean;
}
