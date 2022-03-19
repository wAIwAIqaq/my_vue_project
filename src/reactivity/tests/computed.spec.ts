import {computed} from '../computed';
import {reactive} from '../reactive';
describe('computed',()=>{
    it('happy path',()=>{
        // ref
        // .value
        // 缓存
        const user = reactive({
            age:1
        })
        const age = computed(()=>{
            return user.age;
        })
        expect(age.value).toBe(user.age);
    })
    it('should compute lazily',()=>{
        const value = reactive({
            foo:1
        });
        const getter = jest.fn(() =>{
            return value.foo;
        })
        const cValue = computed(getter);
        //lazy
        expect(getter).not.toBeCalledTimes(1);

        expect(cValue.value).toBe(1);
        expect(getter).toBeCalledTimes(1);
        expect(cValue.value).toBe(1);
        expect(getter).toBeCalledTimes(1);
        value.foo = 2;// trigger => effect => get 重新执行
        expect(getter).toHaveBeenCalledTimes(1);
        expect(cValue.value).toBe(2);
        expect(getter).toHaveBeenCalledTimes(2);
    })
})