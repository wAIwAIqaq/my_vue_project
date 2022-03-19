import { createVNode } from "./vnode";
import { render } from "./render";
export function createApp(rootComponent:any){
    return {
        mount(rootContainer:any){
            //先转化为虚拟节点vnode
            // component => vnode
            const vnode = createVNode(rootComponent);
            console.log(vnode);
            render(vnode, rootContainer)
        }
    }
}

