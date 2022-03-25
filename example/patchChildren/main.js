import { createApp } from "../../lib/mini-vue.esm.js";
import { App } from "./App.js";
const rootContainer = document.querySelector("#app");
console.log("app vnode", App);
createApp(App).mount(rootContainer);
