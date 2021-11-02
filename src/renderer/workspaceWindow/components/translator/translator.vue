<template>
    <div>
        <div style="margin: 10px; margin-bottom: 20px">{{ originalText }}</div>
        <div style="margin: 10px">{{ translateText }}</div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import bus from '@/utils/bus';
import { phaseText, translate } from './textPhaser';
export default defineComponent({
    setup() {
        const translateText = ref('选中文本以翻译');
        const originalText = ref('选中文本以翻译');
        bus.on('textSelect', (args) => {
            let t = phaseText(args[0]);
            originalText.value = t.join(' ');
            translateText.value = '翻译中...';
            translate(t)
                .then((s) => {
                    translateText.value = s;
                })
                .catch((e) => {
                    console.error('Translate Error', e);
                });
        });
        return {
            originalText,
            translateText,
        };
    },
});
</script>
