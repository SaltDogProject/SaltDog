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
                <div style="font-size: 20px">附件</div>
                <div class="attachment_group">
                    <div
                        @click="handleAttachmentClick(a)"
                        :key="a.attachmentID"
                        v-for="a in displayInfo.attachments"
                        :class="{ attacment_item: true, attachment_downloading: a.syncState == -1 }"
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
    </div>
</template>

<script setup lang="ts">
import i18N from '../../../utils/i18n';
import { openExternal } from '../../../utils/external';
import { getMIMEImage, getItemTypeImage } from './utils';
import { computed, onMounted, ref, defineProps, defineEmits, toRefs, onUpdated } from 'vue';
import { Close } from '@element-plus/icons-vue';
import reader from '../../../controller/reader';
import SaltDogMessageChannelRenderer from '../../../controller/messageChannel';
const TAG = '[Renderer/Library/Info]';
const p = defineProps<{
    itemInfo: any;
}>();
const emit = defineEmits<{
    (e: 'closePanel'): void;
}>();
function geti18N(str: string) {
    return i18N['zh-CN']['fields'][str] || i18N['zh-CN']['itemTypes'][str];
}

const { itemInfo } = toRefs(p);
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
onUpdated(() => {
    console.log(TAG, itemInfo.value);
});

function closeInfoPanel() {
    console.log('closePanel');
    emit('closePanel');
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
            reader.getInstance().addReader(itemInfo.value.title, attachment.path, itemInfo);
            // openExternal(attachment.path);
        } else if (attachment.url) {
            openExternal(attachment.url);
        }
    }
}
</script>
<style lang="stylus">
.infoTag {
    margin-right: 5px;
    margin-bottom: 5px;
}
.itemInfoList_content {
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
