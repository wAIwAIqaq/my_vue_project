import { h, renderSlots } from "../../lib/mini-vue.esm.js";
export const Foo = {
  name: "props",
  setup() {},
  render() {
    const age = 18;
    const foo = h("p", {}, "foo");

    //Foo .vnode.children
    // children isArray ? children : [children];
    // 1.获取到要渲染的元素
    // 2.获取到要渲染的位置
    // 3.作用域插槽
    console.log(this.$slots);
    return h("p", {}, [
      renderSlots(this.$slots, "header", { age }),
      foo,
      renderSlots(this.$slots, "footer", { age }),
    ]);
  },
};
