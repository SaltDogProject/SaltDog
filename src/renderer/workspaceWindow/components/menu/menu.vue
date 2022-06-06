<template>
    <div>
        <div @mouseleave="onMouseLeave" class="titleMenu_container">
            <div
                @click="renderMenu(index)"
                @mouseover="mouseOver(index)"
                :class="{ titleMenu_entry: true, active: activeMenuIndex == index }"
                v-for="(item, index) in menuList"
                :key="index"
            >
                {{ item.title }}
            </div>
        </div>
        <div
            @mouseover="mouseOverSubmenu"
            @mouseleave="onMouseLeave"
            :class="{ titleMenuItems: true, hidden: !hasMenuDisplay }"
            :style="{ left: menuLeft }"
        >
            <ul>
                <li
                    @click="execCommand(item.command, item.args)"
                    v-for="(item, index) in displayedMenuItem"
                    :key="index"
                >
                    {{ item.title }}
                </li>
            </ul>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
interface ISaltdogSubMenuItem {
    title: string;
    command: string;
    args: any;
}
interface ISaltdogMenuItem {
    title: string;
    children?: ISaltdogSubMenuItem[];
}
const os = process.platform;
const menuList = [
    {
        title: '文件',
        children: [
            {
                title: '打开PDF',
                command: 'saltdog.openNewPDF',
                args: '',
            },
            {
                title: '打开最近的文件',
                children: [
                    {
                        title: 'a.pdf',
                        command: 'saltdog.openPDF',
                        args: 'a.pdf',
                    },
                    {
                        title: 'b.pdf',
                        command: 'saltdog.openPDF',
                        args: 'b.pdf',
                    },
                ],
            },
        ],
    },
    {
        title: '工具',
        children: [
            {
                title: '查找文献',
                command: 'saltdog.librarySearch',
                args: '',
            },
        ],
    },
] as ISaltdogMenuItem[];
let judgeTimer: any = null;
const hasMenuDisplay = ref(false);
const activeMenuIndex = ref(-1);
const menuLeft = ref('40px');
const displayedMenuItem = ref<null | ISaltdogSubMenuItem[]>(null);
function execCommand(cmd: string, ...arg: any) {
    SaltDogMessageChannelRenderer.getInstance().execCommand(cmd, ...arg);
    onMouseLeave();
}
function mouseOver(index: number) {
    if (judgeTimer) {
        clearTimeout(judgeTimer);
        judgeTimer = null;
    }
    if (hasMenuDisplay.value) renderMenu(index);
}
function renderMenu(index: number) {
    hasMenuDisplay.value = true;
    activeMenuIndex.value = index;
    displayedMenuItem.value = menuList[index].children as ISaltdogSubMenuItem[];
    menuLeft.value = (activeMenuIndex.value * 50+(os==='darwin'?60:40)) +'px';
    console.log('render', index);
}
function onMouseLeave() {
    if (judgeTimer) {
        clearTimeout(judgeTimer);
        judgeTimer = null;
    }
    judgeTimer = setTimeout(function () {
        hasMenuDisplay.value = false;
        activeMenuIndex.value = -1;
    }, 100);
}
function mouseOverSubmenu() {
    if (judgeTimer) {
        clearTimeout(judgeTimer);
        judgeTimer = null;
    }
}
</script>
<style lang="stylus" scoped>
.titleMenu_container
    font-size:13px;
    display: flex;
    flex-direction: row;
    .titleMenu_entry
        -webkit-app-region: no-drag;
        // user-select: auto;
        width:50px;
        display: inline-block;
        text-align: center;
        &.active
            background-color:  rgba(0,0,0,0.1);
        &:hover
            background-color:  rgba(0,0,0,0.1);
.titleMenuItems
     box-shadow: var(--el-box-shadow-lighter);
     background-color:white;
     position: fixed;
     top: 30px;
    //  width: 300px;
     .hidden
        display: none;
    &>ul
        list-style: none
        text-align: left
        cursor pointer
        margin:10px 2px;
        min-width: 200px;
        padding:0;
        line-height: 25px;
        font-size: 13px;
        &>li
            margin:3px 0px;
            padding 0px 20px;
            &:hover
                background-color: #0060C0;
                color:white;
</style>
