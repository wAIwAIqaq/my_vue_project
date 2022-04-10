import { baseParse } from "./parse";
import { transform } from "./transform";
import { generate } from "./codegen";
import { transformElement } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transfromExpression";
import { transformText } from "./transforms/transformText";

export function baseCompile(template) {
  const ast: any = baseParse(template);
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  });
  return generate(ast);
}
