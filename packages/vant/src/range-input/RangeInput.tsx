import {
  defineComponent,
  type PropType,
  type ExtractPropTypes,
  type VNode,
} from 'vue';

// Utils
import {
  filterEmpty,
  getModelValuePair,
  makeArrayProp,
  makeStringProp,
  createNamespace,
  applyVModelToTwoChildren,
} from '../utils';

import type { RangeInputDateShortcutType, RangeInputShortcut } from './types';
import { getDefaultDateShortcuts } from './utils';

// Components
import { Button } from '../button';

const [name, bem, t] = createNamespace('range-input');

type RangeInputRenderFn = () => VNode;

export const rangeInputProps = {
  layout: makeStringProp<'vertical' | 'horizontal'>('vertical'),
  verticalSeparator: makeStringProp('至'),
  modelValue: {
    type: Array as unknown as PropType<string[] | number[]>,
    default: () => ['', ''],
  },
  shortcuts: makeArrayProp<RangeInputShortcut>(),
  showDateShortcuts: {
    type: [Boolean, Array] as PropType<
      boolean | RangeInputDateShortcutType[]
    >,
    default: false,
  },
  /** 起始输入，渲染函数形式，需与 end 同时传入 */
  start: Function as PropType<RangeInputRenderFn>,
  /** 结束输入，渲染函数形式，需与 start 同时传入 */
  end: Function as PropType<RangeInputRenderFn>,
};

export type RangeInputProps = ExtractPropTypes<typeof rangeInputProps>;

export default defineComponent({
  name,

  props: rangeInputProps,

  emits: ['update:modelValue'],

  setup(props, { emit, slots }) {
    const normalizeSlotNodes = (raw: VNode | VNode[]) => {
      const list = Array.isArray(raw) ? raw : [raw];
      return filterEmpty(list as VNode[]);
    };

    /**
     * 取区间起止两个子节点：优先 start/end 属性，其次 start/end 插槽，最后默认插槽（需恰好两个）
     */
    const getItems = () => {
      if (props.start && props.end) {
        return filterEmpty([props.start(), props.end()]);
      }
      if (slots.start && slots.end) {
        const startNodes = normalizeSlotNodes(slots.start());
        const endNodes = normalizeSlotNodes(slots.end());
        if (startNodes[0] && endNodes[0]) {
          return [startNodes[0], endNodes[0]];
        }
        return [];
      }
      return normalizeSlotNodes(slots.default?.() ?? []);
    };

    /** 横向布局下的分隔符，支持 separator 插槽或默认线条 */
    const renderHorizontalSep = () => {
      if (slots.separator) {
        return <div class={bem('h-sep', 'custom')}>{slots.separator()}</div>;
      }
      return <div class={bem('h-sep', 'line')} />;
    };

    /** 纵向布局下的分隔符，支持 separator 插槽或默认「至」文案 */
    const renderVerticalSep = () => {
      if (slots.separator) {
        return <div class={bem('v-sep', 'custom')}>{slots.separator()}</div>;
      }
      return (
        <div
          class={bem('v-sep', 'default')}
          role="separator"
          aria-orientation="vertical"
          aria-label={String(props.verticalSeparator)}
        >
          <div class={bem('v-sep', 'segment')} />
          <span class={bem('v-sep', 'label')}>
            {props.verticalSeparator}
          </span>
          <div class={bem('v-sep', 'segment')} />
        </div>
      );
    };

    /** 合并内置日期快捷项与 shortcuts 属性传入的快捷项 */
    const getShortcuts = () => {
      const list: RangeInputShortcut[] = [];

      if (props.showDateShortcuts === true) {
        list.push(...getDefaultDateShortcuts(t));
      } else if (
        Array.isArray(props.showDateShortcuts) &&
        props.showDateShortcuts.length
      ) {
        list.push(...getDefaultDateShortcuts(t, props.showDateShortcuts));
      }
      if (props.shortcuts.length) {
        list.push(...props.shortcuts);
      }

      return list;
    };

    /** 点击快捷按钮时，用快捷项的 value 更新 v-model */
    const onShortcutClick = (shortcut: RangeInputShortcut) => {
      emit('update:modelValue', [...shortcut.value]);
    };

    /** 渲染快捷选项按钮组 */
    const renderShortcuts = () => {
      const shortcuts = getShortcuts();

      if (!shortcuts.length) {
        return;
      }

      return (
        <div class={bem('shortcuts')}>
          {shortcuts.map((shortcut, index) => (
            <Button
              key={`${shortcut.label}-${index}`}
              class={bem('shortcut')}
              size="small"
              type="default"
              onClick={() => onShortcutClick(shortcut)}
            >
              {shortcut.label}
            </Button>
          ))}
        </div>
      );
    };

    /**
     * 渲染区间主体：将两个子节点分别绑定 modelValue[0]、modelValue[1]，
     * 并按 layout 选择横向或纵向排列
     */
    const renderBody = () => {
      const raw = getItems();
      if (raw.length !== 2) {
        return;
      }

      const [left, right] = raw;
      const items = applyVModelToTwoChildren(
        left,
        right,
        () => getModelValuePair(props.modelValue),
        (next) => emit('update:modelValue', next),
      );

      if (props.layout === 'vertical') {
        return (
          <div class={bem('body', 'vertical')}>
            {renderVerticalSep()}
            <div class={bem('cell')}>{items[0]}</div>
            <div class={bem('cell')}>{items[1]}</div>
          </div>
        );
      }

      return (
        <div class={bem('body', 'horizontal')}>
          <div class={bem('cell')}>{items[0]}</div>
          {renderHorizontalSep()}
          <div class={bem('cell')}>{items[1]}</div>
        </div>
      );
    };

    return () => {
      const hasBody = getItems().length === 2;

      return (
        <div class={bem()}>
          {hasBody && getShortcuts().length ? renderShortcuts() : null}
          {renderBody()}
        </div>
      );
    };
  },
});
