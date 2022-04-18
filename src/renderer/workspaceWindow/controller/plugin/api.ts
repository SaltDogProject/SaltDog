import webviewApi from './webview';
import plugin from './plugin';
import {showNotification,showMessage} from '../notification';
const testRendererApi = (arg: any, callback: any,rawData:any) => {
    console.log('Test Renderer Api has been successfully called!', arg);
    callback('From Renderer: OK!');
};
const _hostToSidebarMsg = (args:any,callback:any)=>{
    console.log('Handle message to Sidebar');
    const sidebarView = plugin.getSidebarByName(args.name);
    if(!sidebarView) return;
    sidebarView.send('PLUGINHOST_TO_SIDEBAR_MESSAGE',{
        event:args.event,
        data:args.data
    })
}
export default {
    _hostToSidebarMsg,
    testRendererApi,
    ...webviewApi,
    showNotification,
    showMessage
} as ISaltDogPluginApi;
