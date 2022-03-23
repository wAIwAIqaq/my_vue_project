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

function insert(el, parent){
    parent.append(el);
}

const render:any= createRender({
    createElement,
    patchProp,
    insert
})

export function createApp(...args){
    return render.createApp(...args)
}

export * from '../runtime-core';