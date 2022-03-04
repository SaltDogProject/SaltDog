<template>
    <div style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden">
        <el-tree
            :indent="10"
            class="OutlineTree"
            :data="outlineTree"
            :props="defaultProps"
            @node-click="handleNodeClick"
        />
    </div>
</template>
<script lang="ts">
import { defineComponent, DefineComponent, getCurrentInstance, onMounted, onUpdated, ref } from 'vue';
import bus from '../../controller/systemBus';
interface Tree {
    label: string;
    linkTarget: string;
    children?: Tree[];
}
const data: Tree[] = [
    {
        label: 'Level one 1',
        linkTarget: 'POCSDSDSDDDSDSD',
        children: [
            {
                label: 'Level two 1-1',
                linkTarget: 'POCSDSDSDDDSDSD1',
                children: [
                    {
                        label: 'Level two 1-1',
                        linkTarget: 'POCSDSDSDDDSDSD1',
                        children: [
                            {
                                linkTarget: 'POCSDSDSDDDSDSD2',
                                label: 'Level three 1-1-1',
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
const defaultProps = {
    children: 'children',
    label: 'label',
};
export default defineComponent({
    setup() {
        const outlineTree = ref<Tree[]>([]);
        outlineTree.value = data;
        const handleNodeClick = (data: Tree) => {
            console.log(data);
        };
        return {
            outlineTree,
            defaultProps,
            handleNodeClick,
        };
    },
});
</script>
<style lang="stylus">
.OutlineTree
    background: var(--saltdog-sidebar-background-color)!important;
    border-radius:5px;
    color: var(--el-tree-font-color)!important;
    --el-tree-font-color:var(--saltdog-sidebar-title-font-color)!important;
    --el-tree-node-hover-background-color: #f5f7fa!important;
    --el-tree-expand-icon-color: var(--saltdog-sidebar-title-font-color)!important;
</style>
