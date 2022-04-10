import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componetEmit";
import { proxyRefs } from "../reactivity";

export function createComponentInstance(vnode: any, parent: any) {
  const instance = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    emit: () => {},
  };

  // 初始化赋值emit
  instance.emit = emit.bind(null, instance) as any;
  return instance;
}
export function setupInstance(instance: any) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}
export function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = Component;
  if (setup) {
    setCurrentInstance(instance);
    const setupResult =
      setup && setup(shallowReadonly(instance.props), { emit: instance.emit });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}
export function handleSetupResult(instance: any, setupResult: any) {
  // Object
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }

  finishCompoentSetup(instance);
  // function
}

function finishCompoentSetup(instance: any) {
  const Component = instance.type;
  // compile
  if (compiler && !Component.render) {
    if (Component.template) {
      Component.render = compiler(Component.template);
    }
  }
  instance.render = Component.render;
}

let currentInstance = null;

// getCurrentInstance
export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance: null) {
  currentInstance = instance;
}

let compiler;

export function registerRuntimeComplier(_compiler) {
  compiler = _compiler;
}
