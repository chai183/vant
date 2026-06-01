import {
  Fragment,
  cloneVNode,
  isVNode,
  mergeProps,
  type VNode,
} from 'vue';
import type { ProFormRenderContext } from './types';

function isComponentVNode(vnode: VNode) {
  const { type } = vnode;
  return typeof type === 'object' || typeof type === 'function';
}

function mergeComponentVNode(vnode: VNode, ctx: ProFormRenderContext) {
  return cloneVNode(
    vnode,
    mergeProps(ctx.bindProps(), vnode.props ?? {}),
    true,
  );
}

function mergeChildren(
  children: VNode['children'],
  ctx: ProFormRenderContext,
): VNode['children'] {
  if (children == null) {
    return children;
  }
  if (typeof children === 'function') {
    return children;
  }
  if (!Array.isArray(children)) {
    return isVNode(children)
      ? (mergeRenderBindProps(children, ctx) as VNode['children'])
      : children;
  }
  return children.map((child) =>
    isVNode(child) ? mergeRenderBindProps(child, ctx) : child,
  );
}

/** 为 render 返回的组件 VNode 自动合并 modelValue 等绑定 */
export function mergeRenderBindProps(
  node: VNode | VNode[] | null | undefined,
  ctx: ProFormRenderContext,
): VNode | VNode[] | null | undefined {
  if (node == null) {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((item) => mergeRenderBindProps(item, ctx) as VNode);
  }

  if (!isVNode(node)) {
    return node;
  }

  if (isComponentVNode(node)) {
    return mergeComponentVNode(node, ctx);
  }

  if (node.type === Fragment || node.children) {
    const cloned = cloneVNode(node);
    cloned.children = mergeChildren(node.children, ctx);
    return cloned;
  }

  return node;
}
