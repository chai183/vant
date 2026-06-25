import {
  defineComponent,
  ref,
  type PropType,
  type ExtractPropTypes,
  type CSSProperties,
} from 'vue';

import { createNamespace, makeNumberProp, makeStringProp } from '../../utils';
import VanPopover from '../../popover';
import type { PopoverAction } from '../../popover';
import type {
  CardFooterButton,
  CardFooterButtonType,
  CardFooterNoteLayout,
} from '../card-types';

const [name, bem] = createNamespace('card');

const TEXT_MAX_VISIBLE = 4;
const TEXT_MAX_CHARS = 4;

const truncateButtonText = (text: string, max = TEXT_MAX_CHARS) =>
  text.length > max ? text.slice(0, max) : text;

const splitFooterButtons = (list: CardFooterButton[], maxVisible: number) => {
  if (list.length <= maxVisible) {
    return { visible: list, overflow: [] as CardFooterButton[] };
  }

  return {
    visible: list.slice(0, maxVisible),
    overflow: list.slice(maxVisible),
  };
};

const getOutlineButtonRowStyle = (
  visibleCount: number,
  hasMore: boolean,
): CSSProperties | undefined => {
  if (visibleCount <= 0) {
    return undefined;
  }

  const gap = 'var(--van-card-footer-outline-gap)';
  const moreWidth = 'var(--van-card-footer-more-width)';
  let deducted = '';

  if (visibleCount > 1) {
    deducted += ` - ${visibleCount - 1} * ${gap}`;
  }
  if (hasMore) {
    deducted += ` - ${moreWidth} - ${gap}`;
  }

  return {
    '--van-card-outline-btn-max-width': `calc((100%${deducted}) / ${visibleCount})`,
  } as CSSProperties;
};

export const cardFooterProps = {
  showButtons: Boolean,
  buttonType: String as PropType<CardFooterButtonType>,
  buttons: {
    type: Array as PropType<CardFooterButton[]>,
    default: () => [],
  },
  noteLayout: String as PropType<CardFooterNoteLayout>,
  noteLeft: String,
  noteRight: String,
  note: String,
  plainNote: Boolean, // 图文卡注释区去掉顶部分割线
  outlineMax: makeNumberProp(3),
  outlineMoreText: makeStringProp('更多'),
  outlineCollapseText: makeStringProp('收起'),
};

export type CardFooterProps = ExtractPropTypes<typeof cardFooterProps>;

