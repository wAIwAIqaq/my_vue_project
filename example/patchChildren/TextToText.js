import { h, ref } from "../../lib/mini-vue.esm.js";

const nextChildren = "newChildren";
const prevChildren = "oldChildren";

export default {
  name: "TextToText",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return {
      isChange,
    };
  },
  render() {
    const self = this;
    console.log(self.isChange);
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
