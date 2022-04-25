<template>
    <div style="max-height: 150px; width: 100%; position: relative">
        <div style="position: absolute; right: 12px; top: 2px">
            <el-button @click="closeInfoPanel" style="font-size: 20px; color: grey" type="text" :icon="Close" />
        </div>
        <div class="itemInfoHead">
            <div style="height: 100%; align-items: center; margin: 0px 10px">
                <img style="width: 30px; height: 30px" src="/conference.svg" alt="" />
            </div>
            <div class="itemInfoHead_title">
                A Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA
                Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA Survey ofA Survey of Neuromorphic
                Computing and Neural Networks in Hardware
            </div>
        </div>
    </div>
    <div style="margin: 10px; height: calc(100% - 190px)">
        <el-tabs stretch v-model="activeName" class="itemInfoListTabs" @tab-click="handleClick">
            <el-tab-pane label="详细信息" name="first">
                <div style="font-size: 20px">附件</div>
                <div class="attachment_group">
                    <div :key="a.name" v-for="a in attachment" class="attacment_item">
                        <img style="width: 20px; height: 20px" :src="getImage(a.type)" alt="" />
                        <span class="attacment_title">{{ a.name }}</span>
                    </div>
                </div>
                <div style="font-size: 20px">详情</div>
                <div class="itemInfoListContainer" :style="infoH">
                    <el-descriptions :column="1" direction="horizontal">
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="文章类型"
                        >
                            会议论文
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="作者"
                        >
                            Adam Jacobs; Grzegorz Cieslewski; Alan D. George;
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="DOI"
                        >
                            10.1109/FPL.2012.6339222
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="日期"
                        >
                            2012.08
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="会议名称"
                        >
                            2012 22nd International Conference on Field Programmable Logic and Applications (FPL)
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="地点"
                        >
                            Oslo, Norway
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="页码"
                        >
                            300-306
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="出版"
                        >
                            IEEE
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="ISBN"
                        >
                            978-1-4673-2256-0 978-1-4673-2257-7 978-1-4673-2255-3
                        </el-descriptions-item>

                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="摘要"
                        >
                            <el-collapse style="--el-collapse-border-color">
                                <el-collapse-item class="abstractCollapse" title="点击查看" name="1">
                                    Commercial SRAM-based, ﬁeld-programmable gate arrays (FPGAs) have the capability to
                                    provide space applications with the necessary performance, energy-efﬁciency, and
                                    adaptability to meet next-generation mission requirements. However, mitigating an
                                    FPGA’s susceptibility to radiationinduced faults is challenging. Triple-modular
                                    redundancy (TMR) techniques are traditionally used to mitigate radiation effects,
                                    but TMR incurs substantial overheads such as increased area and power requirements.
                                    In order to reduce these overheads while still providing sufﬁcient radiation
                                    mitigation, we propose the use of algorithm-based fault tolerance (ABFT). We
                                    investigate the effectiveness of hardware-based ABFT logic in COTS FPGAs by
                                    developing multiple ABFT-enabled matrix multiplication designs, carefully analyzing
                                    resource usage and reliability tradeoffs, and proposing design modiﬁcations for
                                    higher reliability. We perform fault-injection testing on a Xilinx Virtex-5 platform
                                    to validate these ABFT designs, measure design vulnerability, and compare ABFT
                                    effectiveness to other fault-tolerance methods. Our hybrid ABFT design reduces total
                                    design vulnerability by 99% while only incurring 25% overhead over a baseline,
                                    non-protected design.
                                </el-collapse-item>
                            </el-collapse>
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="来源"
                        >
                            DOI.org (Crossref)
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="添加日期"
                        >
                            2022/4/22 下午13:17
                        </el-descriptions-item>
                        <el-descriptions-item
                            class-name="itemInfoList_content"
                            label-class-name="itemInfoList_label"
                            label="修改日期"
                        >
                            2022/4/22 下午13:20
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </el-tab-pane>
            <el-tab-pane label="管理" name="second">
                <div style="font-size: 20px">标签</div>
                <div class="itemTags-group">
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                    <el-tag class="ml-2" type="success">
                        sdadddd dddddddd ddddddd ddddddd ddddddddddddddd dddddddddddsdaddd ddddddd ddddddddddddddd
                        ddddddd dddddddddddd dddddd dd
                    </el-tag>
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                    <el-tag class="ml-2" type="success">Tag 2</el-tag>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Close } from '@element-plus/icons-vue';
const attachment = ref([
    {
        type: 'pdf',
        name: 'Full Text PDF',
    },
    {
        type: 'internet',
        name: 'Web Snapshot',
    },
]);
function closeInfoPanel() {
    console.log('closePanel');
}
function getImage(str: any) {
    return '/' + str + '.svg';
}
const activeName = ref('first');
const infoH = computed({
    // 自适应详情高度
    get: () => {
        let len = 'height:calc(100% - 29px - 10px - 20px - 39px ';
        for (const i in attachment.value) {
            len += '- 46px ';
        }
        return len + ')';
    },
    set: (val) => {
        return;
    },
});
const handleClick = (tab: any, event: Event) => {
    console.log(tab, event);
};
</script>
<style>
.itemInfoList_content {
    display: inline-block;
    max-width: calc(100% - 90px);
    line-height: 24px;
    color: #303133 !important;
    word-wrap: break-word;
}
.itemInfoList_content .el-collapse {
    border: none;
}
.itemInfoList_label {
    height: 100% !important;
    color: #5f6368 !important;
    width: 80px;
    display: inline-block;
    margin-right: 0px !important;
}
.itemInfoListContainer .el-descriptions__cell {
    display: flex;
}
.itemInfoListTabs .el-tabs__content {
    height: 100% !important;
}
.itemInfoListTabs {
    height: 100%;
}
.itemInfoListTabs .el-tab-pane {
    height: 100%;
}
.itemInfoListContainer {
    margin: 10px;
    overflow: scroll;
}
.itemInfoList_content {
    border: none;
}
.itemInfoHead_title {
    font-size: 20px;
    font-variant-ligatures: no-contextual;
    font-weight: 400;
    color: #202124;
    display: -webkit-box;
    line-height: 24px;
    overflow: hidden;
    word-wrap: break-word;
    height: 72px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    hyphens: auto;
}
.itemInfoHead {
    padding: 20px 0px;
    margin: 10px;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
}
.itemInfoList_content .el-collapse-item__header {
    border: none;
    height: 24px;
    line-height: 24px;
    font-size: inherit;
}
.attachment_group {
    margin: 10px 0px 20px 0px;
}
.attachment_group .attacment_title {
    display: inline-block;
    margin-left: 10px;
}
.attachment_group .attacment_item {
    border: 2px solid;
    border-color: rgba(64, 158, 255, 0.1);
    padding: 10px 16px;
    line-height: 1.5;
    font-size: 0.9rem;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
}
.itemTags-group {
    margin: 10px;
}
.itemTags-group .el-tag__content {
    display: inline-block;
    hyphens: auto;
    word-wrap: break-word;
}
.itemTags-group .el-tag {
    margin-right: 5px;
    margin-bottom: px;
}

/* 滚动条 */
*::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

*::-webkit-scrollbar-thumb {
    background: #aaaaaa;
    border-radius: 4px;
    cursor: pointer;
}

*::-webkit-scrollbar-thumb:hover {
    opacity: 1;
    display: block !important;
}

*::-webkit-scrollbar-track {
    background-color: transparent;
}
.hideScroll::-webkit-scrollbar-thumb {
    display: none;
}
.showScroll::-webkit-scrollbar-thumb {
    display: block;
}
html {
    overflow-y: overlay;
}
</style>
