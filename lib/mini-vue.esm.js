var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const VNode = {
        el: null,
        type,
        props: props || {},
        children,
        shapeFlag: getShapeFlag(type),
    };
    // children?
    if (typeof children === "string") {
        VNode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        VNode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (VNode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            VNode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return VNode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                //先转化为虚拟节点vnode
                // component => vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        // function 
        if (typeof slot === 'function') {
            //children 不可以有 array
            // 只需要把 children
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function initProps(instance, rawProps) {
    // attrs
    instance.props = rawProps || {};
}

function initSlots(instance, children) {
    //    instance.slots = Array.isArray(children) ? children : [children];
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadOnly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        // 判断shallow 直接返回res
        if (isShallow)
            return res;
        // 判断 res是不是一个Object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter(isReadonly = false) {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        if (!isReadonly) {
            // trigger 触发依赖
            trigger(target, key);
        }
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`${target} is readonly,could't set ${key}!`, target);
        return true;
    }
};
const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadOnly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target:${target} must be a Object!`);
    }
    return new Proxy(target, baseHandlers);
}

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const isOn = (event) => {
    return /^on[A-Z]/.test(event);
};
const hasOwn = (properties, key) => {
    return Object.prototype.hasOwnProperty.call(properties, key);
};
// TPP 先写一个特定的行为 再重构成一个通用的行为
// add => Add
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandleKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};
// add-foo => addFoo
const cameLize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: i => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function emit(instance, event, ...args) {
    // instance.props => event
    const { props } = instance;
    const handlerName = toHandleKey(event);
    const handler = props[cameLize(handlerName)];
    handler && handler(...args);
}

function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { }
    };
    // 初始化赋值emit
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupInstance(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup && setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // Object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishCompoentSetup(instance);
    // function
}
function finishCompoentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
// getCurrentInstance
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // set
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // 把provide的原型指向parentProvides
        // init 的时候执行
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // get
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        // shapeFlags
        // patch递归
        // 判断是不是一个element类型
        patch(vnode, container);
    }
    function patch(vnode, container, parentComponent = null) {
        // todo 判斷是不是一个element
        // 处理组件
        // shapeflag 判断
        const { type, shapeFlag } = vnode;
        // Fragment => 只渲染children
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    function processElement(vnode, container, parentComponent) {
        // init or update
        mountElement(vnode, container, parentComponent);
    }
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    function processFragment(vnode, container, parentComponent) {
        // Implement
        mountChildren(vnode.children, container, parentComponent);
    }
    function processText(vnode, container) {
        const { children } = vnode;
        const textNode = vnode.el = document.createTextNode(children);
        container.append(textNode);
    }
    function mountElement(vnode, container, parentComponent) {
        // canvas
        // new Element()
        // createElement()
        const el = (vnode.el = hostCreateElement(vnode.type));
        // const el = (vnode.el = document.createElement(vnode.type));
        //children: string array 
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            mountChildren(children, el, parentComponent);
        }
        // props
        const { props } = vnode;
        // patch Prop
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        // container.append(el);
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((child) => {
            patch(child, container, parentComponent);
        });
    }
    function mountComponent(initalVNode, container, parentComponent) {
        const instance = createComponentInstance(initalVNode, parentComponent);
        setupInstance(instance);
        setupRenderEffect(instance, initalVNode, container);
    }
    function setupRenderEffect(instance, initalVNode, container) {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        //vnode => patch
        // vnode => element => mountElement
        patch(subTree, container, instance);
        // element => mounted
        initalVNode.el = subTree.el;
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    console.log("createElement——————————");
    return document.createElement(type);
}
function pathProp(el, key, val) {
    console.log("patchProp——————————————");
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, () => {
            val();
        });
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    console.log("insert—————————————————");
    parent.append(el);
}
const render = createRender({
    createElement,
    pathProp,
    insert
});
function createApp(...args) {
    return render.createApp(...args);
}

export { createApp, createAppAPI, createRender, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
