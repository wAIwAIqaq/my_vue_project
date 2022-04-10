import { h, ref } from "../../lib/mini-vue.esm.js";
const App = {
  name: "app",
  template: `<div>hi,{{count}}</div>`,
  setup() {
    const count = (window.count = ref(1));
    return {
      count,
    };
  },
};
export { App };
