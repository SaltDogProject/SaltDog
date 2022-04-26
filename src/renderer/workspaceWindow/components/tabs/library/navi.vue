<template>
    <el-breadcrumb class="pathBreadcrumb" separator="/">
        <el-breadcrumb-item>我的图书馆</el-breadcrumb-item>
        <el-breadcrumb-item>promotion management</el-breadcrumb-item>
        <el-breadcrumb-item>promotion list</el-breadcrumb-item>
        <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
    </el-breadcrumb>
</template>
<script setup lang="ts">
import { ref, toRefs, defineProps, onUpdated, onMounted } from 'vue';
import {}
const TAG = '[Renderer/Library/Navi]';
const p = defineProps<{
    currentPath: number;
}>();

const { currentPath } = toRefs(p);
let libraryID = 1;
// const emit = defineEmits(['change', 'delete']);

onUpdated(() => {
    console.log('pathchange', currentPath.value);
});
onMounted(() => {
    console.log(TAG,'Load Navi in dir', currentPath.value);

});
});
</script>
<style></style>
