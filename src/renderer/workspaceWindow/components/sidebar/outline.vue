<template>
    <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden">
        <el-tree
            :indent="10"
            class="OutlineTree"
            :data="outlineTree"
            :props="defaultProps"
            @node-click="handleNodeClick"
        />
    </div>
</template>
<script lang="ts" setup>
import {
    defineComponent,
    DefineComponent,
    getCurrentInstance,
    onActivated,
    onMounted,
    onUpdated,
    ref,
    toRefs,
} from 'vue';
import mainTabManager from '../../controller/tabManager';
import { PDFAPISTAT } from '@/utils/constants';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
const TAG = '[Sidebar/Outline]';
interface Tree {
    dest: string;
    title: string;
    items?: Tree[];
}

const defaultProps = {
    children: 'items',
    label: 'title',
};

const outlineTree = ref<Tree[]>([]);
const handleNodeClick = (data: Tree) => {
    const currentTab = mainTabManager.getCurrentTab();
    mainTabManager.whenPdfTabReady(currentTab, () => {
        if (currentTab == null) return;
        const handler = mainTabManager.getMessageHandler(currentTab);
        if (!handler) {
            console.error(TAG, 'Get tab messageHandler failed');
            return;
        }
        handler.invokeWebview('jumpToTarget', data.dest, (msg: any) => {
            console.log(TAG, `Jump to target ${data.title}:`, msg);
        });
    });
};
const getOutlineBehi = () => {
    const currentTab = mainTabManager.getCurrentTab();
    if (currentTab == null) return;
    mainTabManager.whenPdfTabReady(currentTab, () => {
        const handler = mainTabManager.getMessageHandler(currentTab);
        if (!handler) {
            console.error(TAG, 'Get tab messageHandler failed');
            return;
        }
        handler.invokeWebview('getOutline', {}, (outline: any) => {
            if (outline.status == PDFAPISTAT.SUCCESS) {
                outlineTree.value = outline.outline;
            } else {
                console.error(TAG, 'Get Outline error:', outline.msg);
            }
        });
    });
};
onMounted(getOutlineBehi);
SaltDogMessageChannelRenderer.getInstance().on('saltdog.tabsChange', (id) => {
    console.log(TAG, 'tabsChange', id);
    if (id == null) outlineTree.value = [];
    else getOutlineBehi();
});
SaltDogMessageChannelRenderer.getInstance().on('sidebar.onChange', ({ _, to }) => {
    if (to.viewName === 'saltdog.outline') getOutlineBehi();
});
// onActivated(getOutlineBehi);
// onUpdated(getOutlineBehi);
</script>
<style lang="stylus" scoped>
.OutlineTree
    background: var(--saltdog-sidebar-background-color)!important;
    border-radius:5px;
    color: var(--el-tree-font-color)!important;
    --el-tree-font-color:var(--saltdog-sidebar-title-font-color)!important;
    --el-tree-node-hover-background-color: #f5f7fa!important;
    --el-tree-expand-icon-color: var(--saltdog-sidebar-title-font-color)!important;
.el-tree-node
    white-space:initial!important
.el-tree-node__content
    height:auto!important
    padding-top:4px!important
    padding-bottom:4px!important
</style>
