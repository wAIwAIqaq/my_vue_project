import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupInstance } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment,Text } from "./vnode";
import { shouldUpdateComponent } from './componentUpdateUtils';
import { queueJob } from './scheduler';

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

   function patch(n1, n2:any, container:any,parentComponent:any = null,anchor:any = null){
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
               processElement(n1, n2, container, parentComponent, anchor);
            } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
               processComponent(n1, n2, container, parentComponent)
            }
            break;
      }
   }

   function processElement(n1, n2: any, container: any,parentComponent,anchor) {
      if(!n1){
         // init
         mountElement(n2,container,parentComponent, anchor);
      }else{
         // update
         patchElement(n1 ,n2, container,parentComponent,anchor)
      }
      
      
   }
   const EMPTY_OBJ = {};
   function patchElement(n1, n2, container,parentComponent,anchor){
      const oldProps = n1.props || EMPTY_OBJ;
      const newProps = n2.props || EMPTY_OBJ;
      const el = (n2.el = n1.el);
      patchChildren(n1, n2, el,parentComponent,anchor);
      patchProps(el,oldProps,newProps);
   }

   function patchChildren(n1, n2, container,parentComponent,anchor){
      const prevShapeFlag = n1.shapeFlag;
      const nextShapeFlag = n2.shapeFlag;
      const c1 = n1.children;
      const c2 = n2.children;
      if(nextShapeFlag & ShapeFlags.TEXT_CHILDREN){
         if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            // array => text
            // 1.把老的children清空 
            unmountChildren(c1);
            // 2.set 新的textchildren
            // 如果 n1.children !== n2.children 则直接把n2的文本值设置为container的textContent
            // text => text 同时需执行以下
            hostSetElementText(container,c2);
         }else{
            hostSetElementText(container,c2);
         }

          
      }else{
         if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
            // array => text
            // 1.把容器的文本内容清空
            hostSetElementText(container,'');
            mountChildren(c2,container,parentComponent);
         } else {
           // array diff => array
           patchKeyedChildren(c1, c2, container, parentComponent,anchor);
         }
      }
   }

   function patchKeyedChildren(c1, c2, container, parentComponent,parentAnchor) {
      console.log('patch child');
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      const l2 = c2.length;
      // 左侧对比
      while(i <= e1 && i <= e2){
         const n1 = c1[i];
         const n2 = c2[i];
         if(isSameVNodeType(n1,n2)){
            patch(n1, n2, container, parentComponent)
         }else{
            break;
         }
         i++;
      }
      // 右侧对比
      while(i <= e1 && i <= e2){
         const n1 = c1[e1];
         const n2 = c2[e2];
         if(isSameVNodeType(n1,n2)){
            patch(n1, n2, container, parentComponent)
         }else{
            break;
         }
         e1--;
         e2--;
      }
      if(i > e1){// 新的比老的多 
         if(i<=e2){
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
              patch(null, c2[i], container, parentComponent,anchor);
              i++;
            }
         }
      }else if(i > e2){ // 新的比老的少
         const anchorIndex = i + e1 - e2 ;
         while(i < anchorIndex){
            hostRemove(c1[i].el);
            i++;
         }
      } else{
         // 中间对比
         let s1 = i;
         let s2 = i;
         let isPatchedCount = 0;
         const toBePatched = e2 - s2 + 1;
         const keyToNewIndexMap = new Map();
         const newIndexToOldIndexMap = new Array(toBePatched);
         let moved = false;
         let maxNewIndexSoFar = 0;
         for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
         for(let i = s2;i <= e2; i++){
            const nextChild = c2[i];
            keyToNewIndexMap.set(nextChild.key, i);
         }
         for(let i = s1;i <= e1; i++ ){
            const prevChild = c1[i];
            if(isPatchedCount >= toBePatched){
               hostRemove(prevChild.el);
               continue;
            }
            let newIndex;
            if(prevChild.key != null){
               newIndex = keyToNewIndexMap.get(prevChild.key);
            }else{
               for(let j = s2;j <= e2;j++){
                  if(isSameVNodeType(prevChild,c2[j])){
                     newIndex = j;
                     break;
                  }
               }
            }
            if(newIndex === undefined){
               hostRemove(prevChild.el);
            }else{
               if(newIndex >= maxNewIndexSoFar){
                  maxNewIndexSoFar = newIndex;
               }else{
                  moved = true;
               }
               newIndexToOldIndexMap[newIndex - s2] = i + 1; 
               patch(prevChild, c2[newIndex], container,parentComponent,null);
               isPatchedCount++;
            }
         }
         const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
         let j = increasingNewIndexSequence.length - 1;
         for (let i = toBePatched - 1; i >= 0 ; i--) {
            const nextIndex = i + s2;
            const nextChild = c2[nextIndex];
            const anchor = nextIndex + 1  < l2 ? c2[nextIndex+1].el : null;
            if(newIndexToOldIndexMap[i] === 0){
               patch(null,nextChild,container,parentComponent,anchor);
            }else if(moved){
               // 如果判断需要moved
               if(j<0 || i !== increasingNewIndexSequence[j]){
                  console.log(anchor);
                   hostInsert(nextChild.el, container, anchor)
               }else{
                  j--;
               }
            }
         }
      }
   }
      
   // 获取最长递增子序列算法
   function getSequence(arr:number[]):number[] {
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
            } else {
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

   function isSameVNodeType(n1,n2){
      return n1.type === n2.type && n1.key === n2.key

   }
   
   function unmountChildren(children){
      for(let i= 0; i<children.length;i++){
         const el = children[i].el;
         // remove
         hostRemove(el);
      }
   }
   function patchProps(el,oldProps, newProps){
      // 两个props Object判断不相等？
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
      if(!n1){
         mountComponent(n2,container, parentComponent)
      }else{
         updateComponent(n1,n2);
      }
      
   }
 
   function updateComponent(n1,n2){
      const instance = n2.component = n1.component;
      if(shouldUpdateComponent(n1,n2)){
         console.log("组件更新",n1,n2);
         instance.next = n2;
         instance.update();
      }else{
         n2.el = n1.el;
         n2.vnode = n2;
      }
   }

   function updateComponentPreRender(instance,nextVNode){
      instance.vnode = nextVNode;
      instance.next = null;
      instance.props = nextVNode.props;
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
   
   function mountElement(vnode: any, container: any ,parentComponent, anchor) {
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
      hostInsert(el,container,anchor);
   }
   
   function mountChildren(children: any[],container: any,parentComponent){
      children.forEach((child: any) => {
         patch(null, child, container, parentComponent);
      })
   }
   
   function mountComponent(initalVNode:any,container:any,parentComponent:any){
      const instance = (initalVNode.component = createComponentInstance(initalVNode, parentComponent));
      setupInstance(instance);
      setupRenderEffect(instance,initalVNode,container)
   }
   
   function setupRenderEffect(instance: any,initalVNode,container:any) {
      // 拆分更新与初始化
      instance.update = effect(()=>{
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
            const { proxy,next,vnode } = instance; 
            if(next){
               next.el = vnode.el;
               updateComponentPreRender(instance,next);
            }
            const prevSubTree = instance.subTree; 
            const subTree = (instance.subTree = instance.render.call(proxy));
            // vnode => patch
            // vnode => element => mountElement
            patch(prevSubTree, subTree,container,instance)
            // element => mounted
            initalVNode.el = subTree.el;
         }
      },{
         scheduler(){
            console.log("update-----scheduler");
            queueJob(instance.update);
         }
      })
   }

   return {
      createApp: createAppAPI(render)
   }
}

