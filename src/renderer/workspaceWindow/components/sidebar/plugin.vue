<template>
    <div class="searchInput">
        <el-input v-model="input" size="small" placeholder="搜索插件" />
    </div>
    <div class="searchLoading"></div>
    <div v-loading="loading" element-loading-background="rgba(122, 122, 122, 0.1)" class="searchResultContainer">
        <div @click="showMoreInfo(data)" v-for="(data, index) in searchData" :key="index" class="searchResultItem">
            <div class="searchTitle">{{ data.package.name && data.package.name.replace('saltdogplugin_', '') }}</div>
            <div class="searchDesc">
                {{ data.package.description || '暂无介绍' }}
            </div>
            <div class="searchAuther">
                {{ data.package.author.name }}
            </div>
        </div>
    </div>

    <el-dialog v-model="dialogVisible" custom-class="plugindialog" :title="'插件信息'" width="80%">
        <div style="margin-top: -20px">
            <span style="font-size: 25px; display: inline-block; padding-right: 10px">
                {{ currentPluginData.name.replace('saltdogplugin_', '') }}
            </span>
            <span style="font-size:15px color:gray">v{{ currentPluginData.version }}</span>
            <div style="font-size:15px color:gray">{{ currentPluginData.description || '无描述' }}</div>
        </div>
        <div>
            <div style="font-weight: 700; margin-top: 15px; font-size: 16px">详细信息</div>
            <div style="font-size: 12px">
                <span>发布日期：</span>
                <span>{{ new Date(currentPluginData.date).toLocaleString() }}</span>
            </div>
            <div style="font-size: 12px">
                <span>发布者：</span>
                <span>{{ `${currentPluginData.publisher.username} (${currentPluginData.publisher.email})` }}</span>
            </div>
            <div class="links" style="font-size: 12px">
                <span>链接：</span>
                <a v-if="currentPluginData.links.npm" :href="currentPluginData.links.npm">NPM</a>
                <a v-if="currentPluginData.links.homepage" :href="currentPluginData.links.homepage">项目主页</a>
                <a v-if="currentPluginData.links.bugs" :href="currentPluginData.links.bugs">BUG上报</a>
                <a v-if="currentPluginData.links.repository" :href="currentPluginData.links.repository">仓库地址</a>
            </div>
        </div>
        <div style="font-weight: 700; margin-top: 15px; font-size: 16px">详细介绍</div>
        <div class="readme" v-html="readmeHTML"></div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="dialogVisible = false">安装</el-button>
            </span>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import SaltDogMessageChannelRenderer from '@/workspaceWindow/controller/messageChannel';
const input = ref('');
const dialogVisible = ref(false);
const searchData = ref<any>([]);
const currentPluginData = ref<any>({});
const loading = ref(true);
const readmeHTML = ref('');
const _msgChannel = SaltDogMessageChannelRenderer.getInstance();
_msgChannel.invokeMain('plugin.search', '', (res) => {
    console.log(res);
    res.objects && (searchData.value = res.objects);
    loading.value = false;
});
function showMoreInfo(data: any) {
    currentPluginData.value = data.package;
    dialogVisible.value = true;
    //currentPluginData.value!.links!.npm
    _msgChannel.invokeMain('plugin.getReadme', currentPluginData.value!.links!.npm, (data) => {
        console.log('getReadme', data);
        readmeHTML.value = data;
    });
}
</script>
<style scoped lang="stylus">

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
            font-size:11px;
            font-weight 700
            color:var(--el-text-color-secondary)
            line-height 11px
            padding-bottom: 1px;
.readme
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
