import Observer from './observer';
import Watcher from './watcher';
import Dep from './dep';

export function observer(data) { // 观察data对象
  if(typeof data !== 'object' || data === null) {
    return null;
  }
  return new Observer(data);
}

// 初始操作
export function initState(vm) {
  let opts = vm.$options;
  if(opts.data) {
    initData(vm)
  }

  if(opts.computed) {
    initComputed(vm, opts.computed);
  }

  if(opts.watch) {
    initWatch(vm)
  }
}


// 将用户通过vm访问的data属性，代理到 vm._data上
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    }
  })
}

// 初始化data，让data响应式绑定
function initData(vm) { 
  let data = vm.$options.data;
  // data为对象或函数
  data = vm._data = typeof data === 'function' ? data.call(this) : data || {};
  for(let key in data) {
    // 代理 vm.data
    proxy(vm, '_data', key);
  }
  observer(vm._data);
}


function createCompoutedGetter(vm, computedKey) {
  let watcher = vm._watchersComputed[computedKey];
  return function() { // 用户取值会调用此方法
    if(watcher) {
      // 判断是否需重新取值，为true取
      if(watcher.dirty) {
        watcher.evaluate();
      }
      if(Dep.target) {
        watcher.depend()
      }
      return watcher.value;
    }
  }
}

// 初始每个Vue实例的计算属性  computed
function initComputed(vm, computed) {
  // 缓存计算属性  watcher
  let watchers = vm._watchersComputed = Object.create(null);

  for(let key in computed) {
    let userDef = computed[key];
    // userDef  'fullname':() => this.firatName + this.lastName
    watchers[key] = new Watcher(vm, userDef, ()=>{}, {lazy: true})
    // 用户访问计算属性时，是以  vm.fullname 访问
    Object.defineProperty(vm, key, {
      get: createCompoutedGetter(vm, key) // 代理用户取值的操作
    })
  }
}


function createWatcher(vm, key, handler, opts) {
  return vm.$watch( key, handler, opts)
}

// 初始watch每个Vue实例的watch
function initWatch(vm) {
  let watch = vm.$options.watch;
  // 每个watch的data属性，可能是个函数或对象 xxx: { handler(){}, {immediate: Boolean} }  // immediate 是否默认执行
  if(watch) {
    for(let key in watch) {
      let userDef = watch[key];
      let handler = userDef;
      if(userDef.handler) {
        handler = userDef.handler;
      }
      createWatcher(vm, key, handler, {immediate: userDef.immediate});
    }
  }
}