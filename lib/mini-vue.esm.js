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
        component: null,
        next: null,
        key: props === null || props === void 0 ? void 0 : props.key,
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
        if (typeof children === "object") {
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

let activeEffect;
let shouldTrack = false;
const targetMap = new Map();
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        activeEffect = undefined;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function track(target, key) {
    if (!isTracking()) {
        return;
    }
    // target => key => dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 判断dep是不是已经添加了这个activeEffect
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
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
function effect(fn, options = {}) {
    //fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    // Object.assign(_effect,options);
    //extend
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}

class RefImp {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        // 判断value是不是 一个对象
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 判断value的值是否修改 对比的时候应该是两个Object对象而不是Proxy对象
        if (!hasChanged(this._rawValue, newValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
        return;
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImp(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRef) {
    return new Proxy(objectWithRef, withRefHandlers);
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
        if (!isReadonly) {
            track(target, key);
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
// get => age(ref包裹) 返回 .value
// 如果没有被ref包裹 返回 本身的值
const withRefHandlers = {
    get(target, key) {
        return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
        if (isRef(target[key]) && !isRef(value)) {
            return target[key].value = value;
        }
        else {
            return Reflect.set(target, key, value);
        }
    }
};

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

function toDisplayString(value) {
    return String(value);
}

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const isString = (val) => typeof val === "string";
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const convert = (newValue) => {
    return isObject(newValue) ? reactive(newValue) : newValue;
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
    $props: i => i.props
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
        isMounted: false,
        emit: () => { },
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
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishCompoentSetup(instance);
    // function
}
function finishCompoentSetup(instance) {
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
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeComplier(_compiler) {
    compiler = _compiler;
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

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJob(job) {
    if (!queue.includes(job)) {
        queue.push(job);
    }
    queueFlash();
}
function queueFlash() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while (job = queue.shift()) {
        job && job();
    }
}

function createRender(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, setElementArray: hostSetElementArray, } = options;
    function render(vnode, container) {
        // shapeFlags
        // patch递归
        // 判断是不是一个element类型
        patch(null, vnode, container);
    }
    function patch(n1, n2, container, parentComponent = null, anchor = null) {
        // todo 判断是不是一个element
        // 处理组件
        // shapeflag 判断
        const { type, shapeFlag } = n2;
        // Fragment => 只渲染children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // init
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            // update
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    const EMPTY_OBJ = {};
    function patchElement(n1, n2, container, parentComponent, anchor) {
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (nextShapeFlag & 4 /* TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // array => text
                // 1.把老的children清空
                unmountChildren(c1);
                // 2.set 新的textchildren
                // 如果 n1.children !== n2.children 则直接把n2的文本值设置为container的textContent
                // text => text 同时需执行以下
                hostSetElementText(container, c2);
            }
            else {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                // array => text
                // 1.把容器的文本内容清空
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent);
            }
            else {
                // array diff => array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        console.log("patch child");
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        const l2 = c2.length;
        // 左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            // 新的比老的多
            if (i <= e2) {
                // 如果是这种情况的话就说明 e2 也就是新节点的数量大于旧节点的数量
                // 也就是说新增了 vnode
                // 应该循环 c2
                // 锚点的计算：新的节点有可能需要添加到尾部，也可能添加到头部，所以需要指定添加的问题
                // 要添加的位置是当前的位置(e2 开始)+1
                // 因为对于往左侧添加的话，应该获取到 c2 的第一个元素
                // 所以我们需要从 e2 + 1 取到锚点的位置
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while (i <= e2) {
                    console.log(`需要新创建一个 vnode: ${c2[i].key}`);
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 新的比老的少
            const anchorIndex = i + e1 - e2;
            while (i < anchorIndex) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间对比
            let s1 = i;
            let s2 = i;
            let isPatchedCount = 0;
            const toBePatched = e2 - s2 + 1;
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched);
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0;
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (isPatchedCount >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    isPatchedCount++;
                }
            }
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    // 如果判断需要moved
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log(anchor);
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    // 获取最长递增子序列算法
    function getSequence(arr) {
        const p = arr.slice();
        const result = [0];
        let i, j, u, v, c;
        const len = arr.length;
        for (i = 0; i < len; i++) {
            const arrI = arr[i];
            if (arrI !== 0) {
                j = result[result.length - 1];
                if (arr[j] < arrI) {
                    p[i] = j;
                    result.push(i);
                    continue;
                }
                u = 0;
                v = result.length - 1;
                while (u < v) {
                    c = (u + v) >> 1;
                    if (arr[result[c]] < arrI) {
                        u = c + 1;
                    }
                    else {
                        v = c;
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1];
                    }
                    result[u] = i;
                }
            }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
            result[u] = v;
            v = p[v];
        }
        return result;
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            // remove
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        // 两个props Object判断不相等？
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key] ? oldProps[key] : null;
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function processComponent(n1, n2, container, parentComponent) {
        if (!n1) {
            mountComponent(n2, container, parentComponent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            console.log("组件更新", n1, n2);
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            n2.vnode = n2;
        }
    }
    function updateComponentPreRender(instance, nextVNode) {
        instance.vnode = nextVNode;
        instance.next = null;
        instance.props = nextVNode.props;
    }
    function processFragment(n1, n2, container, parentComponent) {
        // Implement
        mountChildren(n2.children, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function mountElement(vnode, container, parentComponent, anchor) {
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
            hostPatchProp(el, key, null, val);
        }
        // container.append(el);
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach((child) => {
            patch(null, child, container, parentComponent);
        });
    }
    function mountComponent(initalVNode, container, parentComponent) {
        const instance = (initalVNode.component = createComponentInstance(initalVNode, parentComponent));
        setupInstance(instance);
        setupRenderEffect(instance, initalVNode, container);
    }
    function setupRenderEffect(instance, initalVNode, container) {
        // 拆分更新与初始化
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                // vnode => patch
                // vnode => element => mountElement
                patch(null, subTree, container, instance);
                // element => mounted
                initalVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { proxy, next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const prevSubTree = instance.subTree;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                // vnode => patch
                // vnode => element => mountElement
                patch(prevSubTree, subTree, container, instance);
                // element => mounted
                initalVNode.el = subTree.el;
            }
        }, {
            scheduler() {
                console.log("update-----scheduler");
                queueJob(instance.update);
            },
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, () => {
            nextVal();
        });
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor = null) {
    console.log('insert', child);
    parent.insertBefore(child, anchor);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
function setElementArray(el, children) {
    console.log(el);
    console.log(children);
}
const render = createRender({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
    setElementArray
});
function createApp(...args) {
    return render.createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    createAppAPI: createAppAPI,
    h: h,
    renderSlots: renderSlots,
    createTextVNode: createTextVNode,
    createElementVNode: createVNode,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeComplier: registerRuntimeComplier,
    inject: inject,
    provide: provide,
    createRender: createRender,
    nextTick: nextTick,
    toDisplayString: toDisplayString,
    ref: ref,
    proxyRefs: proxyRefs
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const CREATE_ELEMENT_VNODE = Symbol("createElementVNode");
const helperMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREATE_ELEMENT_VNODE]: "createElementVNode",
};

var NodeTypes;
(function (NodeTypes) {
    NodeTypes["INTERPOLATION"] = "interpolation";
    NodeTypes["SIMPLE_EXPRESSION"] = "simple_expression";
    NodeTypes["ELEMENT"] = "element";
    NodeTypes["TEXT"] = "text";
    NodeTypes["ROOT"] = "root";
    NodeTypes["COMPOUND_EXPRESSION"] = "compound_expression";
})(NodeTypes || (NodeTypes = {}));
function createVNodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: NodeTypes.ELEMENT,
        tag,
        props,
        children,
    };
}

var TagsType;
(function (TagsType) {
    TagsType["START"] = "start";
    TagsType["END"] = "end";
})(TagsType || (TagsType = {}));
function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isLoopEnd(context, ancestors)) {
        let node;
        const s = context.source;
        if (s.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (s[0] === "<") {
            if (/[a-z]/.test(s[1])) {
                node = parseElement(context, ancestors);
            }
        }
        else {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isLoopEnd(context, ancestors) {
    //1.source 为空
    const s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
        return true;
    }
    //2.碰到结束标签
    return !s;
}
function parseText(context) {
    let endTokens = ["{{", "<"];
    let endIndex = context.source.length;
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && index < endIndex) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: NodeTypes.TEXT,
        content,
    };
}
function parseTextData(context, length) {
    const rawText = context.source.slice(0, length);
    advanceBy(context, length);
    return rawText;
}
function parseElement(context, ancestors) {
    //Implement
    //1.解析
    const element = parseTag(context, "start" /* START */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, "end" /* END */);
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    return element;
}
function startsWithEndTagOpen(source, tag) {
    return (source.startsWith("</") &&
        source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase());
}
function parseTag(context, type) {
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];
    //2.删除处理完成的代码
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    if (type === "end" /* END */)
        return;
    return {
        type: NodeTypes.ELEMENT,
        tag,
    };
}
function parseInterpolation(context) {
    // {{message}}
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advanceBy(context, openDelimiter.length);
    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContent = context.source.slice(0, rawContentLength);
    const content = rawContent.trim();
    advanceBy(context, rawContentLength + closeDelimiter.length);
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content,
        },
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function createRoot(children) {
    return {
        children,
        type: NodeTypes.ROOT,
    };
}
function createParserContext(content) {
    return {
        source: content,
    };
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    // 1.深度优先搜索
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type === NodeTypes.ELEMENT && child.codegenNode) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = child;
    }
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || {},
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        },
    };
    return context;
}
function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms;
    const exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING);
            break;
        case NodeTypes.ROOT:
            tranverseChildren(node, context);
            break;
        case NodeTypes.ELEMENT:
            tranverseChildren(node, context);
            break;
    }
    // 退出流程
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function tranverseChildren(node, context) {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
}

function generate(ast) {
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
        case NodeTypes.ELEMENT:
            getElement(node, context);
            break;
        case NodeTypes.COMPOUND_EXPRESSION:
            getCompoundExpression(node, context);
            break;
    }
}
function getFunctionPreamble(context, ast) {
    const { push, helper } = context;
    const vueBinging = "vue";
    const aliasHelpers = (s) => `${helper(s)}:_${helper(s)}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelpers).join(", ")} } = ${vueBinging}`);
    }
    push("\n");
}
function genText(node, context) {
    const { push } = context;
    push(`"${node.content}"`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`_${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function getExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
function getElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    push(`_${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullalbe([tag, props, children]), context);
    // genNode(children, context);
    push(")");
}
function getCompoundExpression(node, context) {
    const { children } = node;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genNullalbe(args) {
    return args.map((arg) => arg || "null");
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(",");
        }
    }
}

function transformElement(node, context) {
    if (node.type === NodeTypes.ELEMENT) {
        return () => {
            // 中间处理层
            // tag
            const vnodeTag = `"${node.tag}"`;
            // props
            let vnodeProps;
            //children
            const { children } = node;
            let vnodeChildren = children[0];
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    }
}

function transformExpression(node) {
    if (node.type === NodeTypes.INTERPOLATION) {
        return () => {
            node.content = processExpression(node.content);
        };
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return node.type === NodeTypes.TEXT || NodeTypes.INTERPOLATION;
}

function transformText(node) {
    const { children } = node;
    if (node.type === NodeTypes.ELEMENT) {
        return () => {
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: NodeTypes.COMPOUND_EXPRESSION,
                                    children: [child],
                                };
                            }
                            currentContainer.children.push(" + ");
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText],
    });
    return generate(ast);
}

// mini-vue 出口
function complieToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("vue", code)(runtimeDom);
    return render;
}
registerRuntimeComplier(complieToFunction);

export { createApp, createAppAPI, createVNode as createElementVNode, createRender, createTextVNode, getCurrentInstance, h, inject, nextTick, provide, proxyRefs, ref, registerRuntimeComplier, renderSlots, toDisplayString };
