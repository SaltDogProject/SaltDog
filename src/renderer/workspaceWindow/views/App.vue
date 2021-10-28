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
                <div class="sideBarIcons"></div>
                <div class="sideBar"></div>
                <div class="functionalZone">
                    <div class="mainPanel onePanel">
                        <div class="primaryPanel">
                            <pdf-tabs></pdf-tabs>
                        </div>
                        <div class="secondaryPanel hidden"></div>
                    </div>
                    <div class="bottomPanel"></div>
                </div>
            </div>

            <div class="bottomBar"></div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, getCurrentInstance, ComponentInternalInstance } from 'vue';
import pkg from 'root/package.json';
import PdfTabs from '../components/pdfTabs/Main.vue';
declare var __static: string;

const App = defineComponent({
    components: { PdfTabs },
    setup() {
        const documentName = ref('Test Document.pdf');
        const os = ref(process.platform);
        const version = ref('');
        version.value = process.env.NOCE_ENV === 'production' ? pkg.version : 'Dev';
        function refreshWindow() {
            location.reload();
        }
        return {
            documentName,
            os,
            version,
            refreshWindow,
        };
    },
});
export default App;
</script>

<style lang="stylus">
title_bar_height = 30px
bottom_bar_height = 0px//20px
side_bar_icons_width = 0px//40px
side_bar_width = 0px//180px
bottom_panel_height = 0px//200px
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
            .sideBarIcons
                order -1
                width side_bar_icons_width
                background-color: #ff0
            .sideBar
                order 1
                width: side_bar_width
                background-color: #0ff
            .functionalZone
                order 2
                width: 'calc(100% - %s)' % (side_bar_icons_width + side_bar_width)
                //background-color: #f0f
                display: flex
                flex-flow: column nowrap
                align-items: stretch
                .mainPanel
                    order -1
                    height 'calc(100% - %s)' % bottom_panel_height
                    //background-color: #666
                    display: flex
                    flex-flow :row nowrap
                    align-items: stretch
                    &.onePanel
                        .primaryPanel
                            width: 100%
                    .primaryPanel
                            order -1
                            width: 50%
                            //background-color: #444
                    .secondaryPanel
                        order 1
                        width:50%
                        background-color: #555
                .bottomPanel
                    order 1
                    height bottom_panel_height
                    background-color: #888
        .bottomBar
            order 100
            height bottom_bar_height
            width 100vw
            background-color: #0f0
        //     .mainPanel
        //         .primaryPanel
        //         .secondaryPanel
        //     .bottomPanel
        // .bottomBar
</style>
