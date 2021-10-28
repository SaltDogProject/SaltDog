<template>
    <div id="app">
        <app></app>
    </div>
</template>

<script>
import App from './views/App.vue';
export default {
    name: 'SaltDogWorkSpace',
    components: { App },
};
</script>

<style lang="stylus">
body,html
    padding 0
    margin 0
    height 100%
    font-family "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif
#app
    user-select none
    overflow hidden
.el-button-group
    width 100%
    .el-button
        width 50%
</style>
