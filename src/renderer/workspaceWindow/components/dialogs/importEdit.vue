<template>
    <div class="itemEditDialog">
        <el-dialog @close="dialogClosed" top="5vh" v-model="showImportEdit" title="编辑元数据">
            <el-form style="margin-left: 20px" :model="form" label-position="left" label-width="120px">
                <el-form-item label="文章类型">
                    <el-select @change="itemTypeSelectChange" v-model="form.itemType" class="m-2" placeholder="类型">
                        <el-option
                            v-for="item in itemTypeSelect"
                            :key="item.value"
                            :label="getI18N(I18NType.ITEMTYPES, item.value)"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item v-for="field in fields" :key="field" :label="getI18N(I18NType.FIELDS, field)">
                    <el-input v-model="form.data[field]" placeholder="" style="max-width: 80%" />
                </el-form-item>
                <div style="margin-top: 50px; width: 95%; display: flex; flex-direction: row; justify-content: end">
                    <el-button @click="cancelBtn">取消</el-button>
                    <el-button @click="confirmBtn" type="primary">确认导入</el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
import { readFileSync } from 'fs-extra';
import { reactive, ref, toRefs } from 'vue';
import * as path from 'path';
import i18n from '../../utils/i18n';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
import { getItemInfo, modifyItem } from '@/workspaceWindow/controller/library';
import log from 'electron-log';
import { ElMessage } from 'element-plus';
const TAG = '[Renderer/Dialog/ImportEdit]';
enum I18NType {
    ITEMTYPES = 'itemTypes',
    FIELDS = 'fields',
    CREATORTYPES = 'creatorTypes',
}
function getI18N(type: I18NType, id: string) {
    return i18n['zh-CN'][type][id] || '';
}

// eslint-disable-next-line no-undef
const _schemaJSON = JSON.parse(readFileSync(path.resolve(__static, 'libraryDB', './schema.json'), 'utf-8'));

const fields = ref([]);
const itemTypeSelect = [
    { value: 'conferencePaper' },
    { value: 'journalArticle' },
    { value: 'thesis' },
    { value: 'webpage' },
    { value: 'blogPost' },
    { value: 'book' },
    { value: 'bookSection' },
    { value: 'dictionaryEntry' },
    { value: 'document' },
    { value: 'encyclopediaArticle' },
    { value: 'forumPost' },
    { value: 'magazineArticle' },
    { value: 'newspaperArticle' },
    { value: 'note' },
    { value: 'patent' },
    { value: 'preprint' },
    { value: 'presentation' },
    { value: 'report' },
    { value: 'statute' },
];
// eslint-disable-next-line no-undef
function getFieldsByItemType(type: string) {
    return _schemaJSON.itemTypes.filter((t: any) => t.itemType === type)[0].fields.map((i: any) => i.field);
}
function itemTypeSelectChange(type: any) {
    console.log(type);
    fields.value = getFieldsByItemType(type);
    console.log(fields);
}
const form = reactive({
    itemType: '',
    data: {},
    // data: {
    //     // conferencePaper
    //     title: null,
    //     abstractNote,
    //     date,
    //     publicationTitle,
    //     conferenceName,
    //     place,
    //     publisher,
    //     volume,
    //     pages,
    //     series,
    //     language,
    //     DOI,
    //     ISBN,
    //     shortTitle,
    //     url,
    //     accessDate,
    //     archive,
    //     archiveLocation,
    //     libraryCatalog,
    //     callNumber,
    //     rights,
    //     extra,
    // },
});

const showImportEdit = ref(false);
let originalData: any = {};
function confirmBtn() {
    console.log(form);
    const diffData = diff();
    modifyItem(diffData)
        .then(() => {
            ElMessage({
                message: '修改成功😄',
                type: 'success',
            });
            dialogClosed();
        })
        .catch((e) => {
            ElMessage({
                message: '修改失败😭' + e,
                type: 'error',
            });
        });
}
function cancelBtn() {
    dialogClosed();
}
function placeDBData(data: any) {
    form.itemType = data.typeName;
    itemTypeSelectChange(data.typeName);
    for (const fname of data.props) {
        form.data[fname.fieldName] = fname.value;
    }
}
function dealModifyData(itemID: number) {
    getItemInfo(itemID).then((res: any) => {
        placeDBData(res);
        originalData = res;
    });
}
function diff() {
    const changeReport: any = {
        itemID: originalData.itemID,
        add: [],
        modify: [],
        delete: [],
    };
    const oriProps: any = {};
    const tmp: any = {};
    const newFields = getFieldsByItemType(form.itemType);
    for (let i of originalData.props) {
        oriProps[i.fieldName] = i.value;
    }
    if (originalData.typeName != form.itemType) {
        changeReport.modify.push({
            type: 'itemType',
            key: 'itemType',
            value: form.itemType,
        });

        for (let f of Object.keys(oriProps)) {
            if (newFields.indexOf(f) == -1) {
                changeReport.delete.push({
                    type: 'field',
                    key: f,
                });
            }
        }
    }
    for (let field of newFields) {
        if (typeof oriProps[field] == 'string') {
            if (oriProps[field].length == 0) {
                changeReport.delete.push({
                    type: 'field',
                    key: field,
                });
            } else {
                if (typeof form.data[field] == 'string' && form.data[field].length != 0) {
                    if (form.data[field] != oriProps[field]) {
                        changeReport.modify.push({
                            type: 'field',
                            key: field,
                            value: form.data[field],
                        });
                    }
                } else {
                    changeReport.delete.push({
                        type: 'field',
                        key: field,
                    });
                }
            }
        } else {
            if (typeof form.data[field] == 'string' && form.data[field].length != 0) {
                changeReport.add.push({
                    type: 'field',
                    key: field,
                    value: form.data[field],
                });
            }
        }
    }
    return changeReport;
}
function dialogClosed() {
    showImportEdit.value = false;
    originalData = {};
    form.itemType = '';
    form.data = {};
}
SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.showImportEdit', (id) => {
    dealModifyData(id);
    showImportEdit.value = true;
});
// SaltDogMessageChannelRenderer.getInstance().registerCommand('saltdog.closeImportEdit', () => {
//     showImportEdit.value = false;
// });
</script>
<style lang="stylus"></style>
