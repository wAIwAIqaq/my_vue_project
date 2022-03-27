import {createRender} from '../runtime-core';
import { isOn } from "../shared/index";
function createElement(type) {
    return document.createElement(type);
}

function patchProp(el, key, prevVal, nextVal){
    if(isOn(key)){
       const event = key.slice(2).toLocaleLowerCase();
       el.addEventListener(event,()=>{
          nextVal();
       });
    }else{
       if(nextVal === undefined || nextVal === null){
           el.removeAttribute(key);
       }else{
           el.setAttribute(key,nextVal);
       }
    }
}

function insert(child, parent, anchor:any = null){
    parent.insertBefore(child,parent.children[anchor]);
}

function remove(child){
   const parent = child.parentNode;
   if(parent){
       parent.removeChild(child);
   }
}

function setElementText(el, text){
    el.textContent = text;
}

function setElementArray(el, children){
    console.log(el);
    console.log(children);
}
const render:any= createRender({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
    setElementArray
})

export function createApp(...args){
    return render.createApp(...args)
}

export * from '../runtime-core';