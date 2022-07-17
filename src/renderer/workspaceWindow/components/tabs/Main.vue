<template>
    <welcome-page v-if="showWelcome"></welcome-page>
    <el-tabs
        v-show="!showWelcome"
        class="tabview"
        v-model="editableTabsValue"
        type="border-card"
        closable
        @edit="handleTabsEdit"
        @tab-change="handleTabsChange"
    >
        <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name">
            <!--disable node integration for security-->
            <keep-alive>
                <div style="width: 100%; height: 100%; overflow: hidden">
                    <webview
                        v-if="item.type == 'webview'"
                        :id="item.webviewId"
                        class="mainWebView"
                        :src="item.webviewUrl"
                        disablewebsecurity
                        webpreferences="contextIsolation=false"
                        :preload="item.isPdf ? pdfViewerPreload : ''"
                    ></webview>
                    <settings v-if="item.type == 'settings'" />
                    <library v-if="item.type == 'library'" />
                </div>
            </keep-alive>
            <!--
                    nodeintegration
                    disablewebsecurity
                    webpreferences="contextIsolation=false"
                    :preload="item.isPdf?pdfViewerPreload:''"
                -->
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts">
import {
    defineComponent,
    watch,
    onMounted,
    ref,
    onBeforeUpdate,
    onUpdated,
    getCurrentInstance,
    onUnmounted,
} from 'vue';
import tabManager from '../../controller/tabManager';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
import Viewer from './pdfViewer/viewer.vue';
import path from 'path';
import { existsSync } from 'fs';
import WelcomePage from './Welcome.vue';
import Library from './library/library.vue';
// @ts-ignore
import Settings from './Settings.vue';
import bus from '../../controller/systemBus';
const isDevelopment = process.env.NODE_ENV !== 'production';
declare const __static: any;
const TAG = '[tabs/Main]';
export default defineComponent({
    components: { WelcomePage, Settings, Library },
    //item.webviewUrl
    setup() {
        const pdfViewerPreload = `${'file:///' + __static}/preloads/pdfPreload${
            isDevelopment ? '' : '/build'
        }/preload.js`;
        const editableTabs = tabManager.getTabListRef();
        const editableTabsValue = tabManager.getCurrentTabRef();
        const { proxy } = getCurrentInstance()!;
        const showWelcome = ref(true);
        let settingsViewId = '';
        let libraryViewId = '';
        let tabIndex = 1;
        function handleTabsEdit(targetName: string, action: string) {
            if (action === 'add') {
                const newTabName = `${++tabIndex}`;
                tabManager.addTab('New Tab', 'about:blank');
            }
            if (action === 'remove') {
                tabManager.removeTab(targetName).then(() => {
                    if (!showWelcome.value && editableTabs.value.length == 0) {
                        showWelcome.value = true;
                        SaltDogMessageChannelRenderer.getInstance().publish('saltdog.setWindowTitle', '欢迎');
                    }
                });
            }
        }
        function handleSettingsView() {
            if (settingsViewId != '' && tabManager.getInfoById(settingsViewId) != null) {
                tabManager.setCurrentTab(settingsViewId);
            } else {
                settingsViewId = tabManager.addTab('设置', '', 'settings');
            }
        }
        function handleLibraryView() {
            if (libraryViewId != '' && tabManager.getInfoById(libraryViewId) != null) {
                tabManager.setCurrentTab(libraryViewId);
            } else {
                libraryViewId = tabManager.addTab('文献列表', '', 'library');
            }
        }
        onUnmounted(() => {
            bus.removeListener('saltdog:openSettings', handleSettingsView);
            bus.removeListener('saltdog:openLibrary', handleLibraryView);
        });
        onMounted(() => {
            tabManager.onMounted();
            bus.on('saltdog:openSettings', handleSettingsView);
            bus.on('saltdog:openLibrary', handleLibraryView);
            // @ts-ignore
            if (proxy.__workspaceInfo.pdfPath && existsSync(proxy.__workspaceInfo.pdfPath)) {
                // 有预先注入的打开目标
                // @ts-ignore
                tabManager.addPdfTab(
                    // @ts-ignore
                    path.basename(proxy.__workspaceInfo.pdfPath || '未命名'),
                    // @ts-ignore
                    proxy.__workspaceInfo.pdfPath
                );
            }
            // setTimeout(()=>{
            //     tabManager.addPdfTab('hh',`C:/Users/Dorapocket/Desktop/Xilinx Doc/Xilinx Doc/ug1399-vitis-hls.pdf`);
            // },5000)
        });
        onBeforeUpdate(() => {
            tabManager.onBeforeUpdate();
            if (showWelcome.value && editableTabs.value.length != 0) {
                showWelcome.value = false;
                SaltDogMessageChannelRenderer.getInstance().publish(
                    'saltdog.setWindowTitle',
                    tabManager.getTabInfo(tabManager.getCurrentTab()).title
                );
            }
            bus.emit('onTabsChange', editableTabsValue.value);
        });
        onUpdated(() => {
            tabManager.onUpdated();
        });
        function handleTabsChange(e: any) {
            SaltDogMessageChannelRenderer.getInstance().publish(
                'saltdog.setWindowTitle',
                tabManager.getTabInfo(tabManager.getCurrentTab()).title
            );
        }
        return {
            showWelcome,
            editableTabsValue,
            editableTabs,
            tabIndex,
            pdfViewerPreload,
            handleTabsEdit,
            handleTabsChange,
        };
    },
});
</script>
<style lang="stylus">
tabitem_height = 40px
.tabview
    box-shadow: none!important
    border:none!important
    height: 100%
    // .el-tabs__header
    //     background-color: var(--saltdog-tabheader-background-color)!important
    //     .el-tabs__item
    //         height tabitem_height
    .el-tabs__content
        padding 0px!important
        height:'calc(100% - %s)' % tabitem_height
        // height:100%
        width:100%
        .el-tab-pane
            height:100%
            width:100%
            // overflow: scroll
            // position: absolute
            .mainWebView
                height:100%
                width:100%
</style>
