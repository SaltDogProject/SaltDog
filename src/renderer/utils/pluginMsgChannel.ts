import { ipcRenderer } from 'electron';
class PluginMsgChannel {
    public send(target: string, event: string, data: any) {
        if (target == 'saltdog-internal') return;
        ipcRenderer.send('_rendererToPluginEvents', target, event, JSON.parse(JSON.stringify(data)));
    }
}
export default new PluginMsgChannel();
