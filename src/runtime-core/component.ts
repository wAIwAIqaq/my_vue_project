import { initProps } from "./componentProps";
import {PublicInstanceProxyHandlers} from './componentPublicInstance';
import { shallowReadonly } from "../reactivity/reactive";
export function createComponentInstance(vnode:any){
    const  instance = {
        vnode,
        type:vnode.type,
        setupState:{}
    }
    return instance
}
export function setupInstance(instance: any){
    // todo
    // initProps()
    initProps(instance,instance.vnode.props);
    // initSlot()

    setupStatefulComponent(instance)
}
export function setupStatefulComponent(instance: any){
    const Component = instance.type;

    instance.proxy = new Proxy({_:instance},PublicInstanceProxyHandlers);
    
    const {setup} = Component;
    if(setup){
        const setupResult = setup && setup(shallowReadonly(instance.props));
        handleSetupResult(instance,setupResult)
    }

}
export function handleSetupResult(instance:any,setupResult:any){
    // Object
    if(typeof setupResult === 'object'){
        instance.setupState = setupResult;
    }

    finishCompoentSetup(instance)
    // function
     
}

function finishCompoentSetup(instance: any) {
    const Component = instance.type
    instance.render = Component.render
}
