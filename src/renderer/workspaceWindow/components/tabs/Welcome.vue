<template>
    <div class="welcome-layout">
        <el-container style="height: 100%">
            <el-header class="welcome-header">
                <div style="font-size: 2em">欢迎使用SaltDog</div>
                <p style="color: #aeaeae">为快乐磕盐而生</p>
            </el-header>
            <el-main class="welcome-main">
                <div>
                    <div class="welcomeMain__open">
                        <span>最近打开</span>
                        <el-button size="mini" type="primary" round @click="openDocument">
                            <el-icon style="display: inline-block; margin-right: 5px"><plus /></el-icon>
                            打开文档
                        </el-button>
                    </div>
                    <el-table @row-dblclick="handleHistoryClick" :data="tableData" style="width: 100%">
                        <el-table-column prop="title" label="标题" />
                        <!-- <el-table-column prop="info" label="信息" width="180" /> -->
                        <el-table-column prop="date" label="打开日期" width="180" />
                    </el-table>
                </div>
                <div>
                    <div class="welcomeMain__focus">
                        <span class="welcomeMain__focusTitle">领域热门</span>
                        <span class="welcomeMain__focusSubtitle">Computer Science</span>
                    </div>
                    <div class="focus_error">
                        查找数据失败了TAT
                        <br />
                        完善领域设置或添加RSS/Google Alerts来接受领域最新进展吧
                    </div>
                </div>
            </el-main>
            <el-footer class="welcome-footer">CopyRight 2022 SaltDog Project</el-footer>
        </el-container>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUpdate, onUpdated, getCurrentInstance, onActivated } from 'vue';
import { ipcRenderer } from 'electron';
import tabManager from '../../controller/tabManager';
import path from 'path';
import { Plus } from '@element-plus/icons-vue';
import { getItemInfo, getReadHistory } from '../../controller/library';
import ReaderManager from '../../controller/reader';
const TAG = '[Renderer/Welcome]';
export default defineComponent({
    components: { Plus },
    setup() {
        onMounted(() => {
            getReadHistory().then((res) => {
                const history = [];
                for (const his of res) {
                    history.push({
                        date: his.operationDate,
                        title: his.title,
                        path: his.filePath,
                        itemID: his.itemID,
                    });
                }
                tableData.value = history;
            });
        });
        const tableData = ref<any>([]);
        function openDocument() {
            tabManager.pickAndOpenPDF();
        }
        function handleHistoryClick(e: any) {
            console.log(e);
            if (e.itemID) {
                getItemInfo(e.itemID).then((info) => {
                    ReaderManager.getInstance().addReader(e.title, e.path, info);
                });
            } else {
                ReaderManager.getInstance().addReader(e.title, e.path, null);
            }
        }
        return { tableData, openDocument, handleHistoryClick };
    },
});
</script>
<style lang="stylus">

.welcome-layout
    background-color #ffffff
    color:#303133;
    height:100%
    .welcome-header
        margin 60px 40px 40px 40px
    .welcome-main
        margin 40px
        .welcomeMain__open
            &>span
                display:inline-block
                font-size:1.5em
                margin-right:20px
        .welcomeMain__focus
            margin-top:40px
            &>.welcomeMain__focusTitle
                font-size 1.5em
                margin-right 20px
                display inline-block
            &>.welcomeMain__focusSubtitle
                font-size 1em
                color:#A8ABB2
        .focus_error
            font-size 0.8em
            color:#A8ABB2
            width:100%
            line-height: 2em
            margin:20px

    .welcome-footer
        margin auto
        font-size 0.8em
        height 40px
        color:#A8ABB2
</style>
