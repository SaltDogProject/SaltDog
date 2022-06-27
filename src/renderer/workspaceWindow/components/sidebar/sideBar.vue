<template>
    <div v-for="(view, index) in sidebarViews" :key="index" class="sidebar-main" v-show="view.show">
        <keep-alive>
            <div style="width: 100%; height: 100%">
                <div class="sidebar-titlebar">
                    <div class="sidebar-title">
                        <div class="sidebar-title__title">
                            {{ view.name }}
                        </div>
                        <div style="flex-grow: 1"></div>
                        <div class="sidebar-title__icon">
                            <i
                                v-if="isDev"
                                class="el-icon-refresh"
                                :data-pluginname="view.viewName"
                                :data-uuid="view.uuid"
                                @click="restartPlugin"
                            ></i>
                        </div>
                    </div>
                </div>
                <div class="sidebar-content">
                    <library v-if="view.isBuildIn && view.viewName == 'saltdog.library'"></library>
                    <outline v-if="view.isBuildIn && view.viewName == 'saltdog.outline'"></outline>
                    <search v-if="view.isBuildIn && view.viewName == 'saltdog.search'"></search>
                    <plugin v-if="view.isBuildIn && view.viewName == 'saltdog.plugin'"></plugin>
                    <webview
                        v-else
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
import Outline from './outline.vue';
import Search from './search.vue';
import Plugin from './plugin.vue';
import { defineComponent, DefineComponent, getCurrentInstance, onMounted, onUpdated, ref } from 'vue';
import plugins from '../../controller/plugin/plugin';
const TAG = '[Sidebar]';
const isDevelopment = process.env.NODE_ENV !== 'production';

export default defineComponent({
    components: { Outline, Search, Plugin },
    setup() {
        // eslint-disable-next-line no-undef
        const staticPath = 'file:///' + __static;
        const sidebarPreload = ref(
            `${staticPath}/preloads/pluginWebviewPreload${isDevelopment ? '' : '/build'}/preload.js`
        );
        const sidebarViews = ref(plugins.getSidebarViewsRef());
        const mountedViews = new Map<string, boolean>();
        const isDev = ref(false);
        isDev.value = process.env.NOCE_ENV !== 'production';
        onMounted(() => {
            const views = document.getElementsByClassName('sidebar-webview');
            for (let i = 0; i < views.length; i++) {
                const webviewTag = views[i] as any;
                console.log(TAG, `Mount with webview`, webviewTag);
                plugins.registerSidebarView(webviewTag);
                mountedViews.set(webviewTag.id, true);
            }
        });
        onUpdated(() => {
            const views = document.getElementsByClassName('sidebar-webview');
            for (let i = 0; i < views.length; i++) {
                const webviewTag = views[i] as any;
                if (!mountedViews.has(webviewTag.id)) {
                    plugins.registerSidebarView(webviewTag);
                    mountedViews.set(webviewTag.id, true);
                }
            }
        });
        function restartPlugin(e: any) {
            console.log(`Restart plugin `, e.target.dataset.pluginname);
            plugins.restartPlugin(e.target.dataset.pluginname);
        }
        return {
            sidebarViews,
            sidebarPreload,
            restartPlugin,
            isDev,
        };
    },
});
</script>
<style lang="stylus">
sidebar-content-margin = 0px
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
        box-shadow: 0px 0px 17px -12px rgba(0,0,0,100);
        .sidebar-title
            display: flex;
            flex-direction: row;
            width: 100%;
            align-self: center
            .sidebar-title__title
                display: inline-block;
                padding-left: sidebar-title-margin-left
            .sidebar-title__icon
                display: inline-block;
                align-self: flex-end;
    .sidebar-content
        height:calc(100% - 45px)
        margin:sidebar-content-margin 0 sidebar-content-margin sidebar-content-margin
        overflow-x:hidden
        overflow-y: overlay
        &::-webkit-scrollbar
            width: 0px;
    .sidebar-content:hover
        &::-webkit-scrollbar
            width: 4px;
        &::-webkit-scrollbar-thumb
            background: var(--saltdog-scrollbar-thumb-background-color);
        &::-webkit-scrollbar-track
            background: transparent;
</style>
