import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../lib/mini-vue.esm.js";
window.self = null;
const App = {
  name: "app",
  setup() {
    const count = ref(1);
    const instance = getCurrentInstance();
    function onClick() {
      for (let i = 0; i < 100; i++) {
        console.log("update");
        count.value = i;
      }
      nextTick(() => {
        console.log(instance);
      });
      // await nextTick()
      // console.log(instance);
    }
    return {
      onClick,
      count,
    };
  },
  render() {
    const btn = h("button", { onClick: this.onClick }, "update");
    const p = h("p", {}, "count:" + this.count);
    return h(
      "div",
      {
        id: "root",
      },
      [btn, p]
    );
  },
};
export { App };
