export const enum ShapeFlags{
   ELEMENT = 1,
   STATEFULCOMPONENT = 1 << 1,
   TEXT_CHILDREN = 1 << 2,
   ARRAY_CHILDREN = 1 << 3
}
export function getShapeFlag(type: String){
    return typeof type  === "string"? ShapeFlags.ELEMENT : ShapeFlags.STATEFULCOMPONENT
}