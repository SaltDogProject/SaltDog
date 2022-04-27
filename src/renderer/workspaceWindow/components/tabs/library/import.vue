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
                <div class="libraryImportBtnGroup">
                    <el-button @click="closeSelf">取消</el-button>
                    <el-button type="primary">开始导入</el-button>
                </div>
            </el-tabs>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps, toRefs, defineEmits, onMounted, onUpdated } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';

const uploadRef = ref<any>();
const activeName = ref('doi');
const doiInput = ref('');
const urlInput = ref('');
const handleClick = (tab: any, event: Event) => {
    console.log(tab, event);
};
const p = defineProps<{
    showImportPanel: boolean;
}>();
const emit = defineEmits<{
    (e: 'update:showImportPanel', show: boolean): void;
}>();
const { showImportPanel } = toRefs(p);
const _show = ref(false);

// 由于elementui的限制只能先这样更新showImportPanel了。。
function closeSelf() {
    emit('update:showImportPanel', false);
}
onMounted(() => {
    _show.value = showImportPanel.value;
});
onUpdated(() => {
    _show.value = showImportPanel.value;
});
</script>
<style lang="stylus">
.libraryImportTypeTab
    width:100%;
.libraryImportDialog
    .el-dialog__body
        padding:0px 20px;
.libraryImportBtnGroup
    margin:30px 10px 20px 10px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
</style>
