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
:root
    --saltdog-titlebar-background-color: #eaeaeb;
    --saltdog-tabheader-background-color: #eaeaeb;
    --saltdog-sidebar-background-color:#eaeaeb;
    --saltdog-sidebar-treeview-background-color:#eaeaeb;
    --saltdog-sidebar-title-font-color:#616161;
    --saltdog-bottombar-background-color: #eaeaeb;
    --saltdog-sidebaricon-background-color:#fafafa;
    --saltdog-sidebaricon-active-color:#121417;
    --saltdog-sidebaricon-icon-color:#9d9e9f;
    --saltdog-panel-background-color:#fafafa;


    --saltdog-scrollbar-thumb-background-color:#a2a7b0
    --el-tree-font-color:var(--saltdog-sidebar-title-font-color);
    --el-tree-node-hover-background-color: #f5f7fa;
    --el-tree-expand-icon-color: var(--saltdog-sidebar-title-font-color);


body,html
    padding 0
    margin 0
    height 100%
    font-family "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif
#app
    user-select none
    overflow hidden
.clickable
    -webkit-app-region: no-drag;
    user-select: "auto";
.el-button-group
    width 100%
    .el-button
        width 50%
</style>
