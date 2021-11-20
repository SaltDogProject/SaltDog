import { createApp } from 'vue';
import Frame from '@/workspaceWindow/Frame.vue';
import store from './store';
// global use element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { ipcRenderer } from 'electron';

const app = createApp(Frame);
// FIXME: debug
//ipcRenderer.once('initWorkspace', (e, arg) => {

const basicInfo = ipcRenderer.sendSync('getBasicInfoSync'); // 基本配置，和打开的文件无关，包括插件等信息
app.config.globalProperties.__workspaceInfo = {}; //arg;
app.config.globalProperties.__basicInfo = basicInfo; //arg;
app.use(store)
    .use(ElementPlus, {
        zIndex: 3000,
        size: 'small',
    })
    .mount('#app');
//});
//app.config.globalProperties.$qs = qs;
