import {
  cloneVNode,
  mergeProps,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
  type VNode,
} from 'vue';
import { useCustomFieldValue } from '@vant/use';

// Utils
import {
  BORDER_BOTTOM,
  isDef,
  filterEmpty,
  makeStringProp,
  createNamespace,
  truthProp,
  unknownProp,
} from '../utils';
import { useExpose } from '../composables/use-expose';
import type { FieldChildrenExpose } from './types';

const [name, bem] = createNamespace('field-children');

type FieldChildrenRowRenderFn = () => VNode;

/** 将 modelValue 规范为数组，非数组时返回空数组 */
function getList(modelValue: unknown): unknown[] {
  if (!Array.isArray(modelValue)) {
    return [];
  }
  return modelValue;
}

export const fieldChildrenProps = {
  modelValue: {
    type: Array as PropType<unknown[]>,
    default: () => [''],
  },
  /** 调用 add 追加行时的默认值 */
  defaultRowValue: unknownProp,
  deletable: truthProp,
  minItems: {
    type: Number,
    default: 0,
  },
  /** 达到后 add 不再追加行 */
  maxItems: Number,
  deleteIcon: makeStringProp('minus'),
  /** 行模板，渲染函数形式，优先级高于 default 插槽 */
  row: Function as PropType<FieldChildrenRowRenderFn>,
};

export type FieldChildrenProps = ExtractPropTypes<typeof fieldChildrenProps>;

export default defineComponent({
  name,

  props: fieldChildrenProps,

  emits: ['update:modelValue'],

  setup(props, { emit, slots }) {
    useCustomFieldValue(() => props.modelValue);

    /** 取行克隆模板：优先 row 属性，其次 default 插槽 */
    const getTemplate = (): VNode | undefined => {
      if (props.row) {
        return filterEmpty([props.row()])[0];
      }
      const raw = slots.default?.() || [];
      const list = Array.isArray(raw) ? raw : [raw];
      const items = filterEmpty(list as VNode[]);
      return items[0];
    };

    /** 读取当前 v-model 列表 */
    const getListFromProps = () => getList(props.modelValue);

    /** 同步列表并触发 update:modelValue */
    const emitList = (next: unknown[]) => {
      emit('update:modelValue', next);
    };

    const canAdd = () => {
      const cur = getListFromProps();
      return !isDef(props.maxItems) || cur.length < props.maxItems;
    };

    /** 在末尾追加一行，受 maxItems 限制 */
    const add = () => {
      if (!canAdd()) {
        return;
      }
      const cur = getListFromProps();
      const cell =
        props.defaultRowValue !== undefined ? props.defaultRowValue : '';
      emitList([...cur, cell]);
    };

    /** 删除指定下标，受 minItems 限制 */
    const onRemove = (index: number) => {
      const cur = getListFromProps();
      if (cur.length <= props.minItems) {
        return;
      }
      emitList(cur.filter((_, i) => i !== index));
    };

    useExpose<FieldChildrenExpose>({
      add,
      canAdd,
    });

    /**
     * 克隆行模板并绑定该行 modelValue；
     * 满足 deletable 且未自定义 rightIcon 时注入删除图标
     */
    const cloneRow = (template: VNode, index: number, list: unknown[]) => {
      const oldProps = (template.props || {}) as Record<string, unknown>;
      const canDelete =
        props.deletable &&
        list.length > props.minItems &&
        oldProps.rightIcon === undefined;

      const merged: Record<string, unknown> = {
        modelValue: list[index],
        'onUpdate:modelValue': (val: unknown) => {
          const next = [...list];
          next[index] = val;
          emitList(next);
        },
      };

      if (canDelete) {
        merged.rightIcon = props.deleteIcon;
        merged.onClickRightIcon = () => {
          onRemove(index);
        };
      }

      return cloneVNode(template, mergeProps(oldProps, merged), true);
    };

    /** 按列表长度渲染各行（含树形连接线） */
    const renderBody = () => {
      const template = getTemplate();
      if (!template) {
        return;
      }

      const list = getListFromProps();
      if (!list.length) {
        return;
      }

      return list.map((_, index) => (
        <div key={index} class={[bem('item'), BORDER_BOTTOM]}>
          <div class={bem('tree')}>
            <div class={bem('tree-rail')} />
            <div class={bem('tree-arm')} />
          </div>
          <div class={bem('item-body')}>{cloneRow(template, index, list)}</div>
        </div>
      ));
    };

    return () => (
      <div class={bem()}>
        <div class={bem('body')}>{renderBody()}</div>
      </div>
    );
  },
});
