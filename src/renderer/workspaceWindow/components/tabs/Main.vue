<template>
    <welcome-page v-show="showWelcome"></welcome-page>
    <el-tabs v-show="!showWelcome" class="tabview" v-model="editableTabsValue" type="border-card" closable @edit="handleTabsEdit">
        <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name">
            <!--disable node integration for security-->
            <div style="width: 100%; height: 100%">
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
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts">
import { defineComponent,watch,onMounted, ref, onBeforeUpdate, onUpdated, getCurrentInstance } from 'vue';
import tabManager from './tabManager';
import Viewer from './pdfViewer/viewer.vue';
import path from 'path';
import {existsSync} from 'fs';
import WelcomePage from './Welcome.vue'
import bus from '../../controller/systemBus'
declare const __static: any;
export default defineComponent({
    components:{WelcomePage},
    //item.webviewUrl
    setup() {
        const pdfViewerPreload = `${__static}/preloads/pdfPreload/preload.js`;
        const editableTabs = tabManager.getTabListRef();
        const editableTabsValue = tabManager.getCurrentTabRef();
        const { proxy } = getCurrentInstance()!;
        const showWelcome = ref(true);
        let tabIndex = 1;
        function handleTabsEdit(targetName: string, action: string) {
            if (action === 'add') {
                const newTabName = `${++tabIndex}`;
                tabManager.addTab('New Tab', 'about:blank');
            }
            if (action === 'remove') {
                tabManager.removeTab(targetName);
                            if(!showWelcome.value&&editableTabs.value.length==0){
                showWelcome.value=true;
                bus.emit('_setWindowTitle','欢迎')
            }
            }
        }
        onMounted(() => {
            tabManager.onMounted();
            // @ts-ignore
            if(proxy.__workspaceInfo.pdfPath&&existsSync(proxy.__workspaceInfo.pdfPath)){
                // 有预先注入的打开目标
                // @ts-ignore
                tabManager.addPdfTab(path.basename(proxy.__workspaceInfo.pdfPath||'未命名'),proxy.__workspaceInfo.pdfPath);
            }
            // setTimeout(()=>{
            //     tabManager.addPdfTab('hh',`C:/Users/Dorapocket/Desktop/Xilinx Doc/Xilinx Doc/ug1399-vitis-hls.pdf`);
            // },5000)
        });
        onBeforeUpdate(() => {
            tabManager.onBeforeUpdate();
            if(showWelcome.value&&editableTabs.value.length!=0){
                showWelcome.value=false;
                bus.emit('_setWindowTitle',tabManager.getTabInfo(tabManager.getCurrentTab()).title)
            }
        });
        onUpdated(() => {
            tabManager.onUpdated();
        });
        return {
            showWelcome,
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
