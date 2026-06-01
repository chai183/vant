import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  mergeProps,
  type VNode,
} from 'vue';

/**
 * 将区间类组件的 modelValue 规范为 [起始值, 结束值] 字符串对。
 * 非数组或缺项时对应位置回退为空字符串。
 */
export function getModelValuePair(
  modelValue: string[] | number[] | undefined,
): [string, string] {
  if (!Array.isArray(modelValue)) {
    return ['', ''];
  }
  return [String(modelValue[0] ?? ''), String(modelValue[1] ?? '')];
}

/**
 * 为两个子 VNode 分别绑定 v-model 的第一、第二项，
 * 并在单侧更新时通过 onUpdate 回写完整的二元组。
 */
export function applyVModelToTwoChildren(
  first: VNode,
  second: VNode,
  getPairFn: () => [string, string],
  onUpdate: (next: [string, string]) => void,
): [VNode, VNode] {
  /** 克隆子节点并注入对应下标的 modelValue 与 onUpdate:modelValue */
  const bind = (vnode: VNode, i: 0 | 1) => {
    const [a, b] = getPairFn();
    return cloneVNode(
      vnode,
      mergeProps(vnode.props ?? {}, {
        modelValue: i === 0 ? a : b,
        'onUpdate:modelValue': (val: unknown) => {
          const s = String(val ?? '');
          const [curA, curB] = getPairFn();
          onUpdate(i === 0 ? [s, curB] : [curA, s]);
        },
      }),
      true,
    );
  };
  return [bind(first, 0), bind(second, 1)];
}

/**
 * 扁平化插槽子节点（含嵌套数组与 Fragment），
 * 并过滤注释、空 Fragment、仅空白文本等无效节点。
 */
export function filterEmpty(children: VNode[] = []) {
  const nodes: VNode[] = [];
  children.forEach((child) => {
    if (Array.isArray(child)) {
      nodes.push(...filterEmpty(child));
    } else if (child?.type === Fragment) {
      nodes.push(...filterEmpty((child.children as VNode[]) || []));
    } else if (child) {
      nodes.push(child);
    }
  });
  return nodes.filter(
    (c) =>
      !(
        c &&
        (c.type === Comment ||
          (c.type === Fragment && !(c.children as VNode[])?.length) ||
          (c.type === Text &&
            String((c.children as string) ?? '').trim() === ''))
      ),
  );
}
