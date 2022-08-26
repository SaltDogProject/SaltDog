<template>
    <div class="libraryContainer">
        <div style="width: 100%; position: sticky; top: 0px">
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
        </div>
        <Navi
            @click="closeInfoPanel"
            class="pathBreadcrumb"
            :current-lib="currentLib"
            :current-path="currentPath"
            @updateView="updateView"
        />

        <el-table
            ref="singleTableRef"
            :data="itemData.row"
            highlight-current-row
            style="width: 100%"
            @row-dblclick="handleRowDbClick"
            @row-click="handleRowClick"
            @row-contextmenu="handleRowContextMenu"
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
            <el-table-column
                v-for="(customColumn, index) in itemData.column"
                :key="index"
                show-overflow-tooltip
                :property="customColumn.indexName"
                :label="customColumn.displayName"
                :min-width="customColumn.minWidth || 50"
            >
                <template #default="scope">
                    <span v-if="!scope.row.customFields || !scope.row.customFields[customColumn.indexName]">-</span>
                    <div v-else style="display: flex; align-items: center">
                        <el-tag
                            v-if="
                                scope.row.customFields[customColumn.indexName].displayType &&
                                scope.row.customFields[customColumn.indexName].displayType == 'tag'
                            "
                            class="ml-2"
                            :color="scope.row.customFields[customColumn.indexName].backgroundColor"
                        >
                            {{ scope.row.customFields[customColumn.indexName].text }}
                        </el-tag>
                        <span v-else>
                            {{ scope.row.customFields[customColumn.indexName].text }}
                        </span>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <!-- <div style="width: 100%; height: 100%" @click="closeInfoPanel"></div> -->
        <div v-show="showInfo" :class="{ itemInfoPanel: true }">
            <Info :item-info="itemInfo" @closePanel="closeInfoPanel" />
        </div>
    </div>
    <ImportDialog
        v-model:show-import-panel="showImportPanel"
        :current-lib="currentLib"
        :current-dir="currentDir"
        @updateView="updateView"
    />
    <!--右键菜单-->
    <ul
        v-show="contextMenuVisible"
        :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
        class="contextmenu"
        ref="contextMenuRef"
    >
        <li class="contextMenuSelect" @click="handleLibraryEdit('edit')">
            <el-icon><EditPen /></el-icon>
            <span>编辑</span>
        </li>
        <li class="contextMenuSelect" @click="handleLibraryEdit('delete')">
            <el-icon><Remove /></el-icon>
            <span>删除</span>
        </li>
    </ul>
</template>
<script setup lang="ts">
import { ref, defineProps, onMounted, watchEffect, getCurrentInstance } from 'vue';
// @ts-ignore
import Info from './info.vue';
import Navi from './navi.vue';
import ImportDialog from './import.vue';
import { getItemTypeImage } from './utils';
import { FolderAdd, Upload, Document, EditPen, Remove } from '@element-plus/icons-vue';
import { locateDir, listDir, getLibraryInfoByID, mkdir, getItemInfo, deleteItem } from '../../../controller/library';
import { ElMessage, ElMessageBox } from 'element-plus';
import { trim } from 'lodash';
import SaltDogMessageChannelRenderer from '../../../controller/messageChannel';
import reader from '../../../controller/reader';
import { EventEmitter } from 'stream';
import log from 'electron-log';
import { showMessage } from '@/workspaceWindow/controller/notification';
import db from '../../../../utils/db';
const TAG = '[Renderer/Library/Library]';

interface User {
    title: string;
}
const showImportPanel = ref<boolean>(false);
const currentPath = ref<any[]>([]);
const currentLib = ref<any>({});
const currentDir = ref<any>(-1);
const itemData = ref<any>({});
const itemInfo = ref<any>({});
const showInfo = ref(false);
const contextMenuRef = ref<any>(null);
// contextMenu
let contextMenuActiveItem: any = null;
const contextMenuVisible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);
let _dirID = 1;
let _libraryID = 1;
onMounted(() => {
    updateView(_libraryID, _dirID);
});
watchEffect(
    (onInvalidate) => {
        if (contextMenuVisible.value) {
            document.body.addEventListener('click', closeContextMenu);
        } else {
            document.body.removeEventListener('click', closeContextMenu);
        }

        if (showInfo.value) {
            log.debug(TAG, 'setlis');
            setTimeout(() => {
                document.body.addEventListener('click', closeInfoPanel);
            }, 500);
        } else {
            log.debug(TAG, 'remlis');
            document.body.removeEventListener('click', closeInfoPanel);
        }

        onInvalidate(() => {
            //当组件失效，watchEffect被主动停止或者副作用即将重新执行时
        });
    },
    {
        flush: 'post', //在组件更新后触发
    }
);

