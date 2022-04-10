export { createAppAPI } from "./createApp";
export { h } from "./h";
export { renderSlots } from "./helpers/renderSlots";
export { createTextVNode, createElementVNode } from "./vnode";
export { getCurrentInstance, registerRuntimeComplier } from "./component";
export { inject, provide } from "./apiInject";
export { createRender } from "./render";
export { nextTick } from "./scheduler";
export { toDisplayString } from "../shared";
// 模块适应vue设计层级 compile 与 runtime-dom => runtime-core => reactivity
export * from "../reactivity";
