import { createVNode } from "./vnode";
export function h(type:String, props?:Object, children?:any){
    return createVNode(type, props, children);
}