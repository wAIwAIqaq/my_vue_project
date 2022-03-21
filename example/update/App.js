import { h, ref } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Props.js";
window.self = null;
const App = {
  name: "app",
  setup() {
    const count = ref(0);

    const onClick = () => {
      count.value++;
    };
    return {
      count,
      onClick,
    };
  },
  render() {
    // this.count get this.count.value
    return h(
      "div",
      {
        id: "root",
      },
      [
        h("div", {}, "count:" + this.count),
        h("button", { onClick: this.onClick }, "Click"),
      ]
    );
  },
};
export { App };
