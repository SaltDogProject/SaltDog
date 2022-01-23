<template>
    <div v-for="(view, index) in sidebarViews" :key="index" class="sidebar-main" v-show="view.show">
        <keep-alive>
            <div style="width: 100%; height: 100%">
                <div class="sidebar-titlebar">
                    <div class="sidebar-title">{{ view.name }}</div>
                </div>
                <div class="sidebar-content">
                    <webview
                        class="sidebar-webview"
                        :id="view.id"
                        :src="view.viewSrc"
                        :preload="sidebarPreload"
                        :data-uuid="view.uuid"
                    ></webview>
                </div>
            </div>
        </keep-alive>
    </div>
    <!-- <div>
        <webview class="sidebar-webview" :src="testViews" :preload="sidebarPreload"></webview>
    </div> -->
</template>
<script lang="ts">
import { WebviewTag } from 'electron';
import { defineComponent, DefineComponent, getCurrentInstance, onMounted, onUpdated, ref } from 'vue';
import plugins from '../../controller/plugin/plugin';
const TAG = '[Sidebar]';
export default defineComponent({
    setup() {
        // eslint-disable-next-line no-undef
        const staticPath = __static;
        const sidebarPreload = ref(`${staticPath}/preloads/pluginWebviewPreload/preload.js`);
        const sidebarViews = ref(plugins.getSidebarViewsRef());
        const mountedViews = new Map<string, boolean>();
        onMounted(() => {
            const views = document.getElementsByClassName('sidebar-webview');
            for (let i = 0; i < views.length; i++) {
                const webviewTag = views[i] as WebviewTag;
                console.log(TAG, `Mount with webview`, webviewTag);
                plugins.registerSidebarView(webviewTag);
                mountedViews.set(webviewTag.id, true);
            }
        });
        onUpdated(() => {
            const views = document.getElementsByClassName('sidebar-webview');
            for (let i = 0; i < views.length; i++) {
                const webviewTag = views[i] as WebviewTag;
                if (!mountedViews.has(webviewTag.id)) {
                    plugins.registerSidebarView(webviewTag);
                    mountedViews.set(webviewTag.id, true);
                }
            }
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
.sidebar-webview
    width: 100%;
    height: 100%;
    overflow: hidden;
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
