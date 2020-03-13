import { updateProperties, createElement } from './create-element';



export function patch(oldVnode, newVnode) {
  // 1、新老节点标签不等，直接新的替换老的
  if(oldVnode.tag !== newVnode.tag) {
    return oldVnode.el.parentNode.replaceChild(createElement(newVnode), oldVnode.el);
  }

  // 2、新老节点标签相等
  //      (1) 为文本 
  //      (2) 为标签
  // (1)文本 
  if(!newVnode.tag && typeof newVnode.text !== 'undefined') {
    return oldVnode.el.textContent = newVnode.text;
  }

  // (2)标签
  //   a、标签一样，可能peops属性不一样，先更新
  let el = newVnode.el = oldVnode.el;
  updateProperties(newVnode, oldVnode.props);

  // b、判断有无孩子节点
  //     1)新有老有
  //     2)新有老无
  //     1）新无老有
  let newChildren = newVnode.children;
  let oldChildren = oldVnode.children;
  let newCLen = newChildren.length;
  let oldCLen = oldChildren.length;
  if(newCLen > 0 && oldCLen > 0) {  // 新老节点均有儿子，最复杂的情况    ==> (核心)
    updateChildren(el, oldChildren, newChildren);
  }else if(newCLen > 0) {  // 新有老无，新的儿子节点直接添加到real dom
    newChildren.forEach(childVnode => {
      el.appendChild(createElement(childVnode))
    })
  } else if(oldCLen > 0) { // 新无老有，直接清除所有儿子节点，innerHTML简单暴力
    el.innerHTML = '';
  }

  return el;
}





// 判断两节点是否为相同节点
function isSameVnode(oldVnode, newVnode) {
  return (newVnode.tag === oldVnode.tag) && (newVnode.key === oldVnode.key);
}


// 比较更新新老儿子节点
function updateChildren(parentEl, oldChildren, newChildren) {
  let oldStartIndex = 0;
  let oldEndIndex = oldChildren.length - 1;
  let oldStartVnode = oldChildren[oldStartIndex];
  let oldEndVnode = oldChildren[oldEndIndex];

  let newStartIndex = 0;
  let newEndIndex = newChildren.length - 1;
  let newStartVnode = newChildren[newStartIndex];
  let newEndVnode = newChildren[newEndIndex];

  let map = {};
  oldChildren.forEach((child, index) => {
    map[child.key] = index;
  });

  // 跳出循环的条件：新或老节点儿子的start大于end索引
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if(!oldStartVnode) {  // 当前节点可能被移动过，索引需后移
      oldStartVnode = oldChildren[++oldStartIndex];
    }else if(!oldEndVnode) { // 当前节点可能被移动过，索引需前移
      oldEndVnode = oldChildren[--oldEndIndex];
    // 新老start child节点相等
    }else if(isSameVnode(oldStartVnode, newStartVnode)) { 
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    // 新老end child节点相等
    }else if(isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    // 老start child 与新 end child 相等，
    }else if(isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode);
      parentEl.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    // 老end child 与新start child 相等
    }else if(isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldStartVnode, newEndVnode);
      parentEl.insertBefore(oldEndVnode.el, newStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    // 杂乱无章的比较
    }else {
      let moveIndex = map[newStartVnode.key]; 
      if(moveIndex == undefined) { // 新的节点key在老的children节点里不存在，直接插入oldStartVnode之前
        parentEl.insertBefore(createElement(newStartVnode), oldStartVnode.el)
      } else{ // key存在
        let moveVnode = oldChildren[moveIndex];
        if(moveVnode.tag !== newStartVnode.tag) {  // 节点类型不同，视为新节点，直接插入
          parentEl.insertBefore(createElement(newStartVnode), oldStartVnode.el)
        } else { // ta和key相等的节点
          patch(moveVnode, newStartVnode);
          oldChildren[moveIndex] = undefined;
          parentEl.insertBefore(moveVnode.el, oldStartVnode.el);
        }
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  // while循环结束，oldChildren和newChildren必有一方还有剩余的孩子节点没patch

  // 当oldChildren处理完了，newChildren还有剩余节点
  // 
  if(newStartIndex <= newEndIndex) {
    // patch方法中会将oldVnode节点的el共享给newVnode的el    patch --->  let el = newVnode.el = oldVnode.el;
    // 所以只要尾节点比较过了，新的结束索引 newEndIndex就会前移，即  newChildren[newEndIndex + 1]的el里已经存着real dom共享堆的地址
    let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el;
    for(let i = newStartIndex; i <=  newEndIndex;i++) {
      // insertBefore方法，当ele为null，他会将要插入的节点插到儿子节点的末尾
      parentEl.insertBefore(createElement(newChildren[i]), ele);
    }
  }

  // 当newChildren处理完了，oldChildren还有剩余节点
  //      删除老的剩余儿子节点
  if(oldStartIndex <= newEndIndex) {
    for(let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i];
      if(child != undefined) {  // 可能会存在当前老节点被移动过，移动后该节点被置为undefined
        parentEl.removeChild(child);
      }
    }
  }
}