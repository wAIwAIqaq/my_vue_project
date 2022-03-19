import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Props.js";
window.self = null;
const App = {
  name: "app",
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      [
        h("p", { class: "blue" }, "hello"),
        h(
          "button",
          {
            class: "green",
            onClick() {
              window.alert("I'm clicked");
            },
          },
          "minivue"
        ),
        // this.$el => get root element
        h("div", { class: "red" }, "hi," + this.msg),
        h(Foo, { count: 1 }),
      ]
    );
  },

  setup() {
    //   composition Api
    return {
      msg: "mini-vue start",
    };
  },
};
export { App };
