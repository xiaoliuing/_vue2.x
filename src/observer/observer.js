import { observer } from './index';
import { arrayMethods, observerArray, dependArray } from './array';
import Dep from './dep';


// initData 过程，还没创建渲染watcher，所以不会进行依赖搜集，即dep.subs = [] 
function defineReactive(data, key, value) {
  let childOb = observer(value); // 递归观察对象的嵌套情况
  let dep = new Dep();
  Object.defineProperty(data, key, {
    get() {
      console.log('get data', value);
      if(Dep.target) {
        dep.depend();  // 让dep可以存放watcher，同样也让watcher中存放对应的dep，这样实现一个多对对的关系
        if(childOb) { // 主要处理数组 给数组的dep添加watcher，纯对象也会执行
          childOb.dep.depend();  // 只是这样，若数组的内嵌数组 push时，不会触发渲染watcher
          Array.isArray(value) && dependArray(value);  // 递归给内嵌的数组进行dep的依赖搜集
        }
      }
      return value;
    },
    set(newValue) {
      if(newValue === value) return;
      observer(newValue);      // 观察新增属性为对象
      console.log('set data', newValue);
      value = newValue;
      dep.notify();  // 触发watcher的update的方法
    }
  })
}


class Observer{  // 要添加一个处理数组的方法
  constructor(data) {

    // 给每个Observer实例添加一个dep，这个实例是 Observer(Dep)
    this.dep = new Dep(); // 主要针对数组，给数组
    // 给每个对象加一个__ob__,值为当前Observer，用来调用数组方法时进行  dep.notify
    Object.defineProperty(data, '__ob__', {
      get:() => this
    })
    if(Array.isArray(data)){ // data为数组的情况，改写它的原型方法
      data.__proto__ = arrayMethods;
      observerArray(data); // 检测数组的每一项
    } else {
      this.walk(data);
    }
  }
  walk(data) {  // 这个方法主要对纯对象进行劫持
    let keys = Object.keys(data); // 获取data对象的key
    for(let i = 0;i < keys.length;i++) {
      let key = keys[i];
      let value = data[key];
      defineReactive(data, key, value); 
    }
  }
}

export default Observer;