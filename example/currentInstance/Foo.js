import { h, getCurrentInstance } from "../../lib/mini-vue.esm.js";
export const Foo = {
  name: "Foo",
  setup() {},
  setup(props) {
    // 1.setup传入
    // 2.通过this访问到props的值
    // 3.不可以被修改 readonly:shadowReadonly
    // props.count
    props.count++;
    console.log(props);
    const instance = getCurrentInstance();
    console.log(instance);
  },
  render() {
    return h("div", { class: "red" }, "count:" + this.count);
  },
};
