import { ipcRenderer } from 'electron';
class PluginMsgChannel {
    public send(event: string, data: any) {
        ipcRenderer.send('_rendererToPluginEvents',event, JSON.parse(JSON.stringify(data)));
    }
}
export default new PluginMsgChannel();
