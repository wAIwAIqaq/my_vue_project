import { baseParse } from "../src/parse";
import { generate } from "../src/codegen";
import { transform } from "../src/transform";
import { transformExpression } from "../src/transforms/transfromExpression";
import { transformElement } from "../src/transforms/transformElement";
import { transformText } from "../src/transforms/transformText";
describe("codegen", () => {
  it("string", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generate(ast);
    // 快照测试
    //1.抓bug
    //2.有意更新，主动更新快照 -u
    expect(code).toMatchSnapshot();
  });

  it("interpolation", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    const { code } = generate(ast);
    // 快照测试
    //1.抓bug
    //2.有意更新，主动更新快照 -u
    expect(code).toMatchSnapshot();
  });

  it("element", () => {
    const ast: any = baseParse("<div>hi,{{message}}</div>");
    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText],
    });
    const { code } = generate(ast);
    // 快照测试
    //1.抓bug
    //2.有意更新，主动更新快照 -u
    expect(code).toMatchSnapshot();
  });
});
