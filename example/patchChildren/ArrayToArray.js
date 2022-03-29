import { h, ref } from "../../lib/mini-vue.esm.js";

// 1.左侧的对比
//  (a b) c
//  (a b) d e
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
// ];

// 2.右侧的对比
//  a (b c)
//  d e (b c)
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];

// 3.新的比老的长
// 左侧对比
//  (a b)
//  (a b) c d
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];

// 右侧对比
// (a b)
// c d (a b)
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];
// 新的比老的少
// (a b) c d
// (a b)
// 2 3 1
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// a b (c d)
// (c d)
// 0 1 -1
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// const nextChildren = [h("p", { key: "C" }, "C"), h("p", { key: "D" }, "D")];
//  (a,b),c,d,(f, g)
//  (a,b),e,c,(f,g)
const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C", id: "c-prev" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];
const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "C", id: "c-prev" }, "C"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
];
export default {
  name: "ArrayToArray",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return {
      isChange,
    };
  },
  render() {
    const self = this;
    console.log(self.isChange);
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
