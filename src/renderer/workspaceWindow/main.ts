import { createApp } from 'vue';
import Frame from '@/workspaceWindow/Frame.vue';
import store from './store';
// global use element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@mdi/font/css/materialdesignicons.min.css';
import { ipcRenderer } from 'electron';
import pluginManager from './controller/plugin/plugin';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import initCommandListener from './utils/generalCommands';
import { initWorkspace } from './initWorkspace';
const app = createApp(Frame);
// FIXME: debug
//ipcRenderer.once('initWorkspace', (e, arg) => {

const basicInfo = ipcRenderer.sendSync('getBasicInfoSync'); // 基本配置，和打开的文件无关，包括插件等信息
const windowId = ipcRenderer.sendSync('getWindowId'); // 当前窗口的id
const pluginHostWebcontentsID = ipcRenderer.sendSync('getPluginHostWindowId'); // 插件主窗口的id
app.config.globalProperties.$windowId = windowId;
app.config.globalProperties.$pluginHostWebcontentsID = pluginHostWebcontentsID;
console.log('[Saltdog Kernel] BasicInfo:', basicInfo);
app.config.globalProperties.__workspaceInfo = {
    // pdfPath: 'C:/Users/dorap/Desktop/Xilinx Doc/ug1399-vitis-hls.pdf',
    // pdfPath:'C:/Users/Dorapocket/Desktop/Xilinx Doc/Xilinx Doc/ug1399-vitis-hls.pdf',
}; //arg;
app.config.globalProperties.__basicInfo = basicInfo; //arg;
console.log('[Workspace load]', basicInfo, pluginHostWebcontentsID);
pluginManager.init(basicInfo.plugins, windowId, pluginHostWebcontentsID);

app.use(store as any)
    .use(ElementPlus, {
        zIndex: 3000,
        locale: zhCn,
    })
    .mount('#app');

// listenen Commands
initCommandListener();
initWorkspace();

ipcRenderer.send('WorkspaceWindowReady');
//});
//app.config.globalProperties.$qs = qs;
