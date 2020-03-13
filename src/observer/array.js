import { observer } from './index'

// 劫持处理能改变原数组的方法 

const oldArrayPrototype = Array.prototype;

export let arrayMethods = Object.create(oldArrayPrototype);

const methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort'
];

// 观察数组的每一项
export function observerArray(args) {
  args.forEach(arg => {
    observer(arg);   // 观察为对象的新增属性  注意若是对象需要在继续观察
  })
}

export function dependArray(value) {
  value.forEach(currentItem => {
    currentItem.__ob__ && currentItem.__ob__.dep.depend();
    Array.isArray(currentItem) && dependArray(currentItem); // [[[]]]  递归让内嵌的数组搜集依赖watcher
  })
}

// 修改数组原型方法
methods.forEach((method) => {
  arrayMethods[method] = function(...args) {
    let res = oldArrayPrototype[method].apply(this, args);

    // 对有添加数组元素功能的方法进行添加数据的监听
    let insertArray;
    switch (method) {
      case 'push':
      case 'unshift':
        insertArray = args;
        break;
      case 'splice':    // splice添加元素是有三个参数，第三个参数时新添加的元素   [....].splice( x, 0, xxx);
        insertArray = args.slice(2);  
      default:
        break;
    }

    // 有新增属性就观察它 
    insertArray && observerArray(insertArray)

    // 当我们push一个普通值时不会被劫持监听，所以需要触发 watcher.update
    // 在 观察对象时，给每个对象都新添加 __ob__ ，保存着当前数组的 Observer(Dep)
    this.__ob__.dep.notify(); // 调用的是原数组的__ob__，所以push一个普通值也会更新
    return res;
  }
})

export default arrayMethods;

