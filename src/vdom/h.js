import { vnode } from './vnode';
export function h(tag, props, ...children) {
  let key = props.key;
  delete props.key;   // 删除key，防止渲染到真实DOM上
  // 遍历孩子，判断为  文本 | 对象节点
  children = children.map(child => {
    if(typeof child === 'object'){
      return child;
    } else {
      console.log('mpijmoi', child);
      return vnode(undefined, undefined, undefined, undefined, child);
    }
  })
  return vnode(tag, key, props, children);
}