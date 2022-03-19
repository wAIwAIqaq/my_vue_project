export const enum ShapeFlags{
   ELEMENT = 1,
   STATEFUL_COMPONENT = 1 << 1,
   TEXT_CHILDREN = 1 << 2,
   ARRAY_CHILDREN = 1 << 3,
   SLOT_CHILDREN = 1 << 4
}
export function getShapeFlag(type: String){
    return typeof type  === "string"? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
