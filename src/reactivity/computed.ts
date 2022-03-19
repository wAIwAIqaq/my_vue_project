import { hasChanged,convert } from '../shared'
import {ReactiveEffect} from './effect';
class ComputedRefImp{
    private _getter;
    private _dirty : Boolean = true;
    private _value : any;
    private _effect: any
    constructor(getter:any){
         this._getter = getter;

         this._effect = new ReactiveEffect(getter,()=>{
            if(!this._dirty) this._dirty = true;
         })
    }
    get value(){
        // get
        // 当依赖的响应式对象的值发生改变
        // effect
        if(this._dirty){
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value 
    }
}
export function computed(getter:any){
    return new ComputedRefImp(getter)
}