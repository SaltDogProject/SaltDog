<template>
    <div id="workspace">
        <div class="fake-title-bar" :class="{ darwin: os === 'darwin' }">
            <div class="fake-title-bar__title">{{ documentName }} - SaltDog - {{ version }}</div>
            <div class="handle-bar" v-if="os !== 'darwin'">
                <i v-if="version == 'Dev'" class="el-icon-refresh" @click="refreshWindow"></i>
                <i class="el-icon-minus" @click="minimizeWindow"></i>
                <i class="el-icon-close" @click="closeWindow"></i>
            </div>
        </div>
        <div class="workspaceContainer">
            <div class="mainContent">
                <div id="sideBarIcons" class="sideBarIcons">
                    <sidebar-icons></sidebar-icons>
                </div>
                <div id="panelAndSidebarContainer">
                    <div id="sideBar" class="sideBar">
                        <sidebar></sidebar>
                    </div>
                    <div id="resizer-sideBar2mainPanel" class="resizer"></div>
                    <div id="functionalZone" class="functionalZone">
                        <div id="mainPanel" class="mainPanel">
                            <!-- onePanel if only one-->
                            <div id="primaryPanel" class="primaryPanel">
                                <pdf-tabs></pdf-tabs>
                            </div>
                            <div id="resizer-primaryPanel2secondaryPanel" class="resizer"></div>
                            <div id="secondaryPanel" class="secondaryPanel">
                                <!-- <translator></translator> -->
                            </div>
                        </div>
                        <div id="resizer-mainPanel2BottomPanel" class="resizer"></div>
                        <div id="bottomPanel" class="bottomPanel"></div>
                    </div>
                </div>
            </div>

            <div class="bottomBar"></div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, getCurrentInstance, ComponentInternalInstance, onMounted } from 'vue';
import pkg from 'root/package.json';
import PdfTabs from '../components/pdfTabs/Main.vue';
import panelManager from '../controller/panelManager';
import pdfTabManager from '../components/pdfTabs/tabManager';
// @ts-ignore
import SidebarIcons from '../components/sideBarIcons.vue';
// @ts-ignore
import sidebar from '../components/sidebar/sideBar.vue';
import tabManager from '../components/pdfTabs/tabManager';
import { ipcRenderer } from 'electron';
declare var __static: string;

const App = defineComponent({
    components: { PdfTabs, SidebarIcons, sidebar },
    setup() {
        const documentName = ref('Test Document.pdf');
        const os = ref(process.platform);
        const version = ref('');
        const { proxy } = getCurrentInstance()!;
        version.value = process.env.NOCE_ENV === 'production' ? pkg.version : 'Dev';
        function refreshWindow() {
            location.reload();
        }
        function minimizeWindow() {
            // @ts-ignore
            ipcRenderer.send('minimize-window', proxy!.__sdConfig!.windowId);
        }
        function closeWindow() {
            // @ts-ignore
            ipcRenderer.send('close-window', proxy!.__sdConfig!.windowId);
        }
        onMounted(() => {
            panelManager.initResizeListener({
                sideBar2mainPanel: {
                    resizer: document.getElementById('resizer-sideBar2mainPanel') as HTMLDivElement,
                    outerContainer: document.getElementById('panelAndSidebarContainer') as HTMLDivElement,
                },
                mainPanel2BottomPanel: {
                    resizer: document.getElementById('resizer-mainPanel2BottomPanel') as HTMLDivElement,
                    outerContainer: document.getElementById('functionalZone') as HTMLDivElement,
                },
                primaryPanel2secondaryPanel: {
                    resizer: document.getElementById('resizer-primaryPanel2secondaryPanel') as HTMLDivElement,
                    outerContainer: document.getElementById('mainPanel') as HTMLDivElement,
                },
            });
            panelManager.init(
                {
                    sideBarIcon: {
                        htmlElement: document.getElementById('sideBarIcons') as HTMLDivElement,
                    },
                    sideBar: {
                        htmlElement: document.getElementById('sideBar') as HTMLDivElement,
                    },
                    functionalZone: {
                        htmlElement: document.getElementById('functionalZone') as HTMLDivElement,
                    },
                    mainPanel: {
                        htmlElement: document.getElementById('mainPanel') as HTMLDivElement,
                    },
                    primaryPanel: {
                        htmlElement: document.getElementById('primaryPanel') as HTMLDivElement,
                        controller: pdfTabManager,
                    },
                    secondaryPanel: {
                        htmlElement: document.getElementById('secondaryPanel') as HTMLDivElement,
                    },
                    bottomPanel: {
                        htmlElement: document.getElementById('bottomPanel') as HTMLDivElement,
                    },
                },
                {
                    // 初始状态：关闭所有panels 要打开后面再开，不然计算会乱
                    sideBar: false,
                    bottomPanel: false,
                    secondaryPanel: false,
                }
            );
            //panelManager.showSecondaryPanel();
            panelManager.showSideBar();
        });
        return {
            documentName,
            os,
            version,
            refreshWindow,
            minimizeWindow,
            closeWindow,
        };
    },
});
export default App;
</script>

