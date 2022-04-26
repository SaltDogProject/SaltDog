<template>
    <div class="libraryContainer">
        <div style="display: inline-block; margin-right: 40px" class="library-title">文献列表</div>
        <el-button-group style="margin-top: -1 0px">
            <el-button type="primary" round>
                <el-icon class="el-icon--left"><Upload /></el-icon>
                导入文献
            </el-button>
            <el-button type="primary" round>
                <el-icon class="el-icon--left"><FolderAdd /></el-icon>
                新建文件夹
            </el-button>
        </el-button-group>
        <Navi class="pathBreadcrumb" :currentPath="currentPath" />

        <el-table
            ref="singleTableRef"
            :data="itemData"
            highlight-current-row
            style="width: 100%"
            @current-change="handleCurrentChange"
        >
            <el-table-column show-overflow-tooltip property="title" label="标题" min-width="240">
                <template #default="scope">
                    <div style="display: flex; align-items: center">
                        <img style="width: 20px; height: 20px; margin-right: 5px" :src="pdfSrc" alt="" />
                        {{ scope.row.title }}
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div v-if="showInfo" :class="{ itemInfoPanel: true }">
            <Info />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
// @ts-ignore
import Info from './info.vue';
import Navi from './navi.vue';
import { FolderAdd, Upload, Document } from '@element-plus/icons-vue';
import {locateDir,listDir} from '../../../controller/library';
const TAG = '[Renderer/Library/Library]';
interface User {
    title: string;
}

const currentPath = ref<any[]>([]);
const itemData = ref<any[]>([]);
//@ts-ignore
const pdfSrc = '/conference.svg';
const showInfo = ref(false);
let _dirID=1;
let _libraryID=1;
onMounted(() => {
    updateView(_libraryID,_dirID);
});
function updateView(libraryID:number,dirID:number) {
    console.log(TAG, 'updateView',libraryID,dirID);
    _dirID = dirID;
    _libraryID = libraryID;
    locateDir(dirID).then((res)=>{
        currentPath.value = res;
    });
    listDir(libraryID,dirID).then((dirList)=>{
        const list = [];
        for(let i of dirList.dirs){
            list.push({
                id: i.dirID,
                name: i.name,
                type: 'dir',
            });
        }
        for(let i of dirList.items){
            list.push({
                id: i.itemID,
                name: i.name,
                type: 'item',
            });
        }
    itemData.value = list;
    });
    }

function gotoPath(path: any) {
    console.log(path);
}
function handleCurrentChange(e: any) {
    console.log(e);
    showInfo.value = true;
}
</script>

<style>
.libraryContainer {
    margin: 20px 40px;
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
