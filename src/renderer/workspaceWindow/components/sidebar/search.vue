<template>
    <div v-if="canSearch">
        <div style="margin: 10px 5px 5px 5px">
            <el-input v-model="searchText" size="small" placeholder="搜索内容" clearable @input="handleSearchinput" />
        </div>

        <div style="font-size: 13px; margin: 0px 5px 5px 8px; font-weight: 700">共找到{{ totalNumber }}个结果</div>

        <div>
            <el-tree
                class="SearchTree"
                :data="resultList"
                node-key="page"
                default-expand-all
                :indent="10"
                @node-click="handleResultClick"
            >
                <template #default="{ data }">
                    <div v-html="data.digestHtml"></div>
                </template>
            </el-tree>
        </div>
    </div>
    <div v-else>此页面暂不支持进行查找</div>
</template>
<script lang="ts">
import {
    defineComponent,
    DefineComponent,
    getCurrentInstance,
    onActivated,
    onDeactivated,
    onMounted,
    onUpdated,
    ref,
} from 'vue';
import mainTabManager from '../../controller/tabManager';
import bus from '../../controller/systemBus';
import { debounce } from 'licia';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
const TAG = '[Sidebar/Search]';
interface ResultDigest {
    digestHtml: string;
    pageIndex?: number;
    matchIndex?: number;
    children?: ResultDigest[];
}

export default defineComponent({
    setup() {
        const searchText = ref('');
        const totalNumber = ref(0);
        const canSearch = ref(false);
        const resultList = ref<ResultDigest[]>([]);
        const listenedEvents = {};
        const prevId = '';
        let currentPendingSearchId = 1;
        function sendCommand() {
            resultList.value = [];
            totalNumber.value = 0;
            const currentTab = mainTabManager.getCurrentTab();
            currentPendingSearchId++;
            mainTabManager.whenPdfTabReady(currentTab, () => {
                const handler = mainTabManager.getMessageHandler(currentTab);
                if (!handler) {
                    console.error(TAG, 'Get tab messageHandler failed');
                    return;
                }
                handler.invokeWebview('requestSearch', {
                    sdpdfcoreRequestId: currentPendingSearchId,
                    type: '',
                    query: searchText.value,
                    phraseSearch: true,
                    caseSensitive: false,
                    entireWord: false,
                    highlightAll: false,
                    findPrevious: false,
                    matchDiacritics: false,
                });
            });
        }
        const handleSearchinput = debounce(sendCommand, 300);
        function appendDigest(digest: any) {
            const { pageIndex, matchesDigests, matches } = digest;
            const listDigests: ResultDigest[] = [];
            // for(const d of matchesDigests){
            //     listDigests.push(d);
            // }
            // 过期的搜索请求，忽略
            if (digest.requestId != currentPendingSearchId) return;
            resultList.value.push({
                digestHtml: `<span>第${pageIndex + 1}页</span>`,
                children: matchesDigests,
            });
            // console.log('lgydev', resultList.value);
        }
        function updateFindCount(cnt: any) {
            const { current, total } = cnt;
            totalNumber.value = total;
        }
        function searchBarActivated() {
            console.log(TAG, 'Activated');
            const currentId = mainTabManager.getCurrentTab();

            const currentTabInfo = mainTabManager.getTabInfo(currentId);
            if (currentTabInfo && currentTabInfo.isPdf) {
                if (currentId != prevId) {
                    // 记录上一个打开时的pdfid，后面不一样的话就要重新刷新搜索列表
                    searchText.value = '';
                    resultList.value = [];
                    totalNumber.value = 0;
                }
                canSearch.value = true;
                const listenerName = `PDFVIEW_${currentId}:find_digests`;
                listenedEvents[listenerName] = listenerName;
                bus.on(listenerName, (digest) => {
                    console.warn('digest', digest);
                    appendDigest(digest);
                });
                const countListener = `PDFVIEW_${currentId}:find_matchCount`;
                listenedEvents[countListener] = countListener;
                bus.on(countListener, (cnt) => {
                    updateFindCount(cnt);
                });
            }
        }
        function searchBarDeactivated() {
            console.log(TAG, 'Deactivated');
            for (const i of Object.keys(listenedEvents)) {
                bus.off(i);
            }
        }
        function handleResultClick(node: ResultDigest) {
            console.log(node);
            if (typeof node.pageIndex !== 'number' || typeof node.pageIndex !== 'number') return;
            console.log('go');
            const currentTab = mainTabManager.getCurrentTab();
            mainTabManager.whenPdfTabReady(currentTab, () => {
                const handler = mainTabManager.getMessageHandler(currentTab);
                if (!handler) {
                    console.error(TAG, 'Get tab messageHandler failed');
                    return;
                }
                handler.invokeWebview('jumpToSearch', {
                    matchIndex: node.matchIndex,
                    pageIndex: node.pageIndex,
                });
            });
        }
        onMounted(searchBarActivated);
        onActivated(searchBarActivated);
        onDeactivated(searchBarDeactivated);
        SaltDogMessageChannelRenderer.getInstance().on('sidebar.onChange', (obj) => {
            if (obj.to.viewName == 'saltdog.search') searchBarActivated();
        });
        bus.on('onTabsChange', searchBarActivated);
        return {
            searchText,
            canSearch,
            totalNumber,
            resultList,
            handleSearchinput,
            handleResultClick,
        };
    },
});
</script>
<style lang="stylus">
.SearchTree
    background: var(--saltdog-sidebar-background-color)!important;
    border-radius:5px;
    color: var(--el-tree-font-color)!important;
    --el-tree-font-color:var(--saltdog-sidebar-title-font-color)!important;
    --el-tree-node-hover-background-color: #f5f7fa!important;
    --el-tree-expand-icon-color: var(--saltdog-sidebar-title-font-color)!important;
    .el-tree-node__content
        height:auto!important
        padding-top:2px!important
        padding-bottom:2px!important
        font-size: 12px;
        &>div
            font-size:13px;
            white-space:initial!important
        .__searchHighLight
            background-color: var(--el-color-primary-light-9);
            border-color: var(--el-tag-border-color);
            color: var(--el-color-primary);
            display: inline-flex;
            justify-content: center;
            align-items: center;
            padding: 0px 9px;
            line-height: 1;
            border-width: 1px;
            border-style: solid;
            border-radius: var(--el-tag-border-radius);
            box-sizing: border-box;
            white-space: nowrap;
</style>
