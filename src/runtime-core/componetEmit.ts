import {toHandleKey,cameLize} from '../shared'
export function emit(instance,event,...args){;
    // instance.props => event
    const { props } = instance;

    const handlerName = toHandleKey(event);
    const handler = props[cameLize(handlerName)];
    handler && handler(...args); 
}