import {readonly,isReadonly,isProxy} from '../reactive'
describe('readonly',()=>{
    it('happy path',()=>{
        // cant set
        const original = {foo:1,bar:2}
        const wraped = readonly(original);
        expect(original).not.toBe(wraped);
        expect(original.bar).toBe(2);
    })
    it('should make nested values readonly',()=>{
        const original = {foo:1,bar:{ baz:2}};
        const wraped = readonly(original);
        expect(isReadonly(wraped)).toBe(true);
        expect(isReadonly(original)).toBe(false);
        expect(isReadonly(wraped.bar)).toBe(true);
        expect(isProxy(wraped)).toBe(true);
    })
    it('should call console.warn warn when call set',()=>{
        // console.warn()
        // mock 
        console.warn = jest.fn()
        const user = readonly({
            age:10
        })
        user.age++;
        expect(console.warn).toBeCalled();
    })
    it('isReadOnly',()=>{
        const user = {age:10}
        const readonlyUser = readonly({
            age:10
        })
        expect(isReadonly(user)).toBe(false);
        expect(isReadonly(readonlyUser)).toBe(true);
    })
})