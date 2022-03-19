import {effect} from '../effect';
import {ref, isRef, unRef,proxyRefs} from '../ref';
import {reactive} from '../reactive';
describe('ref',()=>{
    it("happy path",()=>{
        const a = ref(1);
        expect(a.value).toBe(1);
    })
    it('should be reactive',()=>{
        const a = ref(1);
        let dummy;
        let calls= 0;
        effect(()=>{
            calls++;
            dummy = a.value;
        })
        expect(dummy).toBe(1);
        expect(calls).toBe(1);
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
        a.value = 2;
        // same value should't trigger;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
    })
    it('should make nested properties reactive',()=>{
        const a = ref({
            count:1
        })
        expect(a.value.count).toBe(1);
        let dummy;
        effect(()=>{
            dummy = a.value.count;
        })
        expect(dummy).toBe(1);
        a.value.count++;
        expect(dummy).toBe(2);
    })
    // isRef unRef
    it('is ref',()=>{
        const a = ref(1);
        const user = reactive({
            age:1
        })
        expect(isRef(a)).toBe(true);
        expect(isRef(user)).toBe(false);
        expect(isRef(1)).toBe(false);
    })
    it('should be unRef',()=>{
        const a = ref(1);
        expect(isRef(a)).toBe(true);
        const b = unRef(a);
        expect(isRef(b)).toBe(false);
    })

    it('proxyRefs',()=>{
        const user = {
            age:ref(10),
            name:'Tom'
        }
        // get
        const proxyUser = proxyRefs(user);
        expect(user.age.value).toBe(10);
        expect(proxyUser.age).toBe(10);
        expect(proxyUser.name).toBe('Tom');
        //set
        proxyUser.age = 11;
        expect(proxyUser.age).toBe(11);
        proxyUser.age = ref(12);
        expect(user.age.value).toBe(12);
        expect(proxyUser.age).toBe(12); 
    })
})