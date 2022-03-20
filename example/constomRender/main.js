import { createRender } from "../../lib/mini-vue.esm.js";
import { App } from "./App.js";
const containerBox = new PIXI.Application({
  width: 500,
  height: 500,
});
document.body.append(containerBox.view);
const renderer = createRender({
  createElement(type) {
    if (type === "rect") {
      const rect = new PIXI.Graphics();
      rect.beginFill(0xfff0000);
      rect.drawRect(0, 0, 100, 100);
      rect.endFill();
      rect.beginFill(0xfff0000);
      rect.drawRect(200, 0, 100, 100);
      rect.endFill();
      rect.beginFill(0xfff0000);
      rect.drawRect(50, 200, 200, 50);
      rect.endFill();
      return rect;
    }
  },
  patchProp(el, key, val) {
    el[key] = val;
  },
  insert(el, parent) {
    parent.addChild(el);
  },
});

renderer.createApp(App).mount(containerBox.stage);
// pixiJS
// const rootContainer = document.querySelector("#app");

// createApp(App).mount(rootContainer);
