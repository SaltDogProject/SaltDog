<template>
    <div class="sideBarIconsView">
        <div
            :class="{ sideBarIconsContainer: true, activeIcon: icon.active }"
            v-for="(icon, index) in iconList"
            :key="index"
            @click="iconClick(index)"
        >
            <img :src="icon.iconImg" :alt="icon.description" />
        </div>
        <div style="flex-grow: 1"></div>
        <!-- <div :class="{ sideBarIconsContainer: true, activeIcon: false }" @click="openLibrary">
            <img :src="libraryIcon" :alt="library" />
        </div> -->
        <div :class="{ sideBarIconsContainer: true, activeIcon: false }" @click="openSettings">
            <img :src="settingsIcon" :alt="settings" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, ref } from 'vue';
import { Location, Document, Menu as IconMenu, Setting } from '@element-plus/icons';
import sysBus from '../controller/systemBus';
import plugins from '../controller/plugin/plugin';

export default defineComponent({
    setup() {
        // eslint-disable-next-line no-undef
        const settingsIcon = `${'file:///' + __static}/images/workspace/settings.svg`;
        // eslint-disable-next-line no-undef
        const libraryIcon = `${'file:///' + __static}/images/workspace/library.svg`;
        const iconList = plugins.getSidebarIconListRef();
        function iconClick(index: number) {
            if (iconList.value[index].active) {
                // 本来就是打开的，再次点击关闭sidebar
                iconList.value[index].active = false;
                sysBus.emit('saltdog:closeSidebar');
            } else {
                iconList.value[index].active = true;
                iconList.value.forEach((item: any, i: number) => {
                    if (i !== index) {
                        item.active = false;
                    }
                });
                //sysBus.emit('onClickSidebarIcon', iconList.value[index].command);
                plugins.loadSidebarViews(iconList.value[index].command);
                sysBus.emit('saltdog:openSidebar');
            }
        }
        // function openLibrary() {
        //     sysBus.emit('saltdog:openLibrary', {});
        // }
        function openSettings() {
            sysBus.emit('saltdog:openSettings');
        }
        return {
            iconList,
            iconClick,
            settingsIcon,
            libraryIcon,
            openSettings,
            // openLibrary,
        };
    },
});
</script>
<style lang="stylus" scoped>
sidebar_icon_width = 48px
sidebar_icon_true_width = 27px
.sideBarIconsView
    -webkit-app-region:no-drag!important
    width: sidebar_icon_width;
    height:calc(100% - 20px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin:5px 0px 20px 0px;
    .sideBarIconsContainer
        -webkit-app-region:no-drag!important
        &:hover
            img
                // background-color: red
                filter: drop-shadow(var(--saltdog-sidebaricon-active-color) 80px 0);
                transform: translateX(-80px);
        &.activeIcon
            border-left: 3px solid var(--saltdog-sidebaricon-active-color);
            margin-right: auto
            img
                filter: drop-shadow(var(--saltdog-sidebaricon-active-color) 80px 0);
                transform: translateX(-80px);
        img
            width sidebar_icon_true_width
            height sidebar_icon_true_width
            filter: drop-shadow(var(--saltdog-sidebaricon-icon-color) 80px 0);
            transform: translateX(-80px);
        overflow:hidden
        align-items: center;
        width:calc(100% - 12px)
        text-align: center;
        padding:10px 3px 10px 3px
        //margin:0px
</style>
