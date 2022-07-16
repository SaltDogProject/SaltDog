<template>
    <div class="statusBar_container">
        <div class="statusbar_left_container">
            <div
                v-for="(status, index) in leftStatusBar"
                :key="index"
                :class="{ statusbar_item_container: true, hidden: !status.show }"
                @click="onClickStatusBarItem(status.id, status.name, status.command)"
                :style="{ order: status.priority || 0, backgroundColor: status.backgroundColor || '' }"
            >
                <el-tooltip
                    v-if="status.tooltip"
                    placement="top-start"
                    :show-after="500"
                    :content="status.tooltip"
                    raw-content
                >
                    <span
                        v-html="status.text"
                        :style="{ color: status.color || 'inherit' }"
                        class="statusbar_display"
                    ></span>
                </el-tooltip>
                <span
                    v-html="status.text"
                    v-else
                    :style="{ color: status.color || 'inherit' }"
                    class="statusbar_display"
                ></span>
            </div>
        </div>
        <div class="space"></div>

        <div class="statusbar_right_container">
            <div
                v-for="(status, index) in rightStatusBar"
                :key="index"
                :class="{ statusbar_item_container: true, hidden: !status.show }"
                @click="onClickStatusBarItem(status.id, status.name, status.command)"
                :style="{ order: status.priority || 0, backgroundColor: status.backgroundColor || '' }"
            >
                <el-tooltip
                    v-if="status.tooltip"
                    placement="top-start"
                    :show-after="500"
                    :content="status.tooltip"
                    raw-content
                >
                    <span
                        v-html="status.text"
                        :style="{ color: status.color || 'inherit' }"
                        class="statusbar_display"
                    ></span>
                </el-tooltip>
                <span
                    v-html="status.text"
                    v-else
                    :style="{ color: status.color || 'inherit' }"
                    class="statusbar_display"
                ></span>
            </div>
            <LoadingQueue></LoadingQueue>
        </div>
    </div>
</template>
<script setup lang="ts">
import statusBar from '../../controller/statusBar';
import LoadingQueue from './loadingQueue.vue';
const leftStatusBar = statusBar.getLeftStatusBarRef();
const rightStatusBar = statusBar.getRightStatusBarRef();
function onClickStatusBarItem(id: string, name: string | undefined, command: string | undefined) {
    console.log('onClickStatusBarItem', id, name, command);
}
// createStatusBarItem(StatusBarAlignment.Right)

// command: string | Command | undefined

// id: string

// name: string | undefined
</script>
<style lang="stylus" scoped>
.statusBar_container
    width:100%;
    height:100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content:space-between;
    align-items: stretch;
    &>.space
        flex-grow: 1
    &>.statusbar_container
        display: flex
        flex-flow: row nowrap;
        align-items: stretch;
    &>.statusbar_right_container
        display: flex
        flex-flow: row-reverse nowrap;
        align-items: stretch;
    .statusbar_item_container
        display: inline-block
        margin-right:2px;
        padding 2px 6px;
        line-height 18px;
        height:100%;
        &.hidden
            display: none;
        &:hover
            background-color: gainsboro
            // filter: grayscale(50%);
        span.statusbar_display
            vertical-align: top;
            display: inline-block
            text-align: center;
            font-size: 12px;
            color: inherit;
</style>
