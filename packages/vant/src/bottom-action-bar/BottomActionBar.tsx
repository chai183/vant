import {
  ref,
  cloneVNode,
  mergeProps,
  defineComponent,
  type CSSProperties,
  type ExtractPropTypes,
  type VNode,
} from 'vue';
import {
  addUnit,
  truthProp,
  numericProp,
  makeStringProp,
  createNamespace,
  type Numeric,
} from '../utils';
import { filterEmpty } from '../utils/vnode';

import VanPopover from '../popover';
import { Icon } from '../icon';
import { usePlaceholder } from '../composables/use-placeholder';
import { useSyncPropRef } from '../composables/use-sync-prop-ref';
import type { PopoverAction, PopoverPlacement, PopoverTheme } from '../popover/types';
import type { BottomActionBarMoreIconPosition } from './types';

const [name, bem] = createNamespace('bottom-action-bar');

export const bottomActionBarProps = {
  startGap: numericProp,
  barPadding: numericProp,
  moreText: makeStringProp('更多操作'),
  moreIcon: makeStringProp('arrow-double-left'),
  moreExpandedIcon: makeStringProp('arrow-double-right'),
  moreIconPosition: makeStringProp<BottomActionBarMoreIconPosition>('right'),
  moreExpanded: Boolean,
  morePopoverPlacement: makeStringProp<PopoverPlacement>('bottom-start'),
  moreTheme: makeStringProp<PopoverTheme>('light'),
  placeholder: Boolean,
  safeAreaInsetBottom: truthProp,
  maxVisibleActions: numericProp,
};

export type BottomActionBarProps = ExtractPropTypes<
  typeof bottomActionBarProps
>;

function getBarStyle(
  startGap?: Numeric,
  barPadding?: Numeric,
): CSSProperties | undefined {
  const style: Record<string, string | undefined> = {};

  if (startGap != null && startGap !== '') {
    style['--van-bottom-action-bar-start-gap'] = addUnit(startGap);
  }
  if (barPadding != null && barPadding !== '') {
    style['--van-bottom-action-bar-bar-padding'] = addUnit(barPadding);
  }

  return Object.keys(style).length ? (style as CSSProperties) : undefined;
}

function resolveMaxVisibleActions(value?: Numeric) {
  if (value == null || value === '') {
    return undefined;
  }

  const max = Number(value);
  return Number.isFinite(max) && max > 0 ? max : undefined;
}

function splitActionChildren(children: VNode[], maxVisible?: number) {
  if (maxVisible == null || children.length <= maxVisible) {
    return { visible: children, overflow: [] as VNode[] };
  }

  return {
    visible: children.slice(0, maxVisible),
    overflow: children.slice(maxVisible),
  };
}

function getSlotText(content: unknown): string {
  if (content == null || typeof content === 'boolean') {
    return '';
  }
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }
  if (Array.isArray(content)) {
    return content.map(getSlotText).join('');
  }
  if (typeof content === 'object') {
    const node = content as { children?: unknown };
    if (node.children != null) {
      return getSlotText(node.children);
    }
  }
  return '';
}

function getActionButtonText(node: VNode): string {
  const text = node.props?.text;
  if (text != null && text !== '') {
    return String(text);
  }

  const { children } = node;
  if (
    children &&
    typeof children === 'object' &&
    !Array.isArray(children) &&
    'default' in children &&
    typeof (children as { default?: unknown }).default === 'function'
  ) {
    return getSlotText((children as { default: () => unknown }).default()).trim();
  }

  return getSlotText(children).trim();
}

function toOverflowPopoverActions(overflow: VNode[]): PopoverAction[] {
  return overflow.map((node) => {
    const props = node.props ?? {};
    return {
      text: getActionButtonText(node),
      disabled: props.disabled,
      icon: props.icon,
      color: props.color,
    };
  });
}

function invokeActionButtonClick(node: VNode, event?: MouseEvent) {
  const onClick = node.props?.onClick;

  if (Array.isArray(onClick)) {
    onClick.forEach((handler) => handler?.(event));
    return;
  }

  onClick?.(event);
}

