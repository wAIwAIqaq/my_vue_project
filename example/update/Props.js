import { h } from "../../lib/mini-vue.esm.js";
export const Foo = {
  name: "props",
  setup(props) {
    // 1.setup传入
    // 2.通过this访问到props的值
    // 3.不可以被修改 readonly:shadowReadonly
    // props.count
    props.count++;
    console.log(props);
  },
  render() {
    return h("div", { class: "red" }, "count:" + this.count);
  },
};
