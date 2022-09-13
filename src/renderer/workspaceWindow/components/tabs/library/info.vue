<template>
    <div style="max-height: 150px; width: 100%; position: relative" v-if="itemInfo && displayInfo">
        <div style="position: absolute; right: 12px; top: 2px">
            <el-button @click="closeInfoPanel" style="font-size: 20px; color: grey" type="text" :icon="Close" />
        </div>
        <div class="itemInfoHead">
            <div style="height: 100%; align-items: center; margin: 0px 10px">
                <img style="width: 30px; height: 30px" :src="getItemTypeImage(itemInfo.typeName)" alt="" />
            </div>
            <div class="itemInfoHead_title">
                {{ itemInfo.title }}
            </div>
        </div>
    </div>
    <div style="margin: 10px; height: calc(100% - 190px)" v-if="itemInfo && displayInfo">
        <el-tabs stretch v-model="activeName" class="itemInfoListTabs" @tab-click="handleClick">
            <el-tab-pane label="详细信息" name="info">
                <div style="font-size: 20px">
                    附件
                    <el-button style="margin-top: 3px" type="primary" link @click="addAttachment">新增</el-button>
                </div>
                <div class="attachment_group">
                    <div
                        @click="handleAttachmentClick(a)"
                        :key="a.attachmentID"
                        v-for="a in displayInfo.attachments"
                        :class="{ attacment_item: true, attachment_downloading: a.syncState == -1 }"
                        @contextmenu="showContextmenu"
                        :data-attachmentInfo="JSON.stringify(a)"
                    >
                        <img style="width: 20px; height: 20px" :src="getMIMEImage(a.contentType)" alt="" />
                        <span class="attacment_title">
                            {{ a.name }}
                            <span v-if="a.syncState == -1">(下载中)</span>
                        </span>
                    </div>
                </div>
                <div style="font-size: 20px; vertical-align: baseline">
                    详情
                    <el-button style="margin-top: 3px" type="primary" link @click="editInfo">编辑</el-button>
                </div>
                <div class="itemInfoListContainer" :style="infoH">
                    <el-descriptions :column="1" direction="horizontal">
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="文章类型"
                        >
                            {{ geti18N(itemInfo.typeName) }}
                        </el-descriptions-item>
                        <el-descriptions-item
                            v-if="displayInfo.creators"
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="作者"
                        >
                            <el-tag class="ml-2 infoTag" v-for="au in displayInfo.creators" :key="au.creatorID">
                                {{ au.firstName + (au.lastName == '' || undefined ? '' : ' ' + au.lastName) }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            v-if="displayInfo && displayInfo.abstractNote"
                            label="摘要"
                        >
                            <el-collapse style="--el-collapse-border-color">
                                <el-collapse-item class="abstractCollapse" title="点击查看" name="1">
                                    {{ displayInfo.abstractNote }}
                                </el-collapse-item>
                            </el-collapse>
                        </el-descriptions-item>
                        <el-descriptions-item
                            v-if="displayInfo.url"
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="URL"
                        >
                            <a @click="openExternal(displayInfo.url)" style="color: #409eff">点此打开</a>
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            v-for="(data, index) in displayInfo.props"
                            :key="index"
                            :label="geti18N(data.fieldName)"
                        >
                            {{ data.value }}
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="添加日期"
                        >
                            {{ itemInfo.dateAdded }}
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="修改日期"
                        >
                            {{ itemInfo.dateModified }}
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </el-tab-pane>
            <el-tab-pane label="管理" name="manage">
                <div style="font-size: 20px">标签</div>
                <div class="itemTags-group">
                    <el-tag v-for="tag in displayInfo.tags" :key="tag.tagID" :color="tag.color" class="ml-2 infoTag">
                        {{ tag.name }}
                    </el-tag>
                </div>
            </el-tab-pane>
        </el-tabs>
        <!--右键菜单-->
        <ul
            v-show="contextMenuVisible"
            :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
            class="contextmenu"
            ref="contextMenuRef"
        >
            <li class="contextMenuSelect" v-if="itemIsLocal" @click="handleAttachEdit('openPath')">
                <el-icon><Files /></el-icon>
                <span>打开文件位置</span>
            </li>
            <li class="contextMenuSelect" v-if="itemHasUrl" @click="handleAttachEdit('openURL')">
                <el-icon>
                    <img :src="getMIMEImage('text/html')" style="width: 12px; height: 12px" alt="" srcset="" />
                </el-icon>
                <span>打开URL</span>
            </li>
            <li class="contextMenuSelect" @click="handleAttachEdit('delete')">
                <el-icon><Remove /></el-icon>
                <span>删除</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import i18N from '../../../utils/i18n';
import { openExternal } from '../../../utils/external';
import { getMIMEImage, getItemTypeImage } from './utils';
import { computed, onMounted, ref, defineProps, defineEmits, toRefs, onUpdated, reactive, watchEffect } from 'vue';
import { Close, Remove, Files } from '@element-plus/icons-vue';
import reader from '../../../controller/reader';
import SaltDogMessageChannelRenderer from '../../../controller/messageChannel';
import { deleteAttachment, getItemInfo } from '@/workspaceWindow/controller/library';
import { existsSync } from 'fs-extra';
import { ElMessageBox } from 'element-plus';

const TAG = '[Renderer/Library/Info]';
const p = defineProps<{
    itemId: any;
}>();
const emit = defineEmits<{
    (e: 'closePanel'): void;
}>();
function geti18N(str: string) {
    return i18N['zh-CN']['fields'][str] || i18N['zh-CN']['itemTypes'][str];
}
function closeContextMenu() {
    contextMenuVisible.value = false;
}
watchEffect(
    (onInvalidate) => {
        if (contextMenuVisible.value) {
            document.body.addEventListener('click', closeContextMenu);
        } else {
            document.body.removeEventListener('click', closeContextMenu);
        }
        onInvalidate(() => {
            //当组件失效，watchEffect被主动停止或者副作用即将重新执行时
        });
    },
    {
        flush: 'post', //在组件更新后触发
    }
);
const { itemId } = toRefs(p);
const itemInfo = ref<any>({});
const displayInfo = computed<any>({
    get: () => {
        if (!itemInfo.value) return;
        if (!itemInfo.value.props) return;
        let rt: {
            props: any[];
            abstractNote?: string;
            creators?: any[];
            tags?: any[];
            attachments?: any[];
            url?: string;
        } = {
            props: [],
        };
        rt.props = itemInfo.value.props.filter((item: any) => {
            if (item.fieldName == 'abstractNote') {
                // 单独显示
                rt.abstractNote = item.value;
                return false;
            }
            if (item.fieldName == 'title') {
                // 单独显示
                return false;
            }
            if (item.fieldName == 'url') {
                // 单独显示
                rt.url = item.value;
                return false;
            }
            if (item.fieldName == 'title') {
                // 单独显示
                return false;
            }
            return true;
        });
        rt.props.map((value) => {
            if (
                value.fieldName == 'accessDate' ||
                value.fieldName == 'date' ||
                value.fieldName == 'dateEnacted' ||
                value.fieldName == 'filingDate'
            ) {
                if (value.value[10] == 'T' && value.value[value.value.length - 1] == 'Z') {
                    // UTC时间
                    value.value = new Date(value.value).toLocaleString();
                }
            }
            return value;
        });
        if (itemInfo.value.creators)
            rt.creators = JSON.parse(JSON.stringify(itemInfo.value.creators)).sort((a: any, b: any) => {
                return a.orderIndex - b.orderIndex;
            });
        if (itemInfo.value.tags) rt.tags = itemInfo.value.tags;
        if (itemInfo.value.attachments) rt.attachments = itemInfo.value.attachments;
        return rt;
    },
    set: (val) => {
        return;
    },
});
let currentid = -1;
onUpdated(() => {
    updateInfoView();
});
function updateInfoView(force = false) {
    if (!force && itemId.value == -1) return;
    if (!force && itemId.value == currentid) return;
    getItemInfo(itemId.value).then((res) => {
        itemInfo.value = res;
    });
    currentid = itemId.value;
}
function closeInfoPanel() {
    console.log('closePanel');
    emit('closePanel');
    itemId.value = -1;
    currentid = -1;
}
const activeName = ref('info');
const infoH = computed({
    // 自适应详情高度
    get: () => {
        let len = 'height:calc(100% - 29px - 10px - 20px - 39px ';
        for (const i in displayInfo.value.attachments) {
            len += '- 46px ';
        }
        return len + ')';
    },
    set: (val) => {
        return;
    },
});
const handleClick = (tab: any, event: Event) => {
    console.log(tab, event);
};
function editInfo() {
    SaltDogMessageChannelRenderer.getInstance().execCommand('saltdog.showImportEdit', itemInfo.value.itemID);
}
function handleAttachmentClick(attachment: any) {
    console.log(attachment);
    if (attachment.contentType == 'text/html') {
        openExternal(attachment.url);
    } else if (attachment.contentType == 'application/pdf') {
        if (attachment.path) {
            reader.getInstance().addReader(itemInfo.value.title, attachment.path, JSON.parse(JSON.stringify(itemInfo)));
            // openExternal(attachment.path);
        } else if (attachment.url) {
            openExternal(attachment.url);
        }
    }
}
function addAttachment() {
    SaltDogMessageChannelRenderer.getInstance().execCommand('saltdog.addAttachment', itemInfo.value.itemID);
}
let contextMenuActiveItem: any = {};
const contextMenuVisible = ref(false);
const contextMenuLeft = ref(0);
const contextMenuTop = ref(0);
const contextMenuRef = ref<any>(null);
// TODO: 不知道为啥这个东西只能分开做ref 用torefs和reactive都没办法在context渲染之前计算完状态，导致context菜单全部展示。
const itemIsLocal = ref(false);
const itemHasUrl = ref(false);
function showContextmenu(pointer: any) {
    if (!pointer) return;
    const item = pointer.path.filter((ele: any) => ele.classList && ele.classList.contains('attacment_item'))[0];
    const data = JSON.parse(item.getAttribute('data-attachmentInfo'));
    contextMenuActiveItem = data;
    contextMenuTop.value = pointer.pageY;
    contextMenuLeft.value = pointer.pageX;
    itemIsLocal.value = contextMenuActiveItem.path != null;
    itemHasUrl.value = contextMenuActiveItem.url != null;
    contextMenuVisible.value = true; //显示菜单

    // if (contextMenuActiveItem.path != null) {
    //     console.error('true');
    //     contextMenuActiveRef.isLocal.value = true;
    // } else {
    //     contextMenuActiveRef.isLocal.value = false;
    // }
    setTimeout(() => {
        const { width, height } = contextMenuRef.value.getBoundingClientRect();
        if (pointer.pageY + height > window.innerHeight - 40) {
            contextMenuTop.value = pointer.pageY - height;
        }
        if (pointer.pageX + width > window.innerWidth - 40) {
            contextMenuLeft.value = pointer.pageX - width;
        }
    }, 0);
    // console.log(contextMenuActiveItem);
}
function handleAttachEdit(type: 'delete' | 'openPath' | 'openURL') {
    console.log('atta Edit', contextMenuActiveItem);
    switch (type) {
        case 'delete':
            ElMessageBox.confirm(`确定要删除${contextMenuActiveItem.name}吗？`, '删除', {
                confirmButtonText: '删除',
                cancelButtonText: '再想想',
                type: 'warning',
            }).then(() => {
                if (contextMenuActiveItem.attachmentID) deleteAttachment(contextMenuActiveItem.attachmentID);
            });
            break;
        case 'openPath':
            if (contextMenuActiveItem.path && existsSync(contextMenuActiveItem.path)) {
                SaltDogMessageChannelRenderer.getInstance().execCommand(
                    'saltdog.showItemInFolder',
                    contextMenuActiveItem.path,
                    false
                );
            } else {
                SaltDogMessageChannelRenderer.getInstance().execCommand(
                    'saltdog.showMessage',
                    'error',
                    '打开失败, 目标文件已经移动或删除'
                );
            }
            break;
        case 'openURL':
            if (!contextMenuActiveItem.url) break;
            SaltDogMessageChannelRenderer.getInstance().execCommand('saltdog.openExternal', contextMenuActiveItem.url);
            break;
    }
    updateInfoView(true);
}
SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.refreshInfoPanel', () => {
    updateInfoView(true);
});
</script>
<style lang="stylus">
.infoTag {
    margin-right: 5px;
    margin-bottom: 5px;
}
.itemInfoList_content {
    user-select: text;
    display: inline-block;
    max-width: calc(100% - 90px);
    line-height: 24px;
    color: #303133 !important;
    word-wrap: break-word;
}
.itemInfoList_content .el-collapse {
    border: none;
}
.itemInfoList_label {
    height: 100% !important;
    color: #5f6368 !important;
    width: 80px;
    display: inline-block;
    margin-right: 0px !important;
}
.itemInfoListContainer .el-descriptions__cell {
    display: flex;
}
.itemInfoListTabs .el-tabs__content {
    height: 100% !important;
}
.itemInfoListTabs {
    height: 100%;
}
.itemInfoListTabs .el-tab-pane {
    height: 100%;
}
.itemInfoListContainer {
    margin: 10px;
    overflow: scroll;
}
.itemInfoList_content {
    border: none;
    word-wrap: break-all;
}
.itemInfoHead_title {
    user-select: text;
    padding-right 20px
    font-size: 20px;
    font-variant-ligatures: no-contextual;
    font-weight: 400;
    color: #202124;
    display: -webkit-box;
    line-height: 24px;
    overflow: hidden;
    word-wrap: break-word;
    height: 72px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    hyphens: auto;
}
.itemInfoHead {
    padding: 20px 0px;
    margin: 10px;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
}
.itemInfoList_content .el-collapse-item__header {
    border: none;
    height: 24px;
    line-height: 24px;
    font-size: inherit;
}
.attachment_group {
    margin: 10px 0px 20px 0px;
}
.attachment_group .attacment_title {
    display: inline-block;
    margin-left: 10px;
}
.attachment_group .attacment_item {
    border: 2px solid;
    cursor: pointer;
    border-color: rgba(64, 158, 255, 0.1);
    padding: 10px 16px;
    line-height: 1.5;
    font-size: 0.9rem;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
}
.attachment_group .attacment_item:hover {
    /* background-color: rgba(64, 158, 255, 0.1); */
    /* animation: hoverAnim 0.3s; */
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
}
.attachment_group .attachment_downloading:hover{
    color: #409eff;
    background: rgba(64, 64, 64, 0.1);
}
.itemTags-group {
    margin: 10px;
}
.itemTags-group .el-tag__content {
    display: inline-block;
    hyphens: auto;
    word-wrap: break-word;
}
.itemTags-group .el-tag {
    margin-right: 5px;
    margin-bottom: px;
}

/* 滚动条 */
*::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

*::-webkit-scrollbar-thumb {
    background: #aaaaaa;
    border-radius: 4px;
    cursor: pointer;
}

*::-webkit-scrollbar-thumb:hover {
    opacity: 1;
    display: block !important;
}

*::-webkit-scrollbar-track {
    background-color: transparent;
}
.hideScroll::-webkit-scrollbar-thumb {
    display: none;
}
.showScroll::-webkit-scrollbar-thumb {
    display: block;
}
html {
    overflow-y: overlay;
}
</style>
