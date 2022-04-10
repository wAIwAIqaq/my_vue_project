export function generate(ast) {
  const context = codegenContext();
  const { push } = context;
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
  };
  return context;
}

function genNode(node, context) {
  const { push } = context;
  push(`'${node.content}'`);
}
