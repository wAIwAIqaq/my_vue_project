import { NodeTypes } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(ast) {
  const context = codegenContext();
  const { push } = context;

  getFunctionPreamble(context, ast);

  push("return ");
  const functionName = "render";
  const args = ["_ctx,_cache"];
  const signature = args.join(", ");
  push(`function ${functionName}(${signature}){return `);
  genNode(ast.codegenNode, context);
  push("}");
  return {
    code: context.code,
  };
}

function codegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `${helperMapName[key]}`;
    },
  };
  return context;
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      getExpression(node, context);
      break;
    default:
      break;
  }
}
function getFunctionPreamble(context, ast) {
  const { push, helper } = context;
  const vueBinging = "vue";
  const aliasHelpers = (s) => `${helper(s)}:_${helper(s)}`;
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelpers).join(", ")} } = ${vueBinging}`
    );
  }
  push("\n");
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`_${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}
function getExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}
