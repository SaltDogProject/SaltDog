<template>
    <div id="app">
        <app></app>
    </div>
</template>

<script>
import App from './views/App.vue';
// var myFonts = new FontFace('myFontName', 'url(ShouShu.ttf)',{});
// myFonts.load().then(function(loadFace){
//   document.fonts.add(loadFace);
// });
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
    --saltdog-font-family: -apple-system,"PingFang SC",Noto Sans,Helvetica Neue,Helvetica,Nimbus Sans L,Arial,Liberation Sans,PingFang SC,Hiragino Sans GB,Noto Sans CJK SC,Source Han Sans SC,Source Han Sans CN,Microsoft YaHei,Wenquanyi Micro Hei,WenQuanYi Zen Hei,ST Heiti,SimHei,WenQuanYi Zen Hei Sharp,sans-serif;

    --saltdog-scrollbar-thumb-background-color:#a2a7b0
    --el-tree-font-color:var(--saltdog-sidebar-title-font-color);
    --el-tree-node-hover-background-color: #f5f7fa;
    --el-tree-expand-icon-color: var(--saltdog-sidebar-title-font-color);


i.el-icon
    font-family: var(--saltdog-font-family);
body,html
    padding 0
    margin 0
    height 100%
    font-family: var(--saltdog-font-family);
    //font-family "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif
#app
    user-select none
    overflow hidden
.clickable
    -webkit-app-region: no-drag;
    user-select: "auto";
/* 滚动条 */
*::-webkit-scrollbar{
    width: 4px;
    height: 4px;
  }

  *::-webkit-scrollbar-thumb{
    background: #aaaaaa;
    border-radius: 4px;
    cursor:pointer;
  }

  *::-webkit-scrollbar-thumb:hover{
    opacity: 1;
    display: block!important;
  }

  *::-webkit-scrollbar-track{
    background-color: transparent;
  }
@font-face {
  /* 重命名字体名 */
  font-family: 'PingFang SC';
  /* 引入字体 */
  src: url('../../../public/fonts/PingFang Medium.ttf');
  font-weight: normal;
  font-style: normal;
}
// .el-button-group
//     width 100%
//     .el-button
//         width 50%
</style>
