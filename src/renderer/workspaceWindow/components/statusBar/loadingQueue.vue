<template>
    <div :class="{ statusbar_item_container: true }" :style="{ order: -999, backgroundColor: '' }">
        <el-tooltip placement="top-start" :show-after="500" :content="loadingJobsText">
            <el-icon :class="{ loadingQueueIcon: true, active: true }"><Refresh /></el-icon>
        </el-tooltip>
        <span v-if="taskNum != 0" style="vertical-align: middle; display: inline-block; margin-left: 3px">
            {{ taskNum }}
        </span>
    </div>
</template>
<script lang="ts" setup>
import { Refresh } from '@element-plus/icons';
import { toRefs, computed, ref } from 'vue';
import type { ILoadingQueueTask } from '#/types/renderer';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
import log from 'electron-log';
import { uniqueId } from 'lodash';
const TAG = '[Renderer/LoadingQueue]';
const taskMap = new Map<string, ILoadingQueueTask>();
const loadingTasks = ref<ILoadingQueueTask[]>([
    {
        id: 0,
        name: '文献下载',
        percent: 0,
        cancelCmd: 'cancelDownload',
    },
]);
const loadingJobsText = computed(() => {
    if (taskNum.value == 0) {
        return '无后台运行任务';
    } else {
        return `${taskNum.value} 项任务进行中: ${loadingTasks.value.map((task) => task.name).join(', ')}`;
    }
});
const taskNum = computed(() => loadingTasks.value.length);
SaltDogMessageChannelRenderer.getInstance().onInvoke('salltdog.updateLoadingQueue', async (task: any) => {
    if (task.id) {
        if (!taskMap.has(task.id)) {
            log.warn(TAG, 'Target task not availiable. Task id:', task.id);
            throw new Error('Target task not availiable.');
        }
        const targetTask = taskMap.get(task.id) as ILoadingQueueTask;
        targetTask.percent = task.percent;
        targetTask.name = task.name;
        targetTask.cancelCmd = task.cancelCmd;
        if (task.percent == 100) {
            taskMap.delete(task.id);
            loadingTasks.value = loadingTasks.value.filter((task) => task.id != task.id);
        }
        return task.id;
    } else {
        const i = uniqueId();
        log.log(TAG, 'Create task ' + task.name + ' assign id ' + i);
        task.id = i;
        loadingTasks.value.push(task);
        taskMap.set(i, task);
        return i;
    }
});
</script>
<style lang="stylus" scoped>
.statusbar_item_container
        font-size:12px
        display: inline-block
        margin-right:2px;
        padding 3px 6px;
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
        i
            vertical-align middle
.loadingQueueIcon
    font-size: 12px
    &.active
        animation: loadingQueueIcon 1s infinite;
        &:hover
            animation: loadingQueueIcon 1s infinite;
        @keyframes loadingQueueIcon
            0%
                transform: rotate(360deg);
            100%
                transform: rotate(0deg);
</style>
