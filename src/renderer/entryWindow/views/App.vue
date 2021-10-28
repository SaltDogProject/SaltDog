<template>
    <div id="main">
        <div class="fake-title-bar" :class="{ darwin: os === 'darwin' }">
            <div class="fake-title-bar__title">SaltDog - {{ version }}</div>
            <div class="handle-bar" v-if="os !== 'darwin'">
                <i class="el-icon-minus" @click="minimizeWindow"></i>
                <i class="el-icon-close" @click="closeWindow"></i>
            </div>
        </div>
        <el-row class="main-content">
            <el-col :span="5" class="side-bar-menu">
                <el-row class="logo-content" style="text-aligin: center">
                    <el-image
                        :src="logoSrc"
                        style="width: 60px; height: 60px; border-radius: 30px; margin: 0 auto"
                    ></el-image>
                </el-row>
                <div style="text-align: center; width: 100%; font-size: 20px; color: #eee; margin: 10px 0">SaltDog</div>
                <div style="text-align: center; width: 100%; font-size: 10px; color: #eee">Version {{ version }}</div>
                <div style="width: 80%; margin: 20px 0px 20px 8%; height: 1px; border-bottom: 1px solid #666"></div>
                <el-menu :default-active="defaultActive" class="entryMenu" @select="handleSelect" :unique-opened="true">
                    <el-menu-item index="recent">
                        <i class="el-icon-refresh-right"></i>
                        <span>最近打开</span>
                    </el-menu-item>
                    <el-menu-item index="paperManage">
                        <i class="el-icon-document-copy"></i>
                        <span>文献管理</span>
                    </el-menu-item>
                    <el-menu-item index="plugins">
                        <i class="el-icon-share"></i>
                        <span>插件管理</span>
                    </el-menu-item>
                    <el-menu-item index="settings">
                        <i class="el-icon-setting"></i>
                        <span>设置</span>
                    </el-menu-item>
                </el-menu>
            </el-col>
            <el-col
                :span="19"
                :offset="5"
                class="main-wrapper"
                :class="{ darwin: os === 'darwin' }"
                style="padding: 10px"
            >
                <router-view v-slot="{ Component }">
                    <transition name="saltdog-fade" mode="out-in">
                        <keep-alive>
                            <component :is="Component" />
                        </keep-alive>
                    </transition>
                </router-view>
            </el-col>
        </el-row>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, getCurrentInstance, ComponentInternalInstance } from 'vue';
import pkg from 'root/package.json';
import Recent from '../views/Recent.vue';
import PaperManage from '../views/PaperManage.vue';
import Settings from '../views/Settings.vue';
declare var __static: string;
enum menuItem {
    RECENT = 'recent',
    PAPER_MANAGE = 'paperManage',
    SETTINGS = 'settings',
}
const App = defineComponent({
    components: { Recent, PaperManage, Settings },
    setup() {
        const { proxy } = getCurrentInstance() as ComponentInternalInstance;
        const os = ref(process.platform);
        const version = ref('');
        version.value = process.env.NOCE_ENV === 'production' ? pkg.version : 'Dev';
        const defaultActive = ref(menuItem.RECENT);
        function handleSelect(index: menuItem) {
            console.log(index, proxy?.$router);
            proxy?.$router.push({ name: `${index}` });
        }
        return {
            os,
            version,
            defaultActive,
            handleSelect,
            logoSrc: ref(`${__static}/images/logo.png`),
        };
    },
});
export default App;
</script>

<style lang="stylus">
title_bar_height = 22px
$darwinBg = transparentify(#172426, #000, 0.7)
.saltdog-fade
  &-enter,
  &-leave,
  &-leave-active
    opacity 0
  &-enter-active,
  &-leave-active
    transition all 100ms linear
#main
    overflow: hidden
    .fake-title-bar
        -webkit-app-region: drag
        height title_bar_height
        width 100%
        text-align center
        color #eee
        font-size 12px
        line-height @height
        position fixed
        z-index 100
        &.darwin
            background transparent
            background-image linear-gradient(
                to right,
                transparent 0%,
                transparent 167px,
                $darwinBg 167px,
                $darwinBg 100%
            )
            .fake-title-bar__title
                padding-left 167px
        .handle-bar
            position absolute
            top 2px
            right 4px
            z-index 10000
            -webkit-app-region no-drag
            i
                cursor pointer
                font-size 16px
                margin-left 5px
            .el-icon-minus
                &:hover
                    color #409eff
            .el-icon-close
                &:hover
                    color #f15140
            .el-icon-circle-plus-outline
                &:hover
                    color #69c282
    .main-content
        padding-top title_bar_height
        position relative
        z-index 10
        .side-bar-menu
            position fixed
            height 'calc(100vh - %s)' % title_bar_height
            overflow-x hidden
            overflow-y auto
            min-width 170px

            .el-icon-info.setting-window
                position fixed
                bottom 4px
                left 4px
                cursor poiter
                color #878d99
                transition .2s all ease-in-out
                &:hover
                    color #409EFF
            .el-menu
                border-right none
                background transparent
                width 170px
                &-item
                    color #eee
                    position relative
                    &:focus,
                    &:hover
                        color #fff
                        background transparent
                    &.is-active
                        color active-color = #409EFF
                        border-right 10px
                        margin-right 5px
                        &:before
                            content ''
                            position absolute
                            width 3px
                            height 20px
                            right 0
                            top 18px
                            background active-color
    .align-center
        input
            text-align center
    *::-webkit-scrollbar
        width 8px
        height 8px
    *::-webkit-scrollbar-thumb
        border-radius 4px
        background #6f6f6f
    *::-webkit-scrollbar-track
        background-color transparent
    #app
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;

    #nav
        padding: 30px;
        a
            font-weight: bold;
            color: #2c3e50;
            &.router-link-exact-active
                color: #42b983;
</style>
