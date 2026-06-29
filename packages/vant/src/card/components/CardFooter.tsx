import {
  defineComponent,
  type PropType,
  type ExtractPropTypes,
  type CSSProperties,
} from 'vue';

import { createNamespace, makeNumberProp, makeStringProp } from '../../utils';
import VanBottomActionBar from '../../bottom-action-bar';
import type { BottomActionBarProps } from '../../bottom-action-bar';
import VanButton from '../../button';
import VanIcon from '../../icon';
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

const getActionChildrenOrder = (
  list: CardFooterButton[],
  maxVisible: number,
) => {
  const visible = list.slice(0, maxVisible).reverse();
  const overflow = list.slice(maxVisible);
  return [...visible, ...overflow];
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
  plainNote: Boolean,
  outlineMax: makeNumberProp(3),
  outlineMoreText: makeStringProp('更多'),
  outlineCollapseText: makeStringProp('收起'),
  actionBarProps: Object as PropType<Partial<BottomActionBarProps>>,
};

export type CardFooterProps = ExtractPropTypes<typeof cardFooterProps>;

export default defineComponent({
  name,

  props: cardFooterProps,

  emits: ['clickButton'],

  setup(props, { slots, emit }) {
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

    const getOutlineButtonStyle = (
      btn: CardFooterButton,
    ): CSSProperties | undefined => {
      if (btn.disabled || !btn.color) {
        return undefined;
      }

      return {
        color: btn.color,
        borderColor: btn.color,
        '--van-button-custom-border-color': btn.color,
      } as CSSProperties;
    };

    const handleButtonClick = (
      btn: CardFooterButton,
      key: string | number,
      event: MouseEvent,
    ) => {
      if (btn.disabled) {
        event.preventDefault();
        return;
      }
      emitButtonClick(btn, key, event);
    };

    const resolveActionBarProps = (
      type: CardFooterButtonType,
    ): Partial<BottomActionBarProps> => {
      const outlineMax = Math.max(1, props.outlineMax);
      const passthrough = props.actionBarProps ?? {};
      const defaultMax = type === 'text' ? TEXT_MAX_VISIBLE : outlineMax;

      return {
        morePopoverPlacement: 'bottom-start',
        startGap: type === 'text' ? 0 : undefined,
        ...passthrough,
        safeAreaInsetBottom: passthrough.safeAreaInsetBottom ?? false,
        placeholder: passthrough.placeholder ?? false,
        maxVisibleActions: passthrough.maxVisibleActions ?? defaultMax,
      };
    };

    const renderTextActionButton = (
      btn: CardFooterButton,
      index: number,
      total: number,
    ) => {
      const button = (
        <VanButton
          class={bem('footer-btn')}
          size="small"
          textButton
          plain={index < total - 1}
          type="primary"
          disabled={btn.disabled}
          color={btn.color}
          onClick={(event: MouseEvent) => handleButtonClick(btn, index, event)}
        >
          {truncateButtonText(btn.text)}
        </VanButton>
      );

      if (index === total - 1) {
        return button;
      }

      return (
        <div class={[bem('text-action'), 'van-hairline--left']}>{button}</div>
      );
    };

    const renderOutlineActionButton = (
      btn: CardFooterButton,
      index: number,
    ) => (
      <VanButton
        key={btn.name ?? index}
        class={bem('footer-btn')}
        size="small"
        plain
        disabled={btn.disabled}
        color={btn.color}
        style={getOutlineButtonStyle(btn)}
        onClick={(event: MouseEvent) => handleButtonClick(btn, index, event)}
      >
        <span class={bem('footer-btn-text')}>{btn.text}</span>
      </VanButton>
    );

    const renderButtons = () => {
      if (!props.showButtons) return null;

      const slotContent = slots.buttons?.();
      const useSlot = !!slotContent;
      const list = props.buttons || [];

      if (!useSlot && !list.length) return null;

      const type = props.buttonType || 'text';

      if (useSlot) {
        return (
          <div class={[bem('footer-buttons', type), bem('footer-action-bar')]}>
            {slotContent}
          </div>
        );
      }

      const actionBarProps = resolveActionBarProps(type);

      if (type === 'text') {
        return (
          <VanBottomActionBar
            class={[bem('footer-buttons', type), bem('footer-action-bar')]}
            {...actionBarProps}
          >
            {{
              'more-reference': () => (
                <VanIcon name="ellipsis" class={bem('footer-overflow-icon')} />
              ),
              actions: () =>
                getActionChildrenOrder(list, TEXT_MAX_VISIBLE).map(
                  (btn, index, arr) =>
                    renderTextActionButton(btn, index, arr.length),
                ),
            }}
          </VanBottomActionBar>
        );
      }

      return (
        <VanBottomActionBar
          class={[bem('footer-buttons', type), bem('footer-action-bar')]}
          {...actionBarProps}
        >
          {{
            'more-reference': ({ expanded }: { expanded: boolean }) => (
              <span class={bem('footer-more')}>
                {expanded ? props.outlineCollapseText : props.outlineMoreText}
              </span>
            ),
            actions: () =>
              list.map((btn, index) => renderOutlineActionButton(btn, index)),
          }}
        </VanBottomActionBar>
      );
    };

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
