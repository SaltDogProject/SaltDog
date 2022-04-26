<template>
    <el-breadcrumb class="pathBreadcrumb" separator="/">
        <el-breadcrumb-item
            class="pathBreadcrumb__item"
            @click="goToPath(currentLib.libraryID, currentLib.rootDirID)"
            v-if="currentLib.name"
        >
            <a>{{ currentLib.name }}</a>
        </el-breadcrumb-item>
        <el-breadcrumb-item
            class="pathBreadcrumb__item"
            @click="goToPath(currentLib.libraryID, dir.dirID)"
            v-for="dir in currentPath"
            :key="dir.dirID"
        >
            <a>{{ dir.name }}</a>
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>
<script setup lang="ts">
import { ref, toRefs, defineProps, onUpdated, onMounted, defineEmits } from 'vue';
const TAG = '[Renderer/Library/Navi]';
const p = defineProps<{
    currentPath: any;
    currentLib: any;
}>();
const emit = defineEmits<{
    (e: 'updateView', libraryID: number, dirID: number): void;
}>();

const { currentPath, currentLib } = toRefs(p);
let libraryID = 1;
// const emit = defineEmits(['change', 'delete']);
function goToPath(libraryID: number, dirID: number) {
    if (currentPath.value.length == 0 || dirID == currentPath.value[currentPath.value.length - 1].dirID) {
        console.log(TAG, 'unnecessary gotoPath,ignore');
        return;
    }
    console.log(TAG, 'goToPath', libraryID, dirID);
    emit('updateView', libraryID, dirID);
}
onUpdated(() => {
    console.log('Path Change', currentLib.value, currentPath.value);
});
onMounted(() => {
    console.log(TAG, 'Load Navi in dir', currentPath.value);
});
</script>
<style>
.pathBreadcrumb pathBreadcrumb__item {
    cursor: pointer;
}
</style>