<style lang="stylus">
title_bar_height = 30px
bottom_bar_height = 20px
side_bar_icons_width = 40px
side_bar_width = 180px
bottom_panel_height = 200px
resizer_width_or_height = 4px;
$darwinBg = transparentify(#172426, #000, 0.7)
.saltdog-fade
  &-enter,
  &-leave,
  &-leave-active
    opacity 0
  &-enter-active,
  &-leave-active
    transition all 100ms linear
.hidden
    display none
#workspace
    overflow: hidden
    .fake-title-bar
        -webkit-app-region: drag
        height title_bar_height
        width 100%
        text-align center
        color --el-text-color-primary
        background-color var(--saltdog-titlebar-background-color)
        font-size 12px
        line-height @height
        position fixed
        z-index 100
        &.darwin
            background transparent
            background-image linear-gradient(
                to right,
                transparent 0%,
                transparent 167px,
                $darwinBg 167px,
                $darwinBg 100%
            )
            .fake-title-bar__title
                padding-left 167px
        .handle-bar
            position absolute
            top 2px
            right 8px
            z-index 10000
            -webkit-app-region no-drag
            i
                cursor pointer
                font-size 16px
                margin-left 5px
            .el-icon-minus
                &:hover
                    color #409eff
            .el-icon-close
                &:hover
                    color #f15140
            .el-icon-circle-plus-outline
                &:hover
                    color #69c282
    .workspaceContainer
        width 100vw
        height 'calc(100vh - %s)' % title_bar_height
        //background-color #f00
        margin-top title_bar_height
        display: flex
        flex-flow column nowrap
        align-items: stretch
        .mainContent
            order -1
            height 'calc(100% - %s)' % bottom_bar_height
            //background-color: #00f
            display: flex
            flex-flow row nowrap
            align-items stretch
            #panelAndSidebarContainer
                display:flex
                width:'calc(100% - %s)' % side_bar_icons_width
                flex-flow: row nowrap
                align-items: stretch
            #resizer-sideBar2mainPanel
                order 2
                background-color var(--saltdog-sidebar-background-color)
                width resizer_width_or_height
                cursor: ew-resize
            #resizer-primaryPanel2secondaryPanel
                background-color var(--saltdog-panel-background-color)
                width resizer_width_or_height
                cursor: ew-resize
            #resizer-mainPanel2BottomPanel
                background-color var(--saltdog-panel-background-color)
                height resizer_width_or_height
                cursor: ns-resize
            .sideBarIcons
                order 0
                width side_bar_icons_width
                overflow:hidden
                background-color: var(--saltdog-sidebaricon-background-color)
            .sideBar
                order 1
                width: side_bar_width
                background-color: var(--saltdog-sidebar-background-color)
            .functionalZone
                order 3
                width: 100%
                //background-color: #f0f
                display: flex
                flex-flow: column nowrap
                align-items: stretch
                .mainPanel
                    order -1
                    height 100%
                    //background-color: #666
                    display: flex
                    flex-flow :row nowrap
                    align-items: stretch
                    &.onePanel
                        .primaryPanel
                            width: 100%
                    .primaryPanel
                            order -1
                            width: 100%
                            //background-color: #444
                    .secondaryPanel
                        order 1
                        // background-color: #555
                .bottomPanel
                    order 1
                    height bottom_panel_height
                    background-color: #888
        .bottomBar
            order 100
            height bottom_bar_height
            width 100vw
            background-color: var(--saltdog-bottombar-background-color)
        //     .mainPanel
        //         .primaryPanel
        //         .secondaryPanel
        //     .bottomPanel
        // .bottomBar
</style>
