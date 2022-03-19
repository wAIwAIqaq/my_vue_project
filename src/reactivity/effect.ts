import { extend }from '../shared';
let activeEffect:any;
let shouldTrack = false;
const targetMap = new Map();
export class ReactiveEffect{
    private _fn: any;
    deps = [];
    active = true;
    onStop?: ()=> void;
    public scheduler:Function|undefined
    constructor(fn:any,scheduler?:Function){
        this._fn = fn
        this.scheduler = scheduler;
    }
    run(){
        if(!this.active){
           return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result =  this._fn();
        shouldTrack = false
        activeEffect = undefined;
        return result 
    }
    stop(){
        if(this.active){
            cleanupEffect(this);
            if(this.onStop){
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect:any){
    effect.deps.forEach((dep:any) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
export function track(target:any, key:any){
    if(!isTracking()){
        return
    }
    // target => key => dep
    let depsMap = targetMap.get(target);
    if (!depsMap){
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if(!dep){
        dep = new Set();
        depsMap.set(key,dep);
    }
    trackEffects(dep)
} 
export function trackEffects(dep:any){
    // 判断dep是不是已经添加了这个activeEffect
    if(dep.has(activeEffect)) return
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
export function trigger(target:any,key:any){
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
export function triggerEffects(dep:any){
    for(const effect of dep){
        if(effect.scheduler){
            effect.scheduler()
        }else{
            effect.run();
        }
    }
}
export function effect(fn:any, options:any = {}){
    //fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    // Object.assign(_effect,options);
    //extend
    extend(_effect,options)
    _effect.run();
    const runner:any = _effect.run.bind(_effect);
    runner.effect = _effect
    return runner;
}
export function stop(runner:any){
    runner.effect.stop();
}
export function isTracking(){
    return shouldTrack && activeEffect !== undefined
}

