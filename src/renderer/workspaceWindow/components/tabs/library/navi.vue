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
const p = defineProps<{
    currentPath: number[];
}>();

const { currentPath } = toRefs(p);

// const emit = defineEmits(['change', 'delete']);

onUpdated(() => {
    console.log('pathchange', currentPath.value);
});
onMounted(() => {});
</script>
<style></style>
