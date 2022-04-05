import {NodeTypes} from './ast';
const enum TagsType  {
    START="start",
    END="end"
}
export function baseParse(content:string){
   const context = createParserContext(content);
   return createRoot(parseChildren(context));
}
function parseChildren(context){
    const nodes:any = [];
    let node;
    const s = context.source;
    if(s.startsWith("{{")){
        node = parseInterpolation(context);
    }else if(s[0] === "<"){
        if(/[a-z]/.test(s[1])){
           node = parseElement(context);
        }
    }
    nodes.push(node);
    return nodes
}

function parseElement(context:any){
   //Implement
   //1.解析
   const element = parseTag(context,TagsType.START); 
   parseTag(context,TagsType.END);
   console.log('----------------tag',context.source);
   return element
}
function parseTag(context,type:TagsType){
    const match:any = /^<\/?([a-z]*)/i.exec(context.source);
    console.log(match);
    const tag = match[1];
    //2.删除处理完成的代码
    advanceBy(context,match[0].length);
    advanceBy(context,1);
    if(type === TagsType.END) return
    return {
         type:NodeTypes.ELEMENT,
         tag
    }     
}

function parseInterpolation(context){
     // {{message}}
     const openDelimiter = "{{";
     const closeDelimiter = "}}";
     const closeIndex = context.source.indexOf(closeDelimiter,openDelimiter.length);         
     advanceBy(context, openDelimiter.length);
     const rawContentLength = closeIndex - openDelimiter.length;
     const rawContent = context.source.slice(0,rawContentLength);
     const content = rawContent.trim();
     console.log(content);
     advanceBy(context, rawContentLength + closeDelimiter.length);
     return  { 
        type:NodeTypes.INTERPOLATION,
        content:{
            type:NodeTypes.SIMPLE_EXPRESSION,
            content
        }
   }

}
function advanceBy(context:any,length:number){
    context.source = context.source.slice(length);
}
function createRoot(children){
    return {
            children
    }
}

function createParserContext(content: string) {
   return{
        source:content
   }
}
