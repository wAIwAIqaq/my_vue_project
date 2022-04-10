import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export enum NodeTypes {
  INTERPOLATION = "interpolation",
  SIMPLE_EXPRESSION = "simple_expression",
  ELEMENT = "element",
  TEXT = "text",
  ROOT = "root",
  COMPOUND_EXPRESSION = "compound_expression",
}

export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
