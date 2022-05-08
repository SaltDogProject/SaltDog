<template>
    <div class="libraryContainer">
        <div style="display: inline-block; margin-right: 40px" class="library-title">文献列表</div>
        <el-button-group style="margin-top: -1 0px">
            <el-button type="primary" round @click="doImport">
                <el-icon class="el-icon--left"><Upload /></el-icon>
                导入文献
            </el-button>
            <el-button type="primary" round @click="createDir">
                <el-icon class="el-icon--left"><FolderAdd /></el-icon>
                新建文件夹
            </el-button>
        </el-button-group>
        <Navi
            @click="closeInfoPanel"
            class="pathBreadcrumb"
            :current-lib="currentLib"
            :current-path="currentPath"
            @updateView="updateView"
        />

        <el-table
            ref="singleTableRef"
            :data="itemData"
            highlight-current-row
            style="width: 100%"
            @row-dblclick="handleRowDbClick"
            @row-click="handleRowClick"
        >
            <!-- @current-change="handleCurrentChange" -->
            <el-table-column show-overflow-tooltip property="title" label="标题" min-width="240">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <img
                            style="width: 20px; height: 20px; margin-right: 5px"
                            :src="getImagesByType(scope.row)"
                            alt=""
                        />
                        {{ scope.row.name }}
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div style="width: 100%; height: 100%" @click="closeInfoPanel"></div>
        <div v-show="showInfo" :class="{ itemInfoPanel: true }">
            <Info :item-info="itemInfo" @closePanel="closeInfoPanel" />
        </div>

        <ImportDialog
            v-model:show-import-panel="showImportPanel"
            :current-lib="currentLib"
            :current-dir="currentDir"
            @updateView="updateView"
        />
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
// @ts-ignore
import Info from './info.vue';
import Navi from './navi.vue';
import ImportDialog from './import.vue';
import { getItemTypeImage } from './utils';
import { FolderAdd, Upload, Document } from '@element-plus/icons-vue';
import { locateDir, listDir, getLibraryInfoByID, mkdir, getItemInfo } from '../../../controller/library';
import { ElMessage, ElMessageBox } from 'element-plus';
import { trim } from 'lodash';
const TAG = '[Renderer/Library/Library]';
interface User {
    title: string;
}
const showImportPanel = ref<boolean>(false);
const currentPath = ref<any[]>([]);
const currentLib = ref<any>({});
const currentDir = ref<any>(-1);
const itemData = ref<any[]>([]);
const itemInfo = ref<any>({});
const showInfo = ref(false);
let _dirID = 1;
let _libraryID = 1;
onMounted(() => {
    updateView(_libraryID, _dirID);
});
function doImport() {
    showImportPanel.value = true;
}

function updateView(libraryID: number, dirID: number) {
    console.log(TAG, 'updateView', libraryID, dirID);
    _dirID = dirID;
    _libraryID = libraryID;
    currentDir.value = dirID;
    Promise.all([locateDir(dirID), listDir(libraryID, dirID), getLibraryInfoByID(libraryID)]).then(
        ([res1, res2, res3]) => {
            currentPath.value = res1.slice(1, res1.length);
            const list = [];
            for (let i of res2.dirs) {
                list.push({
                    id: i.dirID,
                    name: i.name,
                    type: 'dir',
                });
            }
            for (let i of res2.items) {
                list.push({
                    id: i.itemID,
                    itemType: i.itemType,
                    name: i.name,
                    type: 'item',
                });
            }
            itemData.value = list;
            currentLib.value = res3;
            console.log(TAG, `Load View `, res1, list, res3);
        }
    );
}
function createDir() {
    ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
        confirmButtonText: '新建',
        cancelButtonText: '取消',
    })
        .then(({ value }) => {
            if (trim(value) == '') {
                ElMessage({
                    type: 'error',
                    message: `文件夹名称不能为空，请重试`,
                });
            }
            mkdir(_libraryID, _dirID, trim(value))
                .then((res: any) => {
                    // res.dirID,res.localKey
                    updateView(_libraryID, _dirID);
                })
                .catch((err: string) => {
                    ElMessage({
                        type: 'error',
                        message: `新建文件夹失败：${err}`,
                    });
                });
            console.log(TAG, `Create Dir Success.`, value);
        })
        .catch(() => {
            console.log(TAG, `Create Dir Candeled.`);
        });
}
function getImagesByType(item: any) {
    switch (item.type) {
        case 'dir':
            // eslint-disable-next-line no-undef
            return __static + '/images/workspace/folder.svg';
        case 'item':
            return getItemTypeImage(item.itemType);
        default:
    }
}
function gotoPath(path: any) {
    console.log(path);
}
function closeInfoPanel() {
    showInfo.value = false;
    itemInfo.value = {};
}
function handleRowDbClick(e: any) {
    console.log(TAG, 'handleRowDbClick', e);
    // getItemInfo(e)
    if (e && e.type == 'dir') {
        _dirID = e.id;
        updateView(_libraryID, _dirID);
    }
}

let _currentItem: any = null;
function handleRowClick(e: any) {
    if (!e) return;
    if (_currentItem && _currentItem.id == e.id && _currentItem.type == e.type && showInfo.value) return;
    _currentItem = { id: e.id, type: e.type };
    if (e.type == 'dir') {
        closeInfoPanel();
        return;
    }
    console.log(TAG, 'handleCurrentChange', e);

    getItemInfo(e.id).then((res: any) => {
        itemInfo.value = res;
        console.log(TAG, 'getItemInfo', res);
    });
    showInfo.value = true;
}
</script>

<style>
.libraryContainer {
    margin: 20px 40px;
    width: 100%;
    height: 100%;
}

.libraryContainer > .itemInfoPanel {
    height: calc(100% - 40px);
    max-width: 450px;
    float: right;
    top: 0px;
    position: absolute;
    right: 0px;
    z-index: 999;
    background-color: white;
    box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, 0.04), 0px 8px 20px rgba(0, 0, 0, 0.08);
}

.library-title {
    font-size: 2em;
    margin: 30px 0px;
}
.pathBreadcrumb {
    margin: 20px 0px;
}
</style>
