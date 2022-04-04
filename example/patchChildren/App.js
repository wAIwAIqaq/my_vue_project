import { h } from "../../lib/mini-vue.esm.js";
import ArrayToText from "./ArrayToText.js";
import TextToText from "./TextToText.js";
import TextToArray from "./TextToArray.js";
import ArrayToArray from "./ArrayToArray.js";
const App = {
  name: "app",
  render() {
    window.self = this;
    return h(
      "div",
      {
        tId: 1,
      },
      [h("p", {}, "主页"), h(ArrayToText)]
    );
  },

  setup() {
    //   composition Api
    return {
      msg: "mini-vue start",
    };
  },
};
export { App };
