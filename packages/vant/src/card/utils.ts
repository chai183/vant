import {
  Comment,
  Fragment,
  Text,
  type Slots,
  type VNode,
  type PropType,
  type CSSProperties,
} from 'vue';

import { pick } from '../utils';
import type { CardTextRows } from './card-types';

export const FULL_TEXT_ROWS = 'auto';

export const makeTextRowsProp = (defaultVal: number) => ({
  type: [Number, String] as PropType<CardTextRows>,
  default: defaultVal,
});

// 判断插槽渲染结果是否为空（避免空 default 仍包一层 __body） 没有卡片body区域 则不渲染body
export function isEmptySlotContent(
  content: VNode | VNode[] | null | undefined,
): any {
  if (content == null) {
    return true;
  }

  const nodes = (Array.isArray(content) ? content : [content]).flat();

  return nodes.every((node) => {
    if (!node || node.type === Comment) {
      return true;
    }

    if (node.type === Text) {
      const children = node.children;
      if (children == null || children === '') {
        return true;
      }
      if (typeof children === 'string') {
        return !children.trim();
      }
    }

    if (node.type === Fragment) {
      const children = node.children;
      if (!children || (Array.isArray(children) && children.length === 0)) {
        return true;
      }
      if (Array.isArray(children)) {
        return isEmptySlotContent(children as VNode[]);
      }
    }

    return false;
  });
}

// 转发 text-list 相关插槽到 CardTextList
export function pickTextListSlots(slots: Slots) {
  return pick(
    slots,
    (Object.keys(slots) as Extract<keyof Slots, string>[]).filter(
      (name) => name === 'content-action' || name.startsWith('text-list-'),
    ),
  );
}

// selectable 整卡点击切换选中时忽略的区域（link 图标单独触发 click-title）
export function shouldIgnoreSelectToggle(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return true;
  }

  return !!target.closest(
    [
      'button',
      'a',
      '.van-button',
      '.van-checkbox',
      '.van-card__title-action',
      '.van-card__title-link-wrap',
      '.van-card__body-link-wrap',
      '.van-card__text-list-btn',
      '.van-card__text-list-action',
      '.van-card__collapse-toggle',
      '.van-card__footer',
    ].join(', '),
  );
}

// 行数省略：1~3 用全局 ellipsis 类，>3 用 line-clamp 内联样式
export function normalizeTextRows(
  rows: CardTextRows | string | undefined,
  defaultRows: number,
) {
  if (rows === FULL_TEXT_ROWS) {
    return FULL_TEXT_ROWS;
  }

  const value = Number(rows ?? defaultRows);
  return Number.isNaN(value) ? defaultRows : value;
}

// 行数省略：auto 不省略；1~3 用全局 ellipsis 类，>3 用 line-clamp 内联样式
export function getEllipsisClass(rows: CardTextRows) {
  if (rows === FULL_TEXT_ROWS) {
    return '';
  }

  if (rows <= 1) {
    return 'van-ellipsis';
  }
  if (rows === 2) {
    return 'van-multi-ellipsis--l2';
  }
  if (rows === 3) {
    return 'van-multi-ellipsis--l3';
  }
  return '';
}
// vant没有预制4行以上的
// 多行省略内联样式：与 getEllipsisClass 配合，1~3 行用全局类，>3 行用 -webkit-line-clamp
// Card 标题/副标题、CardTextList 等传入 titleRows、subtitleRows 时调用
export function getLineClampStyle(
  rows: CardTextRows,
): CSSProperties | undefined {
  if (rows === FULL_TEXT_ROWS) {
    return undefined;
  }

  // 1~3 行已由 van-ellipsis / van-multi-ellipsis--l2|l3 处理，无需内联
  if (rows <= 3) {
    return undefined;
  }
  // 4 行及以上：全局样式未预置，按行数动态 clamp
  return {
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical' as const,
    WebkitLineClamp: rows,
  };
}
