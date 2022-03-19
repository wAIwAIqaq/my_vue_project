import { hasChanged,convert } from '../shared';
import {trackEffects, triggerEffects,isTracking} from './effect';
import {withRefHandlers} from './baseHandler';
class RefImp {
    private _value:any;
    public dep:any;
    private _rawValue;
    public __v_isRef = true;
    constructor(value:any){
        this._rawValue = value;
        // 判断value是不是 一个对象
        this._value = convert(value);
        this.dep = new Set()
    }
    get value(){
        trackRefValue(this);
        return this._value
    }
    set value(newValue){
        // 判断value的值是否修改 对比的时候应该是两个Object对象而不是Proxy对象
        if(!hasChanged(this._rawValue,newValue)) return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep)
        return 
    }
}
function trackRefValue(ref:any){
    if(isTracking()){
        trackEffects(ref.dep);
    }
}
export function ref(value:any){
    return new RefImp(value)
}
export function isRef(ref:any){
    return !!ref.__v_isRef;
}
export function unRef(ref:any){
    return isRef(ref)? ref.value : ref;
}
export function proxyRefs(objectWithRef:any){
    return new Proxy(objectWithRef,withRefHandlers)
}