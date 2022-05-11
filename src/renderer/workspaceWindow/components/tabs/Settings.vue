<template>
    <div class="settingsTabs">
        <el-tabs class="settingsTabs" v-model="activeName" model-value="preferences">
            <el-tab-pane :key="index" v-for="(item, index) in template" :label="item.title" :name="index">
                <div class="settingsPaneConainer">
                    <div
                        v-for="(subitem, subindex) in item.subGroup"
                        :key="index + '.' + subindex"
                        class="settingsPaneSubConainer"
                    >
                        <div class="settingsPaneSubConainer__grouptitle">{{ subitem.title }}</div>
                        <div v-for="listitem in subitem.children" :key="listitem.id" class="settingsListContainer">
                            <div class="settingsListContainer__title">{{ listitem.title }}</div>
                            <div class="settingsListContainer__typetext" v-if="listitem.type == 'text'">
                                <div class="settingsListContainer__typetext_desc" v-if="listitem.desc">
                                    {{ listitem.desc }}
                                </div>
                                <el-input
                                    autocomplete="false"
                                    spellcheck="false"
                                    @change="handleSettingsChange"
                                    v-model="listitem.value"
                                    :data-settingsid="listitem.id"
                                    :placeholder="listitem.desc"
                                    clearable
                                />
                            </div>
                            <div class="settingsListContainer__typebool" v-if="listitem.type == 'boolean'">
                                <div style="margin-top: 10px">
                                    <el-switch
                                        spellcheck="false"
                                        @change="handleSettingsChange"
                                        v-model="listitem.value"
                                        :data-settingsid="listitem.id"
                                    />
                                    <div
                                        class="settingsListContainer__typebool_desc"
                                        style="margin-left: 10px; display: inline-block"
                                        v-if="listitem.desc"
                                    >
                                        {{ listitem.desc }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onUnmounted, onMounted, onBeforeMount } from 'vue';
import settings from '@/utils/db';
import { set, get, has } from 'lodash';
import { ipcRenderer } from 'electron';

const __settingsCache = {};
const __modifiedSettings = new Map<string, any>();
function handleSettingsChange() {
    __modifiedSettings.forEach((value, key) => {
        settings.set(key, value);
    });
    __modifiedSettings.clear();
}
onUnmounted(() => {
    handleSettingsChange();
});
onBeforeMount;
let template = ref({});
onMounted(() => {
    const ori = ipcRenderer.sendSync('getSettingsTemplate');
    console.log(ori);
    template.value = DeepProxy(reactive(ori));
});

// 因为element-plus必须要双向ui绑定，但是我想把settings样式和说明分开存，而且element-plus的onChange还不会返回input实例信息。。我麻了
function DeepProxy(Obj: any) {
    // 深度遍历
    if (typeof Obj === 'object') {
        const status = Array.isArray(Obj);
        if (status) {
            Obj.forEach((v, i) => {
                if (typeof v === 'object') {
                    Obj[i] = DeepProxy(v);
                }
            });
        } else {
            Object.keys(Obj).forEach((v) => {
                if (typeof Obj[v] === 'object') {
                    Obj[v] = DeepProxy(Obj[v]);
                }
            });
        }
        return new Proxy(Obj, {
            get(target, p, receiver) {
                if (p == 'value') {
                    if (!has(__settingsCache, target.id)) {
                        const temp = settings.get(target.id);
                        set(__settingsCache, target.id, temp);
                        return temp;
                    } else {
                        return get(__settingsCache, target.id);
                    }
                } else {
                    return Reflect.get(target, p, receiver);
                }
            },
            set(target, p, value, receiver) {
                if (p == 'value' && has(__settingsCache, target.id)) {
                    set(__settingsCache, target.id, value);
                    __modifiedSettings.set(target.id, value);
                    return true;
                } else {
                    return Reflect.set(target, p, value, receiver);
                }
            },
        });
    }
    return new TypeError('Argument must be object or array');
}
</script>
<style lang="stylus" scoped>
.settingsTabs
    .el-tabs__header
        padding 20px 40px 0px 40px!important
.settingsPaneConainer
    color:var(--el-text-color-primary)
    margin:20px 40px 20px 40px
    // .el-tabs__header
    //     background-color: var(--saltdog-tabheader-background-color)!important
    //     .el-tabs__item
    //         height tabitem_height
    .el-tabs__header
        padding 10px!important
.settingsPaneSubConainer
    margin:0px 20px 0px 0px
    &__grouptitle
        font-size:30px;
        margin-top:20px;
.settingsListContainer
    margin:10px 0px 10px 0px
    &__title
        font-size:14px;
        font-weight:700;
        padding:10px 0px 0px 0px
    &__typetext
        &_desc
            margin:3px 0px 10px 0px;
            color:var(--el-text-color-regular)
            font-size:14px;
    &__typebool
        &_desc
            color:var(--el-text-color-regular)
            font-size:14px;
</style>
