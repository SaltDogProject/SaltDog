import { createApp } from 'vue';
import Frame from '@/workspaceWindow/Frame.vue';
import store from './store';
// global use element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(Frame)
    .use(store)
    .use(ElementPlus, {
        zIndex: 3000,
        size: 'small',
    })
    .mount('#app');

//app.config.globalProperties.$qs = qs;
