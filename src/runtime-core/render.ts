import { isOn } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupInstance } from "./component";

export function render(vnode:any,container:any){
   // shapeFlags
    // patch递归
    // 判断是不是一个element类型
    patch(vnode, container);
}
function patch(vnode:any, container:any){
   // todo 判斷是不是一个element
   // 处理组件
   // shapeflag 判断
   const {shapeFlag} = vnode;
   if(shapeFlag & ShapeFlags.ELEMENT){
      processElement(vnode, container);
   } else if(shapeFlag & ShapeFlags.STATEFULCOMPONENT){
      processComponent(vnode, container)
   }
}

function processElement(vnode: any, container: any) {
   // init or update
   mountElement(vnode,container);
}

function processComponent(vnode:any, container:any){
   mountComponent(vnode,container)
}

function mountElement(vnode: any, container: any) {
   const el = (vnode.el = document.createElement(vnode.type));
   //children: string array 
   const {children,shapeFlag} = vnode;
   if( shapeFlag & ShapeFlags.TEXT_CHILDREN ){
      el.textContent = children;
   } else if( shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(children,el);
   }
   // props
   const {props} = vnode;
   for (const key in props) {
      if(isOn(key)){
         const event = key.slice(2).toLocaleLowerCase();
         el.addEventListener(event,()=>{
            props[key]();
         });
      }else{
         const val = props[key];
         el.setAttribute(key,val);
      }
   }
   container.append(el);
}
function mountChildren(children: any[],container: any){
   children.forEach((child: any) => {
      patch(child,container);
   })
}
function mountComponent(vnode:any,container:any){
   const instance = createComponentInstance(vnode);
   setupInstance(instance);
   setupRenderEffect(instance,container)
}

function setupRenderEffect(instance: any,container:any) {
   const { proxy } = instance;
   const subTree = instance.render.call(proxy);
   //vnode => patch
   // vnode => element => mountElement
   patch(subTree,container)
}



