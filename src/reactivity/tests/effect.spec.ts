import {reactive} from '../reactive';
import {effect,stop} from '../effect';
describe('effect',()=>{
    it('happy path',()=>{
        const user = reactive({
            age:10
        })
        let nextAge;
        effect(()=>{
            nextAge = user.age + 2;
        })
        expect(nextAge).toBe(12);

        // update
        user.age++;
        expect(nextAge).toBe(13);
    })
    it('should return a runner when user call the effect',()=>{
        //1. effect(fn) => function(runner) => fn => return
        let foo = 10;
        const runner = effect(()=>{
            foo++;
            return 'foo runner';
        });
        expect(foo).toBe(11);
        const r = runner();
        expect(foo).toBe(12);
        expect(r).toBe('foo runner');
    })
    
  it("scheduler", () => {
    // 1.通过effect的第二个参数scheduler的fn
    // 2.effect第一次执行的时候 还会执行fn
    // 3.当响应式对象set 即update的时候 不会执行 fn 而是执行scheduler
    // 4.如果当执行runner的时候会再次执行fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run();
    // // should have run
    expect(dummy).toBe(2);
  });
  it('stop',()=>{
    let dummy:any;
    const obj =reactive({prop:1});
    const runner = effect(()=>{
      dummy = obj.prop;
    })
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop ++;
    
    expect(dummy).toBe(2);

    // stopped effect should still be manully callalbe
    runner();
    expect(dummy).toBe(3);
  })
  it('onstop',()=>{
    const obj = reactive({
      foo:1
    })
    const onStop = jest.fn();
    let dummy;
    const runner = effect(()=>{
      dummy=obj.foo;
    }, {
      onStop
    })

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  })
})