function enhanceActionButton(
  bemFn: ReturnType<typeof createNamespace>[1],
  node: VNode,
) {
  const existingClass = node.props?.class;

  return cloneVNode(
    node,
    mergeProps(node.props ?? {}, {
      class: [bemFn('button'), existingClass],
    }),
    true,
  );
}

export default defineComponent({
  name,

  props: bottomActionBarProps,

  emits: ['click-more', 'update:moreExpanded'],

  setup(props, { emit, slots }) {
    const root = ref<HTMLElement>();
    const renderPlaceholder = usePlaceholder(root, bem);
    const moreExpanded = useSyncPropRef(
      () => props.moreExpanded,
      (value) => emit('update:moreExpanded', value),
    );

    const renderMoreIcon = (expanded: boolean) => {
      if (!props.moreIcon && !props.moreExpandedIcon) {
        return null;
      }

      return (
        <Icon
          size={16}
          class={bem('more-icon')}
          name={expanded ? props.moreExpandedIcon : props.moreIcon}
        />
      );
    };

    const renderMoreReference = (expanded: boolean) => {
      if (slots['more-reference']) {
        return slots['more-reference']({ expanded });
      }

      const iconLeft = props.moreIconPosition === 'left';

      return (
        <button
          type="button"
          class={[
            bem('more'),
            bem('more', { expanded, 'icon-left': iconLeft }),
          ]}
        >
          {iconLeft ? renderMoreIcon(expanded) : null}
          <span class={bem('more-text')}>{props.moreText}</span>
          {!iconLeft ? renderMoreIcon(expanded) : null}
        </button>
      );
    };

    const renderOverflowPopover = (overflow: VNode[]) => {
      if (!overflow.length) {
        return null;
      }

      return (
        <VanPopover
          show={moreExpanded.value}
          placement={props.morePopoverPlacement}
          actions={toOverflowPopoverActions(overflow)}
          theme={props.moreTheme}
          onUpdate:show={(val: boolean) => {
            const wasOpen = moreExpanded.value;
            moreExpanded.value = val;
            if (val && !wasOpen) {
              emit('click-more');
            }
          }}
          onSelect={(_action: PopoverAction, index: number) => {
            invokeActionButtonClick(overflow[index]);
          }}
        >
          {{
            reference: () => renderMoreReference(moreExpanded.value),
          }}
        </VanPopover>
      );
    };

    const renderStart = (overflow: VNode[]) => {
      const custom = slots.more?.() ?? slots.before?.();
      const overflowPopover = renderOverflowPopover(overflow);

      if (!custom && !overflowPopover) {
        return null;
      }

      return (
        <>
          {custom}
          {overflowPopover}
        </>
      );
    };

    const getActionChildren = (): VNode[] => {
      const raw = slots.actions?.();
      if (!raw) {
        return [];
      }
      return filterEmpty(Array.isArray(raw) ? raw : [raw]);
    };

    const renderActions = (visible: VNode[]) =>
      [...visible].reverse().map((node) => enhanceActionButton(bem, node));

    const renderBar = () => {
      const { visible, overflow } = splitActionChildren(
        getActionChildren(),
        resolveMaxVisibleActions(props.maxVisibleActions),
      );
      const start = renderStart(overflow);

      return (
        <div
          ref={root}
          class={[bem(), { 'van-safe-area-bottom': props.safeAreaInsetBottom }]}
        >
          {slots.top ? <div class={bem('top')}>{slots.top()}</div> : null}
          {slots.default ? (
            <div class={bem('content')}>{slots.default()}</div>
          ) : null}
          <div
            class={bem('bar')}
            style={getBarStyle(props.startGap, props.barPadding)}
          >
            {start ? <div class={bem('start')}>{start}</div> : null}
            <div class={bem('actions')}>{renderActions(visible)}</div>
          </div>
        </div>
      );
    };

    return () => {
      if (props.placeholder) {
        return renderPlaceholder(renderBar);
      }
      return renderBar();
    };
  },
});
