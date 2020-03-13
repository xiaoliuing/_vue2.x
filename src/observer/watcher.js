let watcherId = 0; // 每个watcher 的唯一标识
import { pushTarget, popTarget } from './dep';
import { nextTick } from '../utils/next-tick';
import { getValue } from '../utils/index';

class Watcher{

  // exprOrFn 用户传入的可能是个函数或表达式
  // cb  传入的表达式   opts 其它参数
  constructor(vm, exprOrFn, cb=()=>{}, opts={}) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    this.cb = cb;
    this.opts = opts;
    this.immediate = opts.immediate;
    this.id = watcherId++;

    this.lazy = opts.lazy;  // lazy标识是computed
    this.dirty = this.lazy; // 判断计算属性是否需要重新取值，达到缓存的效果

    // exprOrFn：渲染 watcher时为render函数，
    if(typeof exprOrFn === 'function') {
      this.getter = exprOrFn;
    } else { // exprOrFn  'name' | 'obj.a.xx'
      this.getter = () => {
        return getValue(vm, exprOrFn)
      }
    }

    if(opts.user) {
      this.user = true
    }

    this.deps = [];
    this.depsId = new Set();

    // this.get()：计算属性默认不会执行  watch会在创建watcher时默认调用
    this.value = this.lazy ? undefined : this.get();
    // immediate为true时，watch的cb会在初始时执行一次
    this.immediate && this.cb(this.value);
  }

  get() {
    pushTarget(this); // 依赖搜集
    // this为计算watcher时，getter：() => this.xxx + this.aaa 
    let value = this.getter.call(this.vm); // 执行watcher
    popTarget(); // 清除Dep.target为当前watcher
    return value;
  }

  evaluate() { // 计算属性重新取值
    this.value = this.get();
    this.dirty = false;
  }

  depend() {
    let i = this.deps.length;
    while(i--) {
      this.deps[i].depend()
    }
  }

  addDep(dep) {  // 记住 dep
    let id = dep.id;
    if(!this.depsId.has(id)) { 
      this.depsId.add(id);
      this.deps.push(dep);
      dep.addSubs(this); // 在这添加watcher，防止了多次get数据时，当前dep重复添加同一个watcher，
    }
  }

  update() {
    queueWatcher(this); // 批处理更新，利用的是异步队列
  }

  run() { // 
    let value = this.get();
    if(this.value !== value) {
      this.cb(this.value, value);
    }
  }
}

let has = {},
    queue = [];

function flashQueue() {
  queue.forEach(watcher => watcher.run());
  has = {};
  queue = [];
}

function queueWatcher(watcher) {
  let id = watcher.id;
  if(has[id] == null) {  // 防止watcher 多次
    has[id] = true;
    queue.push(watcher);
    nextTick(flashQueue);
  }
}

export default Watcher;