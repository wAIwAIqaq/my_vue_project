import { h, provide, inject } from "../../lib/mini-vue.esm.js";

const Provider = {
  name: "Provider",
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(ProviderTwo)]);
  },
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
};

const ProviderTwo = {
  name: "Provider",
  render() {
    return h("div", {}, [h("p", {}, `Provider - ${this.foo}`), h(Consumer)]);
  },
  setup() {
    provide("foo", "fooValTwo");
    const foo = inject("foo");
    return { foo };
  },
};

const Consumer = {
  name: "Comsumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", "bazDefault");
    return { foo, bar, baz };
  },
  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz}`);
  },
};

const App = {
  name: "app",
  render() {
    return h("div", {}, [h(Provider)]);
  },
  setup() {},
};
export { App };
