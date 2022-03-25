import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupInstance } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment,Text } from "./vnode";

export function createRender(options){
   const { 
      createElement:hostCreateElement,
      patchProp:hostPatchProp,
      insert:hostInsert, 
      remove:hostRemove,
      setElementText: hostSetElementText,
      setElementArray: hostSetElementArray
   } = options;
   
   function render(vnode:any,container:any){
     // shapeFlags
      // patch递归
      // 判断是不是一个element类型
      patch(null, vnode, container);
   }

   function patch(n1, n2:any, container:any,parentComponent:any = null){
      // todo 判断是不是一个element
      // 处理组件
      // shapeflag 判断
      const {type,shapeFlag} = n2;
      // Fragment => 只渲染children
      switch(type) {
         case Fragment:
            processFragment(n1, n2, container, parentComponent);
            break;
         case Text:
            processText(n1, n2, container);
            break;
         default:
            if(shapeFlag & ShapeFlags.ELEMENT){
               processElement(n1, n2, container, parentComponent);
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
               processComponent(n1, n2, container, parentComponent)
            }
            break;
      }
   }

   function processElement(n1, n2: any, container: any,parentComponent) {
      if(!n1){
         // init
         mountElement(n2,container,parentComponent);
      }else{
         // update
         patchElement(n1 ,n2, container, parentComponent)
      }
      
      
   }
   const EMPTY_OBJ = {};
   function patchElement(n1, n2, container,parentComponent){
      const oldProps = n1.props || EMPTY_OBJ;
      const newProps = n2.props || EMPTY_OBJ;
      const el = (n2.el = n1.el);
      patchChildren(n1, n2, el, parentComponent);
      patchProps(el,oldProps,newProps);
   }

   function patchChildren(n1, n2, container, parentComponent){
      const prevShapeFlag = n1.shapeFlag;
      const nextShapeFlag = n2.shapeFlag;
      if(nextShapeFlag & ShapeFlags.TEXT_CHILDREN){
          if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
             // array => text
             // 1.把老的children清空 
             unmountChildren(n1.children);
             // 2.set 新的textchildren
             // 如果 n1.children !== n2.children 则直接把n2的文本值设置为container的textContent
             // text => text 同时需执行以下
             if(n1.children !== n2.children){
               hostSetElementText(container, n2.children)
             }
          }
      }else{
         if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
            // array => text
            // 1.把容器的文本内容清空
            hostSetElementText(container,'');
            mountChildren(n2.children,container,parentComponent);
         } else {
           // array => array
           unmountChildren(n1.children);
           mountChildren(n2.children,container,parentComponent);
         }
      }
   }
   
   function unmountChildren(children){
      for(let i= 0; i<children.length;i++){
         const el = children[i].el;
         // remove
         hostRemove(el);
      }
   }
   function patchProps(el,oldProps, newProps){
      if(oldProps !== newProps){
         for (const key in newProps) {
            const prevProp = oldProps[key] ? oldProps[key] : null;
            const nextProp = newProps[key];
            if(prevProp !== nextProp){
              hostPatchProp(el,key,prevProp,nextProp)
            }
         }
         if(oldProps !== EMPTY_OBJ){
            for (const key in oldProps) {
               if(!(key in newProps)){
                  hostPatchProp(el,key,oldProps[key],null)
               }
            }
         }
        
      }
   }

   function processComponent(n1, n2:any, container:any,parentComponent){
      mountComponent(n2,container, parentComponent)
   }
   
   function processFragment(n1, n2:any, container:any,parentComponent){
      // Implement
      mountChildren(n2.children, container, parentComponent);
   }
   
   function processText(n1, n2:any,container){
      const {children} = n2;
      const textNode = n2.el = document.createTextNode(children);
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
         hostPatchProp(el,key,null,val);
      }

      // container.append(el);
      hostInsert(el,container);
   }
   
   function mountChildren(children: any[],container: any,parentComponent){
      children.forEach((child: any) => {
         patch(null, child, container, parentComponent);
      })
   }
   
   function mountComponent(initalVNode:any,container:any,parentComponent:any){
      const instance = createComponentInstance(initalVNode,parentComponent);
      setupInstance(instance);
      setupRenderEffect(instance,initalVNode,container)
   }
   
   function setupRenderEffect(instance: any,initalVNode,container:any) {
      // 拆分更新与初始化
      effect(()=>{
         if (!instance.isMounted){
            console.log("init");
            const { proxy } = instance;   
            const subTree = (instance.subTree = instance.render.call(proxy));
            // vnode => patch
            // vnode => element => mountElement
            patch(null, subTree, container, instance)
            // element => mounted
            initalVNode.el = subTree.el;
            instance.isMounted = true;
         }else {
            console.log("update");
            const { proxy } = instance; 
            const prevSubTree = instance.subTree; 
            const subTree = (instance.subTree = instance.render.call(proxy));
            // vnode => patch
            // vnode => element => mountElement
            patch(prevSubTree, subTree,container,instance)
            // element => mounted
            initalVNode.el = subTree.el;
         }
      })
   }

   return {
      createApp: createAppAPI(render)
   }
}

