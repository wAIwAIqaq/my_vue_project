import { createVNode } from "./vnode";

export function createAppAPI (render){
   return  function createApp(rootComponent:any){
    return {
        mount(rootContainer:any){
            //先转化为虚拟节点vnode
            // component => vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer)
        }
    }
}
}


