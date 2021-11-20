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
    </div>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, ref } from 'vue';
import { Location, Document, Menu as IconMenu, Setting } from '@element-plus/icons';
import bus from '../controller/bus';
export default defineComponent({
    setup() {
        const { proxy } = getCurrentInstance()!;
        // eslint-disable-next-line no-undef
        const buildinIconPath = __static + '/images/workspace';
        const iconList = ref([
            {
                iconImg: `${buildinIconPath}/content.svg`,
                description: '目录',
                active: false,
                command: 'onClickSideBarIcon:content',
            },
            {
                iconImg: `${buildinIconPath}/search.svg`,
                description: '搜索',
                active: false,
                command: 'onClickSideBarIcon:search',
            },
        ]);
        // @ts-ignore
        const basicInfo = proxy.__basicInfo;
        console.log(basicInfo);
        // 加载插件sidebarIcon图标
        if (basicInfo.plugins) {
            for (let plugin in basicInfo.plugins) {
                if (basicInfo.plugins[plugin].sidebarIcon) {
                    basicInfo.plugins[plugin].sidebarIcon.forEach((icon: any) => {
                        iconList.value.push({
                            iconImg: icon.iconPath,
                            description: icon.description,
                            active: false,
                            // FIXME:
                            command: `onClickSideBarIcon:`,
                        });
                    });
                }
            }
        }
        function iconClick(index: number) {
            if (iconList.value[index].active) {
                // TODO:本来就是打开的，再次点击关闭sidebar
                iconList.value[index].active = false;
            } else {
                iconList.value[index].active = true;
                iconList.value.forEach((item, i) => {
                    if (i !== index) {
                        item.active = false;
                    }
                });
            }
        }
        return {
            iconList,
            iconClick,
        };
    },
});
</script>
<style lang="stylus">
sidebar_icon_width = 40px
sidebar_icon_true_width = 25px
.sideBarIconsView
    -webkit-app-region:no-drag!important
    width: sidebar_icon_width;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top:20px
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
