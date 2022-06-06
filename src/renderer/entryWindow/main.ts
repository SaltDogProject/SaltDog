import { createApp } from 'vue';
import Frame from '@/entryWindow/Frame.vue';
import router from './router';
import store from './store';
// global use element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

createApp(Frame)
    .use(router as any)
    .use(ElementPlus, {
        zIndex: 3000,
        size: 'small',
    })
    .mount('#app');
//app.config.globalProperties.$qs = qs;
