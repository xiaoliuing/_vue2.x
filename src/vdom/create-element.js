export function render(vnode, container) {
  let el = createElement(vnode);
  container.appendChild(el);
}

// 创建真实DOM，并存在虚拟节点的el上
function createElement(vnode) {
  let { tag, key, props, children, text } = vnode;
  if(typeof tag === 'string') {
    // 标签
    vnode.el = document.createElement(tag);
    // 递归挂载孩子节点
    children.forEach(child => {
      updateProperties(child);  // 初始没有老节点
      render(child, vnode.el);
    })
  } else {
  console.log('iun', text);
    // 文本
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 更新节点得props
export function updateProperties(vnode, oldProps={}) {
  let newProps = vnode.props || {};
  let el = vnode.el;

  let newStyle = newProps.style;
  let oldStyle = oldProps.style;

  // style需要遍历一下，将老有新无的style属性置为空
  for(let key in oldStyle) {
    if(!newStyle[key]) {
      el.style[key] = '';
    }
  }

  // 清除新无老有的props属性
  for(let key in oldProps) {
    if(!newProps[key]) {
      delete el[key];
    }
  }

  // 遍历新的props
  for(let key in newProps) {
    if(key === 'style') {
      for(let styleName in newProps) { // 遍历新的style，并都添加到真实DOM的style对象里
        el.style[styleName] = newProps.style[styleName];
      }
    }else if(key === 'class') {
      el.className = newProps.class;
    } else {
      el[key] = newProps[key];
    }
  }
}