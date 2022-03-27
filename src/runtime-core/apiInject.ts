import { getCurrentInstance } from "./component";
export function provide(key,value){
   // set
   const currentInstance:any = getCurrentInstance();
    if(currentInstance){
       let {provides} = currentInstance;
       const parentProvides = currentInstance.parent.provides;
       // 把provide的原型指向parentProvides
       // init 的时候执行
       if (provides === parentProvides){
          provides = currentInstance.provides = Object.create(parentProvides);
       }
       provides[key] = value;
    }
}
export function inject(key,defaultValue){
    // get
    const currentInstance:any = getCurrentInstance();
    if(currentInstance){
        const parentProvides = currentInstance.parent.provides;
        if( key in parentProvides){
           return parentProvides[key];
        }else if (defaultValue){
            if(typeof defaultValue === 'function'){
                return defaultValue()
            }
            return defaultValue;
        }
    }
}