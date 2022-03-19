import { isObject } from "../shared";
import { mutableHandlers,readonlyHandlers,shallowReadonlyHandlers } from "./baseHandler";
export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadOnly"
}
export  function reactive(raw:any) {
   return createActiveObject(raw, mutableHandlers)
}
export function readonly(raw:any){
    return createActiveObject(raw,readonlyHandlers)
}
export function shallowReadonly(raw:any){
    return createActiveObject(raw,shallowReadonlyHandlers);
}
export function isReactive(value:any){
    return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(value:any){
    return !!value[ReactiveFlags.IS_READONLY]
}
export function isProxy(value:any){
    return isReactive(value) || isReadonly(value)
}
function createActiveObject(target: any, baseHandlers:any){
    if(!isObject(target)){
        console.warn(`target:${target} must be a Object!`)
    }
    return new Proxy(target,baseHandlers)
}