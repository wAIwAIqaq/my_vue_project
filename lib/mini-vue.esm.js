var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFULCOMPONENT"] = 2] = "STATEFULCOMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFULCOMPONENT */;
}

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
    return VNode;
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

function initProps(instance, rawProps) {
    // attrs
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
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

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return instance;
}
function setupInstance(instance) {
    // todo
    // initProps()
    initProps(instance, instance.vnode.props);
    // initSlot()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup && setup(shallowReadonly(instance.props));
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

function render(vnode, container) {
    // shapeFlags
    // patch递归
    // 判断是不是一个element类型
    patch(vnode, container);
}
function patch(vnode, container) {
    // todo 判斷是不是一个element
    // 处理组件
    // shapeflag 判断
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFULCOMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // init or update
    mountElement(vnode, container);
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    //children: string array 
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, () => {
                props[key]();
            });
        }
        else {
            const val = props[key];
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function mountChildren(children, container) {
    children.forEach((child) => {
        patch(child, container);
    });
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupInstance(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    //vnode => patch
    // vnode => element => mountElement
    patch(subTree, container);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //先转化为虚拟节点vnode
            // component => vnode
            const vnode = createVNode(rootComponent);
            console.log(vnode);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
