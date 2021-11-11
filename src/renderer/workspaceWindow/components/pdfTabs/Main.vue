<template>
    <el-tabs class="pdftabview" v-model="editableTabsValue" type="border-card" closable @edit="handleTabsEdit">
        <el-tab-pane v-for="item in editableTabs" :key="item.name" :label="item.title" :name="item.name">
            <keep-alive>
                <webview
                    :id="item.webviewId"
                    class="pdfWebView"
                    :src="item.webviewUrl"
                    disablewebsecurity
                    nodeintegration
                    webpreferences="contextIsolation=false"
                ></webview>
            </keep-alive>
        </el-tab-pane>
    </el-tabs>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUpdate, onUpdated, getCurrentInstance } from 'vue';
import tabManager from './tabManager';
declare const __static: any;
export default defineComponent({
    setup() {
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
            tabManager.addPdfTab(proxy.__sdConfig.pdfPath);
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
            handleTabsEdit,
        };
    },
});
</script>
<style lang="stylus">
tabitem_height = 40px
.pdftabview
    height: 100%
    .el-tabs__header
        .el-tabs__item
            height tabitem_height
    .el-tabs__content
        padding 0px!important
        height:'calc(100% - %s)' % tabitem_height
        width:100%
        .el-tab-pane
            height:100%
            width:100%
            .pdfWebView
                height:100%
                width:100%
</style>
