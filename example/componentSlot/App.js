import { h, createTextVNode } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";
window.self = null;
const App = {
  name: "app",
  render() {
    const app = h("div", {}, "App");
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h("p", {}, "header" + age),
          createTextVNode("textNode"),
        ],
        footer: ({ age }) => h("p", {}, "footer" + age),
      }
    );
    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};
export { App };
