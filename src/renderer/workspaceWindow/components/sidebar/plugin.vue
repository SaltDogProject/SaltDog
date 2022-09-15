<template>
    <div class="searchInput">
        <el-input @change="searchChange" v-model="input" size="small" placeholder="搜索插件" />
    </div>
    <div class="searchLoading"></div>
    <div v-loading="loading" element-loading-background="rgba(122, 122, 122, 0.1)" class="searchResultContainer">
        <div v-if="netErr" style="width: 100%; margin-top: 20px; text-align: center">网络错误，请检查网络连接。</div>
        <div
            v-if="!netErr && searchData.length == 0 && !firstSearch"
            style="width: 100%; margin-top: 20px; text-align: center"
        >
            滴滴，查无此插件
        </div>
        <div @click="showMoreInfo(data)" v-for="(data, index) in searchData" :key="index" class="searchResultItem">
            <div class="searchTitle">{{ data.package.name && data.package.name.replace('saltdogplugin_', '') }}</div>
            <div class="searchDesc">
                {{ data.package.description || '暂无介绍' }}
            </div>
            <div class="searchAuther">
                <span>{{ data.package.author.name }}</span>
                <span
                    :style="{
                        position: 'absolute',
                        right: '0px',
                        color: data.package.needUpdate ? '#409eff' : '#67C23A',
                    }"
                >
                    {{ data.package.needUpdate ? '可升级' : data.package.isInstalled ? '已安装' : '' }}
                </span>
            </div>
        </div>
    </div>

    <el-dialog v-model="dialogVisible" top="10vh" custom-class="plugindialog" :title="'插件信息'" width="80%">
        <div style="margin-top: -20px; padding: 25px">
            <span style="font-size: 25px; display: inline-block; padding-right: 10px">
                {{ currentPluginData.name.replace('saltdogplugin_', '') }}
            </span>
            <el-tag style="font-size: 15px">v{{ currentPluginData.version }}</el-tag>
            <div style="font-size:15px color:gray;margin-top:10px;">
                {{ currentPluginData.description || '无描述' }}
            </div>
        </div>
        <el-tabs :tab-position="'left'" style="height: 40vh" class="Infotabs">
            <el-tab-pane label="简介" style="overflow-y: scroll">
                <div v-loading="readmeLoading" class="readme" v-html="readmeHTML" style="min-height: 50px"></div>
            </el-tab-pane>
            <el-tab-pane label="更多">
                <div style="padding-left: 15px">
                    <div style="font-weight: 700; margin-top: 10px; font-size: 16px">详细信息</div>
                    <div>
                        <span>发布日期：</span>
                        <span>{{ new Date(currentPluginData.date).toLocaleString() }}</span>
                    </div>
                    <div>
                        <span>发布者：</span>
                        <span>
                            {{ `${currentPluginData.publisher.username} (${currentPluginData.publisher.email})` }}
                        </span>
                    </div>
                    <div class="links">
                        <span>链接：</span>
                        <a v-if="currentPluginData.links.npm" :href="currentPluginData.links.npm">NPM</a>
                        <a v-if="currentPluginData.links.homepage" :href="currentPluginData.links.homepage">项目主页</a>
                        <a v-if="currentPluginData.links.bugs" :href="currentPluginData.links.bugs">BUG上报</a>
                        <a v-if="currentPluginData.links.repository" :href="currentPluginData.links.repository">
                            仓库地址
                        </a>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button
                    v-if="currentPluginData.isInstalled"
                    :loading="uninstallLoading"
                    @click="uninstall(currentPluginData.name)"
                >
                    卸载
                </el-button>
                <el-button
                    v-if="currentPluginData.needUpdate"
                    type="primary"
                    :loading="updateLoading"
                    @click="update(currentPluginData.name)"
                >
                    更新
                </el-button>
                <el-button
                    v-if="!currentPluginData.isInstalled"
                    type="primary"
                    :loading="installLoading"
                    @click="install(currentPluginData.name)"
                >
                    安装
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import SaltDogMessageChannelRenderer from '@/workspaceWindow/controller/messageChannel';
import { Action, ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { ipcRenderer } from 'electron';
const input = ref('');
const firstSearch = ref(true);
const dialogVisible = ref(false);
const readmeLoading = ref(true);
const searchData = ref<any>([]);
const currentPluginData = ref<any>({});
const loading = ref(true);
const installLoading = ref(false);
const uninstallLoading = ref(false);
const updateLoading = ref(false);
const readmeHTML = ref('');
const netErr = ref(false);
const _msgChannel = SaltDogMessageChannelRenderer.getInstance();
_msgChannel.invokeMain('plugin.search', '', (res) => {
    if (!res) {
        netErr.value = true;
        searchData.value = [];
    } else {
        netErr.value = false;
        firstSearch.value = false;
        res.objects && (searchData.value = res.objects);
    }
    loading.value = false;
});
function searchChange(value: any) {
    firstSearch.value = false;
    loading.value = true;
    _msgChannel.invokeMain('plugin.search', value, (res) => {
        if (!res) {
            netErr.value = true;
            searchData.value = [];
        } else {
            netErr.value = false;
            res.objects && (searchData.value = res.objects);
        }

        loading.value = false;
    });
}
function showMoreInfo(data: any) {
    currentPluginData.value = data.package;
    dialogVisible.value = true;
    readmeLoading.value = true;
    _msgChannel.invokeMain('plugin.getReadme', currentPluginData.value!.links!.npm, (data) => {
        readmeHTML.value = data;
        readmeLoading.value = false;
    });
}
function uninstall(name: string) {
    uninstallLoading.value = true;
    ElMessageBox.alert(`您真的要卸载插件 ${name.replace('saltdogplugin_', '')} 吗？`, '卸载', {
        confirmButtonText: '确认卸载',
        callback: (action: Action) => {
            _msgChannel.invokeMain('plugin.uninstall', name, ({ error, status }) => {
                uninstallLoading.value = false;
                if (error)
                    ElNotification({
                        title: '卸载出错',
                        message: error,
                        type: 'error',
                    });
                else
                    ElNotification({
                        title: '成功',
                        message: '卸载成功，你可能需要重启SaltDog来应用更改。',
                        type: 'success',
                    });
                dialogVisible.value = false;
                restartSaltDog();
                searchChange(input.value);
            });
        },
    });
}

function install(name: string) {
    installLoading.value = true;
    _msgChannel.invokeMain('plugin.install', name, ({ error, status }) => {
        installLoading.value = false;
        if (error) {
            ElNotification({
                title: '安装出错',
                message: error,
                type: 'error',
            });
        } else {
            ElNotification({
                title: '成功',
                message: '安装成功，你可能需要重启SaltDog来让插件生效。',
                type: 'success',
            });
            restartSaltDog();
            searchChange(input.value);
            dialogVisible.value = false;
        }
    });
}

function update(name: string) {
    updateLoading.value = true;
    _msgChannel.invokeMain('plugin.update', name, ({ error, status }) => {
        updateLoading.value = false;
        if (error) {
            ElNotification({
                title: '更新出错',
                message: error,
                type: 'error',
            });
        } else {
            ElNotification({
                title: '成功',
                message: '更新成功，更新内容将在SaltDog重启后生效。',
                type: 'success',
            });
            restartSaltDog();
            searchChange(input.value);
            dialogVisible.value = false;
        }
    });
}
function restartSaltDog() {
    ipcRenderer.send('saltdog.restart');
}
</script>
<style scoped lang="stylus">
.Infotabs
    margin-top:30px;
    .el-tabs__content
        height 100%
        overflow scroll
.searchInput
    margin:10px 5px 5px 5px
.searchResultContainer
    min-height:50px;
    &>.searchResultItem
        padding:8px 0px
        &:hover
            background-color #C0C4CC66
        &>div
            font-variant-ligatures: no-contextual;
            margin:0px 10px
            display: -webkit-box;
            overflow: hidden;
            word-wrap: break-word;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            hyphens: auto;
        &>.searchTitle
            font-size 15px
            font-weight 700
            margin-bottom 5px
            color:var(--el-text-color-primary)

        &>.searchDesc
            font-size:12px;
            line-height 12px
            padding-bottom: 1px;
            margin-bottom 5px
        &>.searchAuther
            position:relative
            font-size:11px;
            font-weight 700
            color:var(--el-text-color-secondary)
            line-height 11px
            padding-bottom: 1px;
.readme
    padding-left:15px;
    max-height: 50vh
    word-wrap break-word
    overflow-y: scroll;
    overflow-x:hidden
.plugindialog
    a
        color: var(--el-color-primary);
        text-decoration: none;
        display inline-block;
        margin-right:5px
</style>
