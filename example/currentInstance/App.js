import { h, getCurrentInstance } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.self = null;
const App = {
  name: "app",
  render() {
    return h("div", {}, [h("p", {}, "currentInstance"), h(Foo, { count: 1 })]);
  },

  setup() {
    const instance = getCurrentInstance();
    console.log("App:", instance);
  },
};
export { App };
