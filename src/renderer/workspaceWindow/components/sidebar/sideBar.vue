<template>
    <div v-for="(view, index) in sidebarViews" :key="index">
        <div v-if="view.show" class="sidebar-main">
            <keep-alive>
                <div>
                    <div class="sidebar-titlebar">
                        <div class="sidebar-title">{{ view.title }}</div>
                    </div>
                    <div class="sidebar-content">
                        <webview id="test" :src="view.viewSrc" :preload="sidebarPreload"></webview>
                    </div>
                </div>
            </keep-alive>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, DefineComponent, getCurrentInstance, onMounted, ref } from 'vue';
export default defineComponent({
    setup() {
        // eslint-disable-next-line no-undef
        const staticPath = __static;
        const sidebarPreload = ref(`${staticPath}/sidebar/sidebarPreload.js`);
        const { proxy } = getCurrentInstance()!;
        const sidebarViews = [
            {
                title: '微软翻译',
                viewSrc: `${staticPath}/sidebar/sidebar.html`,
                show: true,
            },
            {
                title: '微软翻译2',
                viewSrc: `${staticPath}/sidebar/sidebar2.html`,
                show: false,
            },
        ];
        onMounted(() => {
            const webview = document.getElementById('test');
            webview?.addEventListener('dom-ready', () => {
                // @ts-ignore
                webview?.openDevTools();
            });
            webview?.addEventListener('ipc-message', function (event) {
                // @ts-ignore
                console.log('sidebar', event);
            });
        });
        return {
            sidebarViews,
            sidebarPreload,
        };
    },
});
</script>
<style lang="stylus">
sidebar-content-margin = 5px
sidebar-title-margin-left = 10px
.sidebar-main
    height:100%
    font-size: 14px;
    color:var(--saltdog-sidebar-title-font-color)
    .sidebar-titlebar
        display: grid;
        height: 40px
        width: 100%
        .sidebar-title
            margin-left:sidebar-title-margin-left
            align-self: center;
    .sidebar-content
        height:calc(100% - 45px)
        margin:sidebar-content-margin 0 sidebar-content-margin sidebar-content-margin
        overflow-x:hidden
        &::-webkit-scrollbar
            width: 0px;
    .sidebar-content:hover
        &::-webkit-scrollbar
            width: 6px;
        &::-webkit-scrollbar-thumb
            background: var(--saltdog-scrollbar-thumb-background-color);
        &::-webkit-scrollbar-track
            background: transparent;
</style>
