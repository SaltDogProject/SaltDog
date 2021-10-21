import { createApp } from "vue";
import App from "./renderer/App.vue";
import router from "./renderer/router";
import store from "./renderer/store";
// global use element-plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus, {
    zIndex: 3000,
    size: "small",
  })
  .mount("#app");
