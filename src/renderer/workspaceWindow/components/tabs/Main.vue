<template>
    <el-tabs class="tabview" v-model="editableTabsValue" type="border-card" closable @edit="handleTabsEdit">
        <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name">
            <!--disable node integration for security-->
            <div v-if="!item.isPdf" style="width: 100%; height: 100%">
                <keep-alive>
                    <webview
                        :id="item.webviewId"
                        class="mainWebView"
                        :src="item.webviewUrl"
                        disablewebsecurity
                        webpreferences="contextIsolation=false"
                        :preload="item.isPdf ? pdfViewerPreload : ''"
                    ></webview>
                </keep-alive>
                <!--
                    nodeintegration
                    disablewebsecurity
                    webpreferences="contextIsolation=false"
                    :preload="item.isPdf?pdfViewerPreload:''"
                -->
            </div>
            <div v-else style="width: 100%; height: 100%">
                <keep-alive>
                    <viewer class="pdfViewer">
                        
                    </viewer>
                </keep-alive>
            </div>
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUpdate, onUpdated, getCurrentInstance } from 'vue';
import tabManager from './tabManager';
import Viewer from './pdfViewer/viewer.vue';
declare const __static: any;
export default defineComponent({
    components: { Viewer },
    //item.webviewUrl
    setup() {
        const pdfViewerPreload = `${__static}/preloads/pdfPreload/preload.js`;
        const editableTabs = tabManager.getTabListRef();
        const editableTabsValue = tabManager.getCurrentTabRef();
        const { proxy } = getCurrentInstance()!;
        let tabIndex = 1;
        function handleTabsEdit(targetName: string, action: string) {
            if (action === 'add') {
                const newTabName = `${++tabIndex}`;
                tabManager.addTab('New Tab', 'about:blank');
            }
            if (action === 'remove') {
                tabManager.removeTab(targetName);
            }
        }
        onMounted(() => {
            tabManager.onMounted();
            // @ts-ignore
            tabManager.addPdfTab(proxy.__workspaceInfo.pdfPath);
        });
        onBeforeUpdate(() => {
            tabManager.onBeforeUpdate();
        });
        onUpdated(() => {
            tabManager.onUpdated();
        });
        return {
            editableTabsValue,
            editableTabs,
            tabIndex,
            pdfViewerPreload,
            handleTabsEdit,
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
    .el-tabs__header
        background-color: var(--saltdog-tabheader-background-color)!important
        .el-tabs__item
            height tabitem_height
    .el-tabs__content
        padding 0px!important
        height:'calc(100% - %s)' % tabitem_height
        width:100%
        .el-tab-pane
            height:100%
            width:100%
            .mainWebView
                height:100%
                width:100%
</style>
