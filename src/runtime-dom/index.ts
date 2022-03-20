import {createRender} from '../runtime-core';
import { isOn } from "../shared/index";
function createElement(type) {
    console.log("createElement——————————");
    return document.createElement(type);
}

function pathProp(el, key, val){
    console.log("patchProp——————————————");
    if(isOn(key)){
       const event = key.slice(2).toLocaleLowerCase();
       el.addEventListener(event,()=>{
          val();
       });
    }else{
       el.setAttribute(key,val);
    }
}

function insert(el, parent){
    console.log("insert—————————————————");
    parent.append(el);
}

const render:any= createRender({
    createElement,
    pathProp,
    insert
})

export function createApp(...args){
    return render.createApp(...args)
}

export * from '../runtime-core';