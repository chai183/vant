import {
  ref,
  computed,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

import { createNamespace } from '../../utils';
import { Icon } from '../../icon';
import type { CardTextListItem, CardTextListSlotProps } from '../card-types';
import {
  getEllipsisClass,
  getLineClampStyle,
  normalizeTextRows,
} from '../utils';

const [name, bem] = createNamespace('card');

export const cardTextListProps = {
  items: {
    type: Array as PropType<CardTextListItem[]>,
    default: () => [],
  },
  collapsible: Boolean,
  collapseRows: {
    type: Number,
    default: 3,
  },
  expandText: {
    type: String,
    default: '展开',
  },
  collapseText: {
    type: String,
    default: '收起',
  },
};

export type CardTextListProps = ExtractPropTypes<typeof cardTextListProps>;

export default defineComponent({
  name,

  props: cardTextListProps,

  emits: ['clickContentAction'],

  setup(props, { slots, emit }) {
    // 当前是否展开
    const expanded = ref(false);

    // 折叠态只显示前几行
    const displayItems = computed(() => {
      if (!props.collapsible || expanded.value) {
        return props.items;
      }
      return props.items.slice(0, props.collapseRows);
    });

    const showToggle = computed(
      () => props.collapsible && props.items.length > props.collapseRows,
    );

    // 展开/收起切换
    const toggle = () => {
      expanded.value = !expanded.value;
    };

    // 行级插槽统一透出事件
    const getRowSlotProps = (
      item: CardTextListItem,
      index: number,
    ): CardTextListSlotProps => ({
      index,
      item,
      onActionClick: (event?: MouseEvent) => {
        emit('clickContentAction', { index, item, event });
      },
    });

    // 插槽优先级：index > 具名 key > 全局
    const resolveRowSlot = (base: string, index: number, slotKey?: string) => {
      const indexed = slots[`${base}-${index}`];
      if (indexed) return indexed;

      if (slotKey) {
        const named = slots[`${base}-${slotKey}`];
        if (named) return named;
      }

      if (base === 'text-list-action') {
        return slots['text-list-action'] || slots['content-action'];
      }

      return slots[base];
    };

    const renderLabel = (item: CardTextListItem, index: number) => {
      const slot = resolveRowSlot('text-list-label', index, item.labelSlot);
      const slotProps = getRowSlotProps(item, index);

      if (slot) {
        return <div class={bem('text-list-label')}>{slot(slotProps)}</div>;
      }

      return <div class={bem('text-list-label')}>{item.label}</div>;
    };

    const renderValue = (item: CardTextListItem, index: number) => {
      const slot = resolveRowSlot('text-list-value', index, item.valueSlot);
      const slotProps = getRowSlotProps(item, index);

      if (slot) {
        return <div class={bem('text-list-value')}>{slot(slotProps)}</div>;
      }

      // value 没有插槽时按行数省略
      const rows = normalizeTextRows(item.valueRows, 1);
      const cls = getEllipsisClass(rows);
      const style = getLineClampStyle(rows);

      return (
        <div class={[bem('text-list-value'), cls]} style={style}>
          {item.value}
        </div>
      );
    };

    const renderAction = (item: CardTextListItem, index: number) => {
      const slot = resolveRowSlot('text-list-action', index, item.actionSlot);
      const slotProps = getRowSlotProps(item, index);

      if (slot) {
        return <div class={bem('text-list-action')}>{slot(slotProps)}</div>;
      }

      // 没有插槽时渲染预制按钮
      if (item.buttonText) {
        return (
          <div class={bem('text-list-action')}>
            <button
              type="button"
              class={bem('text-list-btn')}
              onClick={(event: MouseEvent) => slotProps.onActionClick(event)}
            >
              {item.buttonText}
            </button>
          </div>
        );
      }
    };

    const renderDefaultRow = (item: CardTextListItem, index: number) => (
      <div class={bem('text-list-row')} key={index}>
        {renderLabel(item, index)}
        <div class={bem('text-list-main')}>
          {renderValue(item, index)}
          {renderAction(item, index)}
        </div>
      </div>
    );

    const renderRow = (item: CardTextListItem, index: number) => {
      const rowSlot = resolveRowSlot('text-list-row', index, item.rowSlot);
      if (rowSlot) {
        return (
          <div class={bem('text-list-row', 'custom')} key={index}>
            {rowSlot(getRowSlotProps(item, index))}
          </div>
        );
      }

      return renderDefaultRow(item, index);
    };

    return () => {
      // 空列表不渲染
      if (!props.items.length) return null;

      return (
        <div class={bem('text-list')}>
          {displayItems.value.map((item, index) => renderRow(item, index))}
          {showToggle.value && (
            <div class={bem('collapse-toggle')} onClick={toggle}>
              <span>
                {expanded.value ? props.collapseText : props.expandText}
              </span>
              <Icon
                name="arrow-down"
                class={bem('collapse-icon', { expanded: expanded.value })}
              />
            </div>
          )}
        </div>
      );
    };
  },
});
