import { h, ref } from "../../lib/mini-vue.esm.js";
import { Child } from "./Child.js";
window.self = null;
const App = {
  name: "app",
  setup() {
    const msg = ref("123");
    const count = ref(1);
    window.msg = msg;

    const changeChildProps = () => {
      msg.value = "456";
    };
    const changeCount = () => {
      count.value++;
    };
    return {
      msg,
      count,
      changeChildProps,
      changeCount,
    };
  },
  render() {
    // this.count get this.count.value
    return h("div", {}, [
      h("div", {}, "哈喽"),
      h("button", { onClick: this.changeChildProps }, "change child props"),
      h(Child, { msg: this.msg }),
      h("button", { onClick: this.changeCount }, "change count"),
      h("p", {}, "count:" + this.count),
    ]);
  },
};
export { App };
