import { shallowReadonly,isReadonly,isProxy } from "../reactive";

describe('shallowReadonly',()=>{
    it('should not make non-reactive properties reactive',()=>{
        const props = shallowReadonly({n:{foo:1}});
        console.warn = jest.fn();
        expect(isReadonly(props)).toBe(true);
        expect(isReadonly(props.n)).toBe(false);
        expect(isProxy(props)).toBe(true);
    })
    it('should be call console.warn when call set',()=>{
        const props = shallowReadonly({n:{foo:1}});
        console.warn = jest.fn();
        props.n = {foo:2};
        expect(console.warn).toBeCalled();
    })
})