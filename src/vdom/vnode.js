export function vnode(tag, key, props, children, text=undefined) {
  return {
    tag,
    key,
    props,
    children,
    text
  }
}