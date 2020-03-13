import { initState } from './observer';
import Watcher from './observer/watcher';
// import { compilerText  } from './utils'
import { patch, h, render } from './vdom/index';

function Vue(options) {
  this._init(options)
}

Vue.prototype._init = function(options) {
  let vm = this;
  vm.$options = options;
  initState(vm);
}

// 获取挂载节点
function query(el) {
  if(typeof el === 'string') {
    return document.querySelector(el);
  }
  return el;
}

// function compiler(node, vm) {
//   let childNodes = node.childNodes;
//   [...childNodes].forEach(childNode => {
//     if(childNode.nodeType == 1) { // 1为标签元素  3为文本
//       compiler(childNode, vm);
//     } else if(childNode.nodeType == 3) {
//       compilerText(childNode, vm)
//     }
//   })
// }


Vue.prototype._update = function(vnode) {
  console.log('视图更新了');
  let vm = this;
  let el = vm.$el;
  let preVnode = vm.preVnode;
  if(!preVnode) {  // 首次渲染没有历史节点
    vm.preVnode = vnode;
    render(vnode, el);
  } else { // 更新节点
    vm.$el = patch(preVnode, vnode)
  }
  // console.log(vm.name);
  // // 循环el里的元素，将里面的内容换为修改的数据
  // let node = document.createDocumentFragment(); // 申请一个Fragment来存储dom片段
  // let firstChild;
  // while(firstChild = el.firstChild) {
  //   node.appendChild(firstChild);  // 将第一个child节点移动到node里
  // }
  // // 做文本替换
  // compiler(node, vm);
  // // 将处理好的dom渲染到页面
  // el.appendChild(node);
}

// 生成虚拟节点
Vue.prototype._render = function() {
  let vm = this;
  let render = vm.$options.render;
  let vnode = render.call(vm, h);
  return vnode;
}

// 初始页面的方法
Vue.prototype.$mount = function() {   // 挂载dom
  let vm = this;
  let el = vm.$options.el;
  el = vm.$el = query(el); // 获取当前挂载的节点

  // 渲染通过 Watcher 来渲染
  let updateComponent = () => {  // 更新 渲染组件
    vm._update(vm._render());
  }
  // 生成渲染watcher
  new Watcher(vm, updateComponent);
}


// 用户调用的 $watch 方法
Vue.prototype.$watch = function(key, handler, opts) {
  new Watcher(this, key, handler, {user: true, ...opts});
}

export default Vue;