let callbacks = [];
let pending = false;
function flashCallback() {
  pending = false;
  callbacks.forEach(cb => cb())
}


// nextTick原理
export function nextTick(cb) {
  callbacks.push(cb); // 异步刷新callbacks需要异步方法
  let timerFun = () => {
    flashCallback();
  }

  // vue的兼容解决方案 Promise  MutationObserver
  //                setImmediate   setTimeout
  if(pending) {
    return ;
  }
  pending = true;

  if(Promise) {
    Promise.resolve().then(timerFun);
    return ;
  }
  if(MutationObserver) {
    let _observer = new MutationObserver(timerFun);
    let textNode = document.createTextNode('from');
    _observer.observe(textNode, {characterData: true});
    textNode.textContent = 'to';
    return ;
  }
  if(setImmediate) {
    return setImmediate(timerFun);
  }
  setTimeout(timerFun, 0);

}