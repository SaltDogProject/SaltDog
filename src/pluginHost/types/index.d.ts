interface IPluginHostEventMessage {
    event: string;
    data: string;
}
interface IPluginActivateMessage {
    name: string;
    pluginManifest: ISaltDogPluginInfo;
    mainjs: string;
}
