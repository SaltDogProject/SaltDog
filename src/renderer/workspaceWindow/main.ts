import { createApp } from 'vue';
import Frame from '@/workspaceWindow/Frame.vue';
import store from './store';
// global use element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { ipcRenderer } from 'electron';
import pluginManager from './controller/plugin/plugin';
const app = createApp(Frame);
// FIXME: debug
//ipcRenderer.once('initWorkspace', (e, arg) => {

const basicInfo = ipcRenderer.sendSync('getBasicInfoSync'); // 基本配置，和打开的文件无关，包括插件等信息
const windowId = ipcRenderer.sendSync('getWindowId'); // 当前窗口的id
console.log('[Saltdog Kernel] BasicInfo:', basicInfo);
app.config.globalProperties.__workspaceInfo = {}; //arg;
app.config.globalProperties.__basicInfo = basicInfo; //arg;
console.log('[Workspace load]', basicInfo);
pluginManager.init(basicInfo.plugins, windowId);
app.use(store)
    .use(ElementPlus, {
        zIndex: 3000,
        size: 'small',
    })
    .mount('#app');

ipcRenderer.send('WorkspaceWindowReady');
//});
//app.config.globalProperties.$qs = qs;
