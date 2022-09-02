<template>
    <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden">
        <el-tree
            :indent="10"
            lazy
            class="LibraryTree"
            :load="loadNode"
            :data="libraryTree"
            :props="props"
            @node-click="handleNodeClick"
        />
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import SaltDogMessageChannelRenderer from '@/workspaceWindow/controller/messageChannel';
import { getDirInfoByID, getLibraryInfoByID, listDir, listLib } from '@/workspaceWindow/controller/library';
import type Node from 'element-plus/es/components/tree/src/model/node';
import { first } from 'lodash';
interface Tree {
    name: string;
    leaf?: boolean;
    libraryID?: number;
    type: 'lib' | 'dir';
    _data?: any;
}
const props = {
    label: 'name',
    children: 'dirs',
    isLeaf: 'leaf',
};
const handleNodeClick = (data: Tree) => {
    console.log('click!', data);
    if (data.type == 'dir') {
        SaltDogMessageChannelRenderer.getInstance().emit('saltdog:openLibrary', data.libraryID, data._data.dirID);
    } else if (data.type == 'lib') {
        SaltDogMessageChannelRenderer.getInstance().emit(
            'saltdog:openLibrary',
            data._data.libraryID,
            data._data.rootDir
        );
    }
};
const libraryTree = ref<Tree[]>([]);
function loadNode(node: Node, resolve: (data: Tree[]) => void) {
    const clickNodeData: Tree = node.data as Tree;
    const tree: Tree[] = [];
    if (clickNodeData.type == 'lib') {
        listDir(clickNodeData._data.libraryID, clickNodeData._data.rootDir).then((lists) => {
            for (const list of lists.dirs) {
                tree.push({
                    name: list.name,
                    leaf: false,
                    type: 'dir',
                    libraryID: clickNodeData._data.libraryID,
                    _data: list,
                });
            }
            resolve(tree);
        });
    } else if (clickNodeData.type == 'dir') {
        listDir(clickNodeData.libraryID as number, clickNodeData._data.dirID).then((lists) => {
            for (const list of lists.dirs) {
                tree.push({
                    name: list.name,
                    leaf: false,
                    type: 'dir',
                    libraryID: clickNodeData._data.libraryID,
                    _data: list,
                });
            }
            resolve(tree);
        });
    }
}
function getLibraryTree() {
    listLib().then((res) => {
        for (const lib of res) {
            libraryTree.value.push({
                name: lib.libraryName,
                leaf: false,
                type: 'lib',
                _data: lib,
            });
        }
    }); //, getLibraryInfoByID(libraryID);
}
onMounted(getLibraryTree);
// SaltDogMessageChannelRenderer.getInstance().on('saltdog.tabsChange', (id) => {
//     console.log(TAG, 'tabsChange', id);
//     if (id == null) outlineTree.value = [];
//     else getOutlineBehi();
// });
// SaltDogMessageChannelRenderer.getInstance().on('sidebar.onChange', ({ _, to }) => {
//     if (to.viewName === 'saltdog.outline') getOutlineBehi();
// });
</script>
<style lang="stylus" scoped>
.LibraryTree
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
