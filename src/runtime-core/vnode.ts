import { ShapeFlags, getShapeFlag } from "../shared/shapeFlags";
export { createVNode as createElementVNode };
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVNode(type: any, props?: any, children?: any) {
  const VNode = {
    el: null,
    type,
    props: props || {},
    children,
    component: null,
    next: null,
    key: props?.key,
    shapeFlag: getShapeFlag(type),
  };
  // children?
  if (typeof children === "string") {
    VNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    VNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  if (VNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      VNode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }
  return VNode;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}
