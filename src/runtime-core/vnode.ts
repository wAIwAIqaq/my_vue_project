import { ShapeFlags,getShapeFlag } from "../shared/shapeFlags";
export function createVNode(type:String, props?:Object, children?:any){
    const VNode =  {
        el:null,
        type,
        props:props || {},
        children,
        shapeFlag:getShapeFlag(type),
    }
    // children?
    if(typeof children === "string"){
        VNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    } else if(Array.isArray(children)){
        VNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }
    if(VNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
        if(typeof children === 'object'){
            VNode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return VNode;
}