<template>
    <div class="libraryImportDialog">
        <!-- 导入文献对话框 -->
        <el-dialog :before-close="closeSelf" v-model="_show" title="导入文献">
            <el-tabs :stretch="true" v-model="activeName" class="libraryImportTypeTab" @tab-click="handleClick">
                <el-tab-pane label="数字识别符" name="doi">
                    <el-tooltip class="box-item" effect="dark" placement="right">
                        <template #content>
                            <div style="line-height: 24px">
                                支持的数字文献识别符号包括
                                <br />
                                - DOI(如10.0123/abcd012)
                                <br />
                                - arXivID(如2201.12345v1)
                                <br />
                                - PubMed ID(如18460123)
                                <br />
                                - ISBN(如978712345678)
                            </div>
                        </template>
                        <span style="display: inline-block; margin: 10px 1px">
                            文献数字识别符
                            <el-icon><question-filled /></el-icon>
                        </span>
                    </el-tooltip>

                    <el-input v-model="doiInput" placeholder="DOI / arXivID / PMID / ISBN / ADS .." />
                </el-tab-pane>
                <el-tab-pane label="网址" name="url">
                    <el-tooltip class="box-item" effect="dark" placement="right">
                        <template #content>
                            <div style="line-height: 24px">学术出版商(或预印本)网页的地址</div>
                        </template>
                        <span style="display: inline-block; margin: 10px 1px">
                            网址
                            <el-icon><question-filled /></el-icon>
                        </span>
                    </el-tooltip>
                    <el-input v-model="urlInput" placeholder="http(s)://xxx" />
                </el-tab-pane>
                <el-tab-pane label="文件" name="file">
                    <el-tooltip class="box-item" effect="dark" placement="right">
                        <template #content>
                            <div style="line-height: 24px">目前仅支持PDF文件的元数据识别</div>
                        </template>
                        <span style="display: inline-block; margin: 10px 1px">
                            文件内容
                            <el-icon><question-filled /></el-icon>
                        </span>
                    </el-tooltip>
                </el-tab-pane>
                <div class="libPosition">
                    保存位置:
                    <el-cascader placeholder="选择..." v-model="posvalue" :props="posprops" @change="handlePosChange" />
                </div>
                <div class="libraryImportBtnGroup">
                    <el-button @click="closeSelf">取消</el-button>
                    <el-button type="primary" :loading="retriveLoading" @click="doRetrieveMetadata">开始导入</el-button>
                </div>
            </el-tabs>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps, toRefs, defineEmits, onMounted, onUpdated } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ipcRenderer } from 'electron';
import { uniqueId, values } from 'lodash';
import { insertItem, listDir, listLib, getDirInfoByID } from '../../controller/library';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
const TAG = '[Library/Import]';
const uploadRef = ref<any>();
const activeName = ref('doi');
const doiInput = ref('');
const urlInput = ref('');
const retriveLoading = ref(false);
const posvalue = ref('');
let id = 0;
const posprops = ref({
    lazy: true,
    lazyLoad(node: any, resolve: any) {
        const { level } = node;
        const nodes = [] as any;
        if (level == 0) {
            listLib().then((liblist) => {
                const queue = [];
                for (const i of liblist) {
                    queue.push(listDir(i.libraryID, i.rootDir));
                }
                Promise.all(queue).then((libdirs) => {
                    for (let j = 0; j < libdirs.length; j++) {
                        let hasChild = false;
                        if (libdirs[j].dirs.length != 0) hasChild = true;
                        nodes.push({
                            value: `${liblist[j].libraryID}-${liblist[j].rootDir}`,
                            label: liblist[j].libraryName,
                            leaf: !hasChild,
                        });
                    }
                    resolve(nodes);
                });
            });
        } else {
            const { value } = node;
            const [libID, dirID] = value.split('-');
            listDir(libID, dirID).then((libdirs) => {
                const queue = [];
                for (const i of libdirs.dirs) {
                    queue.push(listDir(libID, i.dirID));
                }
                Promise.all(queue).then((nxtdirs) => {
                    for (let j = 0; j < libdirs.dirs.length; j++) {
                        let hasChild = false;
                        if (nxtdirs[j].dirs.length != 0) hasChild = true;
                        nodes.push({
                            value: `${libID}-${libdirs.dirs[j].dirID}`,
                            label: libdirs.dirs[j].name,
                            leaf: !hasChild,
                        });
                    }
                    resolve(nodes);
                });
            });
        }
    },
});
const handlePosChange = (value: any) => {
    console.log(TAG, 'handlePosChange', value);
    posvalue.value = value[value.length - 1];
};
const handleClick = (tab: any, event: Event) => {
    console.log(tab, event);
};
const p = defineProps<{
    showImportPanel: boolean;
    currentDir: any;
    currentLib: any;
}>();

const { showImportPanel, currentDir, currentLib } = toRefs(p);
currentDir.value = currentDir.value || 1;
currentLib.value = currentLib.value || 1;
const _show = ref(false);

// 由于elementui的限制只能先这样更新showImportPanel了。。
function closeSelf() {
    const uploadRef = ref<any>();
    activeName.value = 'doi';
    doiInput.value = '';
    urlInput.value = '';
    retriveLoading.value = false;
    posvalue.value = '';
    SaltDogMessageChannelRenderer.getInstance().execCommand('saltdog.closeImportPanel');
}
onMounted(() => {
    _show.value = showImportPanel.value;
});
onUpdated(() => {
    _show.value = showImportPanel.value;
});
function doRetrieveMetadata() {
    if (posvalue.value.split('-').length == 0) {
        ElMessage.error(`请先选择存储路径`);
        return;
    }
    const [libID, dirID] = posvalue.value.split('-');
    const type = activeName.value;
    let reqType = null;
    let inputData = null;
    const reqId = uniqueId();
    switch (type) {
        case 'doi':
            reqType = 'search';
            inputData = doiInput.value;
            break;
        case 'url':
            reqType = 'web';
            inputData = urlInput.value;
            break;
    }
    if (!reqType || !inputData || inputData == '') {
        ElMessage.error('输入不能为空哦！');
        return;
    }
    retriveLoading.value = true;
    ipcRenderer.send('retriveMetadata', reqId, reqType, inputData);
    ipcRenderer.once(`retriveMetadataReply_${reqId}`, (event, err, data) => {
        retriveLoading.value = false;
        if (err) {
            console.error(err);
            ElMessage.error(`获取出错：${err}`);
            return;
        }
        doiInput.value = urlInput.value = '';
        const targetLibID = libID || currentLib.value.libraryID;
        const targetDirID = dirID || currentDir.value;
        console.log(TAG, 'Import', data, 'Library:', targetLibID, 'DirID:', targetDirID);
        insertItem(data[0], targetLibID, targetDirID)
            .then(() => {
                ElMessage.success(`添加成功`);
                SaltDogMessageChannelRenderer.getInstance().emit('saltdog.refreshLibrary', targetLibID, targetDirID);
            })
            .catch((e) => {
                ElMessage.error(`导入出错，${e}`);
                console.error(e);
                return;
            });
        closeSelf();
    });
}
</script>
<style lang="stylus" scoped>
.libraryImportTypeTab
    width:100%;
.libraryImportDialog
    .el-dialog__body
        padding:0px 20px;
.libPosition
    margin-top:25px;
.libraryImportBtnGroup
    margin:10px 10px 10px 10px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
</style>
