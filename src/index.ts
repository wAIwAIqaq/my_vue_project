// mini-vue 出口
export * from "./runtime-dom";

import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";
import { registerRuntimeComplier } from "./runtime-dom";
function complieToFunction(template) {
  const { code } = baseCompile(template);
  const render = new Function("vue", code)(runtimeDom);
  return render;
}
registerRuntimeComplier(complieToFunction);
