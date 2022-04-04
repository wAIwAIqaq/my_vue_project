import { hasOwn } from "../shared";

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: i => i.slots,
    $props: i => i.props
}

export const PublicInstanceProxyHandlers = {
    get({_:instance}: any, key: string){
        // setupState
        const {setupState,props} = instance;
        if(hasOwn(setupState,key)){
            return setupState[key];
        }else if (hasOwn(props,key)){
            return props[key];
        }

        const publicGetter = publicPropertiesMap[key];
        if(publicGetter){
            return publicGetter(instance);
        }
    }
}