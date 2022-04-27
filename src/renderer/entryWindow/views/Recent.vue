<template>
    <div>
        <h2 style="color: #eee; padding-left: 40px; padding-right: 20px; display: inline-block">最近打开</h2>
        <el-button size="mini" class="openNew" type="primary" round @click="openDocument">
            <el-icon class="el-icon--left"><Plus /></el-icon>
            打开文档
        </el-button>
        <el-table max-height="300px" class="recentTable" :fit="false" :data="tableData" style="width: 100%">
            <el-table-column show-overflow-tooltip prop="name" label="名称" width="400">
                <template #default="scope">
                    <i class="el-icon-document"></i>
                    <span style="margin-left: 10px">{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="date" label="打开时间" width="180" />
        </el-table>
    </div>
</template>
<script lang="ts">
import { ipcRenderer } from 'electron';
import { defineComponent, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
export default defineComponent({
    components: { Plus },
    setup() {
        const tableData = ref([
            {
                date: '2021-10-22',
                name: 'The cerebellum and cognition',
            },
            {
                date: '2021-10-22',
                name: 'Cell-to-cell Communication by Extracellular Vesicles: Focus on Microglia',
            },
            {
                date: '2021-10-21',
                name: 'Demystifying Microglia: And Now the Work Begins',
            },
        ]);
        function openDocument() {
            ipcRenderer.send('openFileDialog', {});
            ipcRenderer.once('openFileDialogReply', (e, arg) => {
                if (!arg.canceled && arg.filePaths.length != 0) {
                    ipcRenderer.send('openWorkspace', {
                        pdfPath: arg.filePaths[0],
                    });
                }
            });
        }
        return {
            openDocument,
            tableData,
        };
    },
});
</script>
<style lang="stylus">
.openNew
    display: inline-block
.recentTable
    padding 0px 0px 20px 30px
    --el-table-row-hover-background-color #444444!important
    --el-table-border-color #00000000!important
    --el-table-header-background-color #00000000!important
    --el-table-background-color #00000000!important
    --el-table-tr-background-color #00000000!important
    --el-table-font-color #eee!important
    --el-table-header-font-color #eee!important
    th.el-table__cell
        font-size:15px
    td.el-table__cell
        font-size:13px
    // background-color #00000000!important
    // &::before
    //     height:0px;
    // tr
    //     background-color:#00000000!important
    // th
    //     background-color:#00000000!important
    //     border-bottom: #00000000!important
    // td
    //     border-bottom: #00000000!important
</style>