function closeContextMenu() {
    contextMenuVisible.value = false;
}
function doImport() {
    showImportPanel.value = true;
}
SaltDogMessageChannelRenderer.getInstance().on('saltdog.refreshLibrary', (lib, dir) => {
    updateView(lib, dir);
});
function updateView(libraryID: number, dirID: number) {
    log.debug(TAG, 'updateView', libraryID, dirID);
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
                    customFields: {},
                });
            }
            for (let i of res2.items) {
                list.push({
                    id: i.itemID,
                    itemType: i.itemType,
                    name: i.name,
                    type: 'item',
                    customFields: {},
                });
            }
            let regularTableData = {
                column: [],
                row: list,
            };
            SaltDogMessageChannelRenderer.getInstance().invoke('_beforeDisplay', regularTableData, (finalData: any) => {
                itemData.value = finalData;
                currentLib.value = res3;
                // log.debug(TAG, `Load View `, res1, finalData, res3);
            });
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
            log.debug(TAG, `Create Dir Success.`, value);
        })
        .catch(() => {
            log.debug(TAG, `Create Dir Candeled.`);
        });
}
function getImagesByType(item: any) {
    switch (item.type) {
        case 'dir':
            // eslint-disable-next-line no-undef
            return 'file:///' + __static + '/images/workspace/folder.svg';
        case 'item':
            return getItemTypeImage(item.itemType);
        default:
    }
}
function gotoPath(path: any) {
    log.debug(path);
}
function closeInfoPanel(e?: any) {
    const ppath = e ? e.path.reverse() : [];
    let allowClose = ppath.length == 0 ? true : false;
    for (const p of ppath) {
        if (!p || !p.nodeName || !p.classList) continue;
        if (p.classList.contains('el-tabs__content')) {
            allowClose = true;
        }
        if (p.nodeName == 'TR') {
            return;
        }
        if (p.classList.contains('itemInfoPanel')) {
            return;
        }
    }
    if (allowClose) {
        log.log('closeInfoPanel');
        showInfo.value = false;
        itemInfo.value = {};
    }
}
function handleRowDbClick(e: any) {
    log.debug(TAG, 'handleRowDbClick', e);
    // getItemInfo(e)
    if (e && e.type == 'dir') {
        _dirID = e.id;
        updateView(_libraryID, _dirID);
    } else {
        getItemInfo(e.id).then((res: any) => {
            const attachments = res.attachments;
            for (const att of attachments) {
                if (att.path && att.contentType == 'application/pdf') {
                    reader.getInstance().addReader(e.name, att.path, res);
                    return;
                }
            }
        });
    }
}

let _currentItem: any = null;
function handleRowClick(e: any) {
    if (!e) return;
    if (_currentItem && _currentItem.id == e.id && _currentItem.type == e.type && showInfo.value) return;
    _currentItem = { id: e.id, type: e.type };
    if (e.type === 'dir') {
        closeInfoPanel();
        return;
    }
    log.debug(TAG, 'handleCurrentChange', e);

    getItemInfo(e.id).then((res: any) => {
        itemInfo.value = res;
        log.debug(TAG, 'getItemInfo', res);
    });
    showInfo.value = true;
}
function handleRowContextMenu(data: any, _: any, pointer: PointerEvent) {
    contextMenuTop.value = pointer.pageY;
    contextMenuLeft.value = pointer.pageX;
    contextMenuVisible.value = true; //显示菜单
    setTimeout(() => {
        const { width, height } = contextMenuRef.value.getBoundingClientRect();
        if (pointer.pageY + height > window.innerHeight - 40) {
            contextMenuTop.value = pointer.pageY - height;
        }
        if (pointer.pageX + width > window.innerWidth - 40) {
            contextMenuLeft.value = pointer.pageX - width;
        }
    }, 0);

    contextMenuActiveItem = data;
}

function handleLibraryEdit(type: 'edit' | 'delete') {
    switch (type) {
        case 'edit':
            log.debug(TAG, 'EditMode');
            break;
        case 'delete':
            log.debug(TAG, 'Delete');
            ElMessageBox.confirm('确认删除条目 ' + contextMenuActiveItem.name + ' 吗？', '删除', {
                confirmButtonText: '删除',
                cancelButtonText: '再想想',
                type: 'warning',
            })
                .then(() => {
                    log.debug(TAG, 'DeleteItem ' + contextMenuActiveItem.id, ' permitted.');
                    deleteItem(contextMenuActiveItem.id)
                        .then((res: any) => {
                            updateView(_libraryID, _dirID);
                            ElMessage({
                                type: 'success',
                                message: '删除成功',
                            });
                        })
                        .catch((err: any) => {
                            log.error(TAG, 'Delete Item failed.', err);
                            ElMessage({
                                type: 'error',
                                message: `删除失败`,
                            });
                        });
                })
                .catch((err) => {
                    log.debug(TAG, 'Delete Canceled');
                });
            break;
    }
}
</script>

<style lang="stylus">
.libraryContainer
    margin: 20px 40px;
    overflow-y:scroll;
    display:flex;
    flex-direction:column;
    .el-table__body-wrapper
        flex:1

.libraryContainer > .itemInfoPanel {
    height: 100%;
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


.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  min-width:100px;
  position: fixed; //关键样式设置固定定位
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
  width:150px;
}
.contextmenu li:hover {
  background: #eee;
}
.contextMenuSelect > i ,.contextMenuSelect >span {
    display: inline-block;
    vertical-align: middle;
}
.contextMenuSelect > span {
    margin-left: 10px;
}
</style>
