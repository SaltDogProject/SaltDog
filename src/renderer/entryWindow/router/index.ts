import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Recent from '../views/Recent.vue';
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/recent',
    },
    {
        path: '/recent',
        name: 'recent',
        component: Recent,
    },
    {
        path: '/paperManage',
        name: 'paperManage',
        component: () => import(/* webpackChunkName: "PaperManage" */ '../views/PaperManage.vue'),
    },
    {
        path: '/plugins',
        name: 'plugins',
        component: () => import(/* webpackChunkName: "Plugins" */ '../views/Plugins.vue'),
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import(/* webpackChunkName: "Settings" */ '../views/Settings.vue'),
    },
];

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes,
});

export default router;
