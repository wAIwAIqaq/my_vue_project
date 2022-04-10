import { baseParse } from "../src/parse";
import { generate } from "../src/codegen";
import { transform } from "../src/transform";
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
});
