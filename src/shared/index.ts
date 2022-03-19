import { reactive } from "../reactivity/reactive";
export const extend = Object.assign;

export const isObject = (val:any) =>{
    return val !== null && typeof val === 'object';
}

export const hasChanged = (val:any,newVal:any)=>{
    return !Object.is(val,newVal);
};

export const convert=(newValue:any)=>{
    return isObject(newValue) ? reactive(newValue) : newValue;
}
export const isOn= (event: string)=>{
   return /^on[A-Z]/.test(event);
}

export const hasOwn = (properties,key) =>{
   return Object.prototype.hasOwnProperty.call(properties,key);
}