<template>
    <h1>Hello World~{{pagename}}</h1>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
const pagename=ref('settings');
</script>
