import {ipcRenderer} from 'electron';
class PluginMsgChannel {
    public send(target:string,event:string,data:any){
        ipcRenderer.send('_rendererToPluginEvents',target,event,JSON.parse(JSON.stringify(data)));
    }
}
export default new PluginMsgChannel;