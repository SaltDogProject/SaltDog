<template>
    <div :class="{ statusbar_item_container: true }" :style="{ order: -999, backgroundColor: '' }">
        <el-tooltip placement="top-start" :show-after="500" :content="loadingJobsText">
            <el-icon :class="{ loadingQueueIcon: true, active: taskNum != 0 }"><Refresh /></el-icon>
        </el-tooltip>
        <span v-if="taskNum != 0" style="vertical-align: middle; display: inline-block; margin-left: 3px">
            {{ taskNum }}
        </span>
    </div>
</template>
<script lang="ts" setup>
import { Refresh } from '@element-plus/icons';
import { toRefs, computed, ref, reactive } from 'vue';
import type { ILoadingQueueTask } from '#/types/renderer';
import SaltDogMessageChannelRenderer from '../../controller/messageChannel';
import log from 'electron-log';
import { uniqueId } from 'lodash';
const TAG = '[Renderer/LoadingQueue]';
const taskMap = new Map<string, ILoadingQueueTask>();
let loadingTasks = reactive<ILoadingQueueTask[]>([
    // {
    //     id: 0,
    //     name: '文献下载',
    //     percent: 0,
    //     cancelCmd: 'cancelDownload',
    // },
]);
const loadingJobsText = computed(() => {
    if (taskNum.value == 0) {
        return '暂无正在运行的任务';
    } else {
        return `${taskNum.value} 项任务进行中: ${loadingTasks.map((task) => task.name).join(', ')}`;
    }
});
const taskNum = computed(() => loadingTasks.length);
console.log('listening!', SaltDogMessageChannelRenderer.getInstance());
SaltDogMessageChannelRenderer.getInstance().subscribe('saltdog.updateLoadingQueue', (task: any) => {
    if (task.id) {
        task = reactive(task);
        if (!taskMap.has(task.id)) {
            loadingTasks.push(task);
            taskMap.set(task.id, task);
        }

        const targetTask = taskMap.get(task.id) as ILoadingQueueTask;

        targetTask.percent = task.percent;
        targetTask.name = task.name;
        targetTask.cancelCmd = task.cancelCmd;
        if (task.percent == 100) {
            taskMap.delete(task.id);
            loadingTasks.splice(loadingTasks.indexOf(targetTask), 1);
            // loadingTasks = loadingTasks.filter((t) => t.id != task.id);
        }

        return task.id;
    } else {
        log.warn(TAG, 'Task id not found');
    }
});
SaltDogMessageChannelRenderer.getInstance().subscribe('saltdog.cancelLoadingQueue', (id) => {
    if (!taskMap.has(id)) {
        log.warn(TAG, 'Target task not availiable. Task id:', id);
        return;
    }
    const targetTask = taskMap.get(id) as ILoadingQueueTask;
    taskMap.delete(id);
    loadingTasks.splice(loadingTasks.indexOf(targetTask), 1);
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
