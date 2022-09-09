<template>
    <el-dialog :before-close="closeSelf" top="5vh" v-model="_show" title="添加条目附件">
        <el-form style="margin-left: 20px" :model="form" label-position="left" label-width="120px">
            <el-form-item label="条目名称">
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    content="若要更改条目名称，请点击详情右侧的编辑按钮"
                    placement="top"
                >
                    {{ itemName }}
                </el-tooltip>
            </el-form-item>
            <el-form-item label="附件名称">
                <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="附件位置">
                <el-radio-group v-model="form.attachmentType">
                    <el-radio label="online">网络文件</el-radio>
                    <el-radio label="local">本地文件</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.attachmentType == 'online'" label="URL">
                <el-input v-model="form.url" />
            </el-form-item>
            <el-form-item v-if="form.attachmentType == 'local'" label="文件">
                <el-upload
                    class="upload-demo"
                    drag
                    :on-change="uploadChange"
                    :limit="1"
                    :auto-upload="false"
                    style="min-width: 200px"
                >
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        拖拽文件至此或
                        <em>点此上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">仅支持一个文件</div>
                    </template>
                </el-upload>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="closeSelf">取消</el-button>
                <el-button type="primary" @click="submit">添加</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
import { addAttachment, getItemInfo } from '@/workspaceWindow/controller/library';
const TAG = '[Renderer/Dialog/ImportAttachment]';
const _show = ref(false);
const itemName = ref('获取条目名称失败');
let _itemInfo = {};
let _itemid = -1;
const form = reactive({
    title: '',
    attachmentType: '',
    url: '',
});
function closeSelf() {
    form.title = '';
    form.attachmentType = '';
    form.url = '';
    _itemid = -1;
    _show.value = false;
    console.log('closed.');
}
const uploadChange = (f: any, fs: any) => {
    form.url = fs[0].raw.path;
};
function submit() {
    console.log(TAG, form);
    addAttachment(_itemid, JSON.parse(JSON.stringify(form)));
    closeSelf();
}
function initAttacmentDialog(id: number) {
    getItemInfo(id).then((res: any) => {
        _itemInfo = res;
        _itemid = id;
        itemName.value = res.title;
        console.log(res);
    });
}
SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.addAttachment', (itemID: number) => {
    initAttacmentDialog(itemID);
    _show.value = true;
});
</script>
<style lang="stylus" scoped>
.dialog-footer button:first-child {
    margin-right: 10px;
}
</style>
