<template>
    <welcome-page v-show="showWelcome"></welcome-page>
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
            <div style="width: 100%; height: 100%">
                <keep-alive>
                    <div style="width: 100%; height: 100%">
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
                    </div>
                </keep-alive>
                <!--
                    nodeintegration
                    disablewebsecurity
                    webpreferences="contextIsolation=false"
                    :preload="item.isPdf?pdfViewerPreload:''"
                -->
            </div>
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
import tabManager from './tabManager';
import Viewer from './pdfViewer/viewer.vue';
import path from 'path';
import { existsSync } from 'fs';
import WelcomePage from './Welcome.vue';
// @ts-ignore
import Settings from './Settings.vue';
import bus from '../../controller/systemBus';
const isDevelopment = process.env.NODE_ENV !== 'production';
declare const __static: any;
const TAG = '[tabs/Main]';
export default defineComponent({
    components: { WelcomePage, Settings },
    //item.webviewUrl
    setup() {
        const pdfViewerPreload = `${__static}/preloads/pdfPreload${isDevelopment ? '' : '/build'}/preload.js`;
        const editableTabs = tabManager.getTabListRef();
        const editableTabsValue = tabManager.getCurrentTabRef();
        const { proxy } = getCurrentInstance()!;
        const showWelcome = ref(true);
        let settingsViewId = '';
        let tabIndex = 1;
        function handleTabsEdit(targetName: string, action: string) {
            if (action === 'add') {
                const newTabName = `${++tabIndex}`;
                tabManager.addTab('New Tab', 'about:blank');
            }
            if (action === 'remove') {
                tabManager.removeTab(targetName);
                if (!showWelcome.value && editableTabs.value.length == 0) {
                    showWelcome.value = true;
                    bus.emit('_setWindowTitle', '欢迎');
                }
            }
        }
        function handleSettingsView() {
            if (settingsViewId != '' && tabManager.getInfoById(settingsViewId) != null) {
                tabManager.setCurrentTab(settingsViewId);
            } else {
                settingsViewId = tabManager.addTab('设置', '', 'saltdog-internal', 'settings');
            }
        }
        onUnmounted(() => {
            bus.removeListener('saltdog:openSettings', handleSettingsView);
        });
        onMounted(() => {
            tabManager.onMounted();
            bus.on('saltdog:openSettings', handleSettingsView);
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
                bus.emit('_setWindowTitle', tabManager.getTabInfo(tabManager.getCurrentTab()).title);
            }
            bus.emit('onTabsChange', editableTabsValue.value);
        });
        onUpdated(() => {
            tabManager.onUpdated();
        });
        function handleTabsChange(e: any) {
            console.error(TAG, e);
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
        // height:'calc(100% - %s)' % tabitem_height
        height:100%
        width:100%
        .el-tab-pane
            height:100%
            width:100%
            .mainWebView
                height:100%
                width:100%
</style>
