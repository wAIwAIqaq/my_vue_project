import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupInstance } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment,Text } from "./vnode";

export function createRender(options){
   const { createElement:hostCreateElement, patchProp:hostPatchProp, insert:hostInsert} = options;

   function render(vnode:any,container:any){
     // shapeFlags
      // patch递归
      // 判断是不是一个element类型
      patch(vnode, container);
   }

   function patch(vnode:any, container:any,parentComponent:any = null){
      // todo 判斷是不是一个element
      // 处理组件
      // shapeflag 判断
      const {type,shapeFlag} = vnode;
      // Fragment => 只渲染children
      switch(type) {
         case Fragment:
            processFragment(vnode, container,parentComponent);
            break;
         case Text:
            processText(vnode,container);
            break;
         default:
            if(shapeFlag & ShapeFlags.ELEMENT){
               processElement(vnode, container,parentComponent);
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
               processComponent(vnode, container, parentComponent)
            }
            break;
      }
   }

   function processElement(vnode: any, container: any,parentComponent) {
      // init or update
      mountElement(vnode,container,parentComponent);
   }
   
   function processComponent(vnode:any, container:any,parentComponent){
      mountComponent(vnode,container,parentComponent)
   }
   
   function processFragment(vnode:any, container:any,parentComponent){
      // Implement
      mountChildren(vnode.children, container, parentComponent);
   }
   
   function processText(vnode:any,container){
      const {children} = vnode;
      const textNode = vnode.el = document.createTextNode(children);
      container.append(textNode);
   }
   
   function mountElement(vnode: any, container: any ,parentComponent) {
      // canvas
      // new Element()
      // createElement()
      const el = (vnode.el = hostCreateElement(vnode.type));
      // const el = (vnode.el = document.createElement(vnode.type));
   
      //children: string array 
      const {children,shapeFlag} = vnode;
      if( shapeFlag & ShapeFlags.TEXT_CHILDREN ){
         el.textContent = children;
      } else if( shapeFlag & ShapeFlags.ARRAY_CHILDREN){
         mountChildren(children,el,parentComponent);
      }
      // props
      const {props} = vnode;
      // patch Prop
      
      for (const key in props) {
         const val = props[key]
         hostPatchProp(el,key,val);
      }

      // container.append(el);
      hostInsert(el,container);
   }
   
   function mountChildren(children: any[],container: any,parentComponent){
      children.forEach((child: any) => {
         patch(child,container, parentComponent);
      })
   }
   
   function mountComponent(initalVNode:any,container:any,parentComponent:any){
      const instance = createComponentInstance(initalVNode,parentComponent);
      setupInstance(instance);
      setupRenderEffect(instance,initalVNode,container)
   }
   
   function setupRenderEffect(instance: any,initalVNode,container:any) {
      const { proxy } = instance;
      const subTree = instance.render.call(proxy);
      //vnode => patch
      // vnode => element => mountElement
      patch(subTree,container,instance)
      // element => mounted
      initalVNode.el = subTree.el
   }

   return {
      createApp: createAppAPI(render)
   }
}

