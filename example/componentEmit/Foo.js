import { h } from "../../lib/mini-vue.esm.js";
export const Foo = {
  name: "props",
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log("emit add");
      emit("add", 1, 2);
      emit("add-foo");
    };
    return { emitAdd };
  },
  render() {
    const btn = h("button", { onClick: this.emitAdd }, "emitAdd");
    const foo = h("p", {}, "Foo");
    return h("p", {}, [foo, btn]);
  },
};
