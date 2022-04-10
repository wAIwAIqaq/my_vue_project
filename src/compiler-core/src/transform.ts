import { NodeTypes } from "./ast";

export function transform(root, options) {
  const context = createTransformContext(root, options);
  // 1.深度优先搜索
  traverseNode(root, context);
  // 2.修改text content
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || {},
  };
  return context;
}

function traverseNode(node, context) {
  console.log(node);
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }
  tranverseChildren(node, context);
}

function tranverseChildren(node, context) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}