export default defineComponent({
  name,

  props: cardFooterProps,

  emits: ['clickButton'],

  setup(props, { slots, emit }) {
    const overflowPopoverShow = ref(false);

    // 注释区样式
    const getFooterNoteClass = (layout: string) =>
      bem('footer-note', [layout, props.plainNote && 'no-border']);

    const emitButtonClick = (
      btn: CardFooterButton,
      key: string | number,
      event?: MouseEvent,
    ) => {
      emit('clickButton', {
        name: btn.name ?? key,
        text: btn.text,
        event,
      });
    };

    const getButtonStyle = (
      btn: CardFooterButton,
      type: CardFooterButtonType,
    ) => {
      if (!btn.color) return undefined;

      // outline：文字 + 边框；text：仅文字
      if (type === 'outline') {
        return { color: btn.color, borderColor: btn.color };
      }
      return { color: btn.color };
    };

    const renderOverflowPopover = (
      overflow: CardFooterButton[],
      reference: () => JSX.Element,
    ) => {
      const actions: PopoverAction[] = overflow.map((btn) => ({
        text: btn.text,
      }));

      return (
        <VanPopover
          class={bem('footer-popover')}
          show={overflowPopoverShow.value}
          actions={actions}
          placement="bottom-start"
          onUpdate:show={(value: boolean) => {
            overflowPopoverShow.value = value;
          }}
          onSelect={(_action: PopoverAction, index: number) => {
            const btn = overflow[index];
            if (btn) {
              emitButtonClick(btn, `overflow-${index}`);
            }
          }}
        >
          {{
            reference,
          }}
        </VanPopover>
      );
    };

    // 底部按钮。text 单行最多 4 个；outline 单行展示数由 outlineMax 控制。
    // #buttons 插槽优先。
    const renderButtons = () => {
      if (!props.showButtons) return null;

      const slotContent = slots.buttons?.();
      const useSlot = !!slotContent;
      const list = props.buttons || [];

      if (!useSlot && !list.length) return null;

      const type = props.buttonType || 'text';

      // 插槽优先于 buttons 配置
      if (useSlot) {
        return <div class={bem('footer-buttons', type)}>{slotContent}</div>;
      }

      const renderButton = (btn: CardFooterButton, key: string | number) => (
        <button
          key={btn.name ?? key}
          type="button"
          class={bem('footer-btn')}
          style={getButtonStyle(btn, type)}
          onClick={(event: MouseEvent) => emitButtonClick(btn, key, event)}
        >
          {type === 'text' ? (
            truncateButtonText(btn.text)
          ) : (
            <span class={bem('footer-btn-text')}>{btn.text}</span>
          )}
        </button>
      );

      const renderDivider = (key: string) => (
        <div key={key} class={bem('button-divider')} />
      );

      if (type === 'text') {
        const { visible, overflow } = splitFooterButtons(
          list,
          TEXT_MAX_VISIBLE,
        );

        const renderOverflowTrigger = () => (
          <button type="button" class={bem('footer-overflow')}>
            <span class={bem('footer-overflow-dots')} aria-hidden="true">
              <i class={bem('footer-overflow-dot')} />
              <i class={bem('footer-overflow-dot')} />
              <i class={bem('footer-overflow-dot')} />
            </span>
          </button>
        );

        return (
          <div class={bem('footer-buttons', type)}>
            <div
              class={bem('footer-button-row', {
                overflow: overflow.length > 0,
              })}
            >
              {visible.map((btn, index) => [
                index > 0 ? renderDivider(`d-${index}`) : null,
                renderButton(btn, index),
              ])}
              {overflow.length
                ? [
                    renderDivider('d-overflow'),
                    <div key="overflow" class={bem('footer-overflow-wrap')}>
                      {renderOverflowPopover(overflow, renderOverflowTrigger)}
                    </div>,
                  ]
                : null}
            </div>
          </div>
        );
      }

      const outlineMax = Math.max(1, props.outlineMax);
      const { visible, overflow } = splitFooterButtons(list, outlineMax);

      const renderMoreTrigger = () => (
        <button type="button" class={bem('footer-more')}>
          {overflowPopoverShow.value
            ? props.outlineCollapseText
            : props.outlineMoreText}
        </button>
      );

      return (
        <div class={bem('footer-buttons', type)}>
          <div
            class={bem('footer-button-row')}
            style={getOutlineButtonRowStyle(
              visible.length,
              overflow.length > 0,
            )}
          >
            {visible.map((btn, index) => renderButton(btn, index))}
            {overflow.length
              ? renderOverflowPopover(overflow, renderMoreTrigger)
              : null}
          </div>
        </div>
      );
    };

    // 底部注释区
    // 支持 center / split / left
    // #footer-note 插槽优先
    const renderNote = () => {
      const slotNote = slots['footer-note']?.();
      if (slotNote) {
        return (
          <div class={getFooterNoteClass(props.noteLayout || 'center')}>
            {slotNote}
          </div>
        );
      }

      const layout = props.noteLayout || 'center';

      // split: 左右文案分两侧
      if (layout === 'split') {
        if (!props.noteLeft && !props.noteRight) return null;
        return (
          <div class={getFooterNoteClass('split')}>
            <span class={bem('note-left')}>{props.noteLeft}</span>
            <span class={bem('note-right')}>{props.noteRight}</span>
          </div>
        );
      }

      if (!props.note) return null;
      return (
        <div class={getFooterNoteClass(layout)}>
          <span class={bem('note-center')}>{props.note}</span>
        </div>
      );
    };

    return () => {
      const buttons = renderButtons();
      const note = renderNote();

      // 底部都为空时不渲染
      if (!buttons && !note) return null;

      return (
        <div class={bem('footer')}>
          {buttons}
          {note}
        </div>
      );
    };
  },
});
