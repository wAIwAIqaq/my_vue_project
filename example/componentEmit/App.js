import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.self = null;
const App = {
  name: "app",
  render() {
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        //on + 事件名
        onAdd(a, b) {
          console.log("onAdd", a, b);
        },
        onAddFoo() {
          console.log("onAddFoo");
        },
      }),
    ]);
  },

  setup() {
    return {};
  },
};
export { App };
