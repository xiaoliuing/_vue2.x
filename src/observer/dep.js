let depId = 0;
class Dep{ // 依赖搜集
    constructor() {
      this.id = depId++;
      this.subs = [];
    }

    addSubs(watcher) { // 订阅watcher
      this.subs.push(watcher);
    }

    notify() { // 通知 watcher 
      console.log(this.subs)
      this.subs.forEach(watcher => watcher.update());
    }

    depend() {
      Dep.target && Dep.target.addDep(this);
    }
}

let stack = [];

export function pushTarget(watcher) {
  Dep.target = watcher;
  stack.push(watcher);
}

export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}

export default Dep;