import { h } from "../../lib/mini-vue.esm.js";
export const Child = {
  name: "child",
  setup(props) {},
  render() {
    return h("div", { class: "red" }, "child-porps-msg:" + this.$props.msg);
  },
};
