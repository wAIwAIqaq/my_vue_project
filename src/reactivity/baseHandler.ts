import { track, trigger } from "./effect";
import {reactive,ReactiveFlags,readonly} from './reactive'
import { isObject } from "../shared";
import { unRef,isRef } from "./ref";
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false,isShallow = false){
    return function get(target:any,key:any){
        if(key === ReactiveFlags.IS_REACTIVE){
            return !isReadonly;
        } else if(key === ReactiveFlags.IS_READONLY){
            return isReadonly;
        }
        const res = Reflect.get(target,key);
        // 判断shallow 直接返回res
        if(isShallow) return res;
        // 判断 res是不是一个Object
        if(isObject(res)){
            return isReadonly? readonly(res) : reactive(res);
        }
        if(!isReadonly){
            track(target,key);
        }
        return res;
    }
}

function createSetter(isReadonly = false){
    return function set(target:any,key:any,value:any){
        const res = Reflect.set(target, key, value);
        if(!isReadonly){
            // trigger 触发依赖
            trigger(target, key);
        }
        return res;
    }
}
export const  mutableHandlers = {
    get,
    set
}
export const readonlyHandlers = {
    get:readonlyGet,
    set(target:any,key:any){
        console.warn(`${target} is readonly,could't set ${key}!`,target)
        return true;
    }
} 

export const shallowReadonlyHandlers = Object.assign({},readonlyHandlers,{
    get:shallowReadonlyGet
})

// get => age(ref包裹) 返回 .value
// 如果没有被ref包裹 返回 本身的值
export const withRefHandlers  = {
    get(target:any,key:any){
        return unRef(Reflect.get(target,key));
    },
    set(target:any,key:any,value:any){
       if(isRef(target[key]) && !isRef(value)){
          return target[key].value = value;
       } else {
          return Reflect.set(target, key, value);
       }
    }
}