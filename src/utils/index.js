const defaultRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配插值表达式内的内容

// 'xxx.xxx' ==> vm[xxx][xxx]
export function getValue(vm, expr) {
  let keys = expr.split('.');
  console.log('2222');
  return keys.reduce((memo, current) => { // 累积迭代器，拿到类似 {{ data.xx.xxx }} 的数据
    return memo[current];
  }, vm);
}

// 编译文本节点
export function compilerText(node, vm) {
  if(!node.expr) {
    node.expr = node.textContent;  // 保存首次编译的模板 {{ xxxx }}  ,方便后续更新
  }
  node.textContent = node.expr.replace(defaultRE, function(...args) { 
    return JSON.stringify(getValue(vm, args[1]));  // {{ data.xx.xxx }}
  })
}