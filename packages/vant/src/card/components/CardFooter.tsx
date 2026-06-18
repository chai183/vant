import { defineComponent, type PropType, type ExtractPropTypes } from 'vue';

import { createNamespace } from '../../utils';
import type {
  CardFooterButton,
  CardFooterButtonType,
  CardFooterNoteLayout,
} from '../card-types';

const [name, bem] = createNamespace('card');

const FOOTER_BUTTONS_PER_ROW = 3;

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
};

export type CardFooterProps = ExtractPropTypes<typeof cardFooterProps>;

export default defineComponent({
  name,

  props: cardFooterProps,

  emits: ['clickButton'],

  setup(props, { slots, emit }) {
    // 注释区样式
    const getFooterNoteClass = (layout: string) =>
      bem('footer-note', [layout, props.plainNote && 'no-border']);

    // 底部按钮。每行最多 3 个。
    // #buttons 插槽优先。
    const renderButtons = () => {
      if (!props.showButtons) return null;

      const slotContent = slots.buttons?.();
      const useSlot = !!slotContent;
      const list = props.buttons || [];

      if (!useSlot && !list.length) return null;

      const type = props.buttonType || 'text';

      const getButtonStyle = (btn: CardFooterButton) => {
        if (!btn.color) return undefined;

        // outline：文字 + 边框；text：仅文字
        if (type === 'outline') {
          return { color: btn.color, borderColor: btn.color };
        }
        return { color: btn.color };
      };

      // 插槽优先于 buttons 配置
      if (useSlot) {
        return <div class={bem('footer-buttons', type)}>{slotContent}</div>;
      }

      const renderButton = (btn: CardFooterButton, key: string | number) => (
        <button
          key={btn.name ?? key}
          type="button"
          class={bem('footer-btn')}
          style={getButtonStyle(btn)}
          onClick={(event: MouseEvent) =>
            emit('clickButton', {
              name: btn.name ?? key,
              text: btn.text,
              event,
            })
          }
        >
          {btn.text}
        </button>
      );

      const rows: CardFooterButton[][] = [];
      // 按每行 3 个分组
      for (let i = 0; i < list.length; i += FOOTER_BUTTONS_PER_ROW) {
        rows.push(list.slice(i, i + FOOTER_BUTTONS_PER_ROW));
      }

      return (
        <div class={bem('footer-buttons', type)}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} class={bem('footer-button-row')}>
              {row.map((btn, index) => [
                index > 0 && type === 'text' ? (
                  <div
                    key={`d-${rowIndex}-${index}`}
                    class={bem('button-divider')}
                  />
                ) : null,
                renderButton(btn, `${rowIndex}-${index}`),
              ])}
            </div>
          ))}
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
