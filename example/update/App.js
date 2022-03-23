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
    const props = ref({
      foo: "foo",
      bar: "bar",
    });
    const onChangePropsDemo1 = () => {
      props.value.foo = "new foo";
    };
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined;
    };
    const onChangePropsDemo3 = () => {
      props.value = { foo: "foo" };
    };
    return {
      count,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      props,
    };
  },
  render() {
    // this.count get this.count.value
    return h(
      "div",
      {
        id: "root",
        ...this.props,
      },
      [
        h("div", {}, "count:" + this.count),
        h("p", {}, this.props),
        h("button", { onClick: this.onClick }, "Click"),
        h(
          "button",
          { onClick: this.onChangePropsDemo1 },
          "ChangePropsDemo1 修改值"
        ),
        h(
          "button",
          { onClick: this.onChangePropsDemo2 },
          "ChangePropsDemo2 修改成undifined"
        ),
        h(
          "button",
          { onClick: this.onChangePropsDemo3 },
          "ChangePropsDemo3 删除值"
        ),
      ]
    );
  },
};
export { App };
