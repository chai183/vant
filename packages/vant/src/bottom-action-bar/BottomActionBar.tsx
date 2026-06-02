import {
  ref,
  defineComponent,
  type CSSProperties,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import {
  addUnit,
  truthProp,
  numericProp,
  makeStringProp,
  makeArrayProp,
  createNamespace,
  type Numeric,
} from '../utils';

import VanButton, { type ButtonType } from '../button';
import VanPopover from '../popover';
import { Icon } from '../icon';
import { usePlaceholder } from '../composables/use-placeholder';
import { useSyncPropRef } from '../composables/use-sync-prop-ref';
import type {
  PopoverAction,
  PopoverPlacement,
  PopoverTheme,
} from '../popover/types';
import type {
  BottomActionBarMoreIconPosition,
  BottomActionBarMoreOptions,
} from './types';

const [name, bem] = createNamespace('bottom-action-bar');

export const bottomActionBarProps = {
  secondaryButtonText: makeStringProp(''),
  tertiaryButtonText: makeStringProp(''),
  primaryButtonText: makeStringProp('确定'),
  secondaryButtonType: makeStringProp<ButtonType>('primary'),
  tertiaryButtonType: makeStringProp<ButtonType>('primary'),
  primaryButtonType: makeStringProp<ButtonType>('primary'),
  showSecondaryButton: {
    type: Boolean,
    default: undefined,
  },
  showTertiaryButton: {
    type: Boolean,
    default: false,
  },
  showPrimaryButton: truthProp,
  secondaryButtonWidth: numericProp,
  tertiaryButtonWidth: numericProp,
  primaryButtonWidth: numericProp,
  primaryBlock: Boolean,
  round: truthProp,
  moreText: makeStringProp('更多操作'),
  moreIcon: makeStringProp('arrow-down'),
  moreExpandedIcon: makeStringProp('arrow-up'),
  moreIconPosition: makeStringProp<BottomActionBarMoreIconPosition>('right'),
  showMore: Boolean,
  moreExpandable: {
    type: Boolean,
    default: true,
  },
  moreExpanded: Boolean,
  moreActions: makeArrayProp<PopoverAction>(),
  morePopoverPlacement: makeStringProp<PopoverPlacement>('bottom-start'),
  moreOptions: Object as PropType<BottomActionBarMoreOptions | undefined>,
  secondaryDisabled: Boolean,
  tertiaryDisabled: Boolean,
  primaryDisabled: Boolean,
  secondaryLoading: Boolean,
  tertiaryLoading: Boolean,
  primaryLoading: Boolean,
  placeholder: Boolean,
  safeAreaInsetBottom: truthProp,
};

export type BottomActionBarProps = ExtractPropTypes<
  typeof bottomActionBarProps
>;

// 根据宽度生成按钮内联样式
function getButtonStyle(width?: Numeric): CSSProperties | undefined {
  if (width != null && width !== '') {
    return {
      width: addUnit(width),
      flex: 'none',
    };
  }
}

// 根据角色与布局生成按钮类名
function getButtonClass(
  bemFn: ReturnType<typeof createNamespace>[1],
  role: string,
  options: {
    width?: Numeric;
    block?: boolean;
  },
) {
  return bemFn('button', {
    [role]: true,
    fixed: options.width != null && options.width !== '',
    block: options.block,
  });
}

export default defineComponent({
  name,

  props: bottomActionBarProps,

  emits: [
    'click-secondary',
    'click-tertiary',
    'click-primary',
    'click-more',
    'update:moreExpanded',
    'select-more',
  ],

  // 组件 setup 入口
  setup(props, { emit, slots }) {
    const root = ref<HTMLElement>();
    const renderPlaceholder = usePlaceholder(root, bem);
    const moreExpanded = useSyncPropRef(
      () => props.moreExpanded,
      (value) => emit('update:moreExpanded', value),
    );

    // 判断是否展示次要按钮
    const shouldShowSecondary = () => {
      if (slots['secondary-button']) {
        return true;
      }
      if (props.showSecondaryButton === false) {
        return false;
      }
      if (props.showSecondaryButton === true) {
        return true;
      }
      return !!props.secondaryButtonText;
    };

    // 判断是否展示第三按钮
    const shouldShowTertiary = () => {
      if (slots['tertiary-button']) {
        return true;
      }
      return props.showTertiaryButton && !!props.tertiaryButtonText;
    };

    // 判断主按钮是否占满剩余宽度
    const isPrimaryBlock = () => {
      if (props.primaryBlock) {
        return true;
      }
      return (
        props.showPrimaryButton &&
        !shouldShowSecondary() &&
        !shouldShowTertiary() &&
        !props.primaryButtonWidth
      );
    };

    // 合并更多操作相关配置
    const resolveMore = () => {
      const o = props.moreOptions;
      return {
        text: o?.text ?? props.moreText,
        icon: o?.icon ?? props.moreIcon,
        expandedIcon: o?.expandedIcon ?? props.moreExpandedIcon,
        actions: o?.actions ?? props.moreActions,
        placement: o?.placement ?? props.morePopoverPlacement,
        expandable: o?.expandable ?? props.moreExpandable,
        theme: (o?.theme ?? 'light') as PopoverTheme,
        iconPosition: o?.iconPosition ?? props.moreIconPosition,
      };
    };

    // 渲染更多操作展开/收起图标
    const renderMoreIcon = (
      expanded: boolean,
      more: ReturnType<typeof resolveMore>,
    ) => {
      if (!more.icon && !more.expandedIcon) {
        return null;
      }

      return (
        <Icon
          class={bem('more-icon')}
          name={expanded ? more.expandedIcon : more.icon}
        />
      );
    };

    // 渲染 Popover 触发器（更多操作按钮）
    const renderMoreReference = (
      expanded: boolean,
      more: ReturnType<typeof resolveMore>,
    ) => {
      const iconLeft = more.iconPosition === 'left';

      return (
        <button
          type="button"
          class={[
            bem('more'),
            bem('more', { expanded, 'icon-left': iconLeft }),
          ]}
        >
          {iconLeft ? renderMoreIcon(expanded, more) : null}
          <span class={bem('more-text')}>{more.text}</span>
          {!iconLeft ? renderMoreIcon(expanded, more) : null}
        </button>
      );
    };

    // 渲染更多操作区域
    const renderMore = () => {
      if (slots.more) {
        return slots.more();
      }
      if (slots.before) {
        return slots.before();
      }
      if (!props.showMore) {
        return null;
      }

      const more = resolveMore();

      if (more.expandable) {
        const hasPanel = !!slots['more-panel'];
        return (
          <VanPopover
            show={moreExpanded.value}
            placement={more.placement}
            actions={hasPanel ? undefined : more.actions}
            theme={more.theme}
            onUpdate:show={(val: boolean) => {
              const wasOpen = moreExpanded.value;
              moreExpanded.value = val;
              if (val && !wasOpen) {
                emit('click-more');
              }
            }}
            onSelect={(action: PopoverAction, index: number) =>
              emit('select-more', action, index)
            }
          >
            {{
              reference: () => renderMoreReference(moreExpanded.value, more),
              default: hasPanel ? () => slots['more-panel']!() : undefined,
            }}
          </VanPopover>
        );
      }

      const iconLeft = more.iconPosition === 'left';

      return (
        <button
          type="button"
          class={bem('more', { 'icon-left': iconLeft })}
          onClick={() => emit('click-more')}
        >
          {iconLeft && more.icon ? (
            <Icon class={bem('more-icon')} name={more.icon} />
          ) : null}
          <span class={bem('more-text')}>{more.text}</span>
          {!iconLeft && more.icon ? (
            <Icon class={bem('more-icon')} name={more.icon} />
          ) : null}
        </button>
      );
    };

    // 渲染次要按钮
    const renderSecondary = () => {
      if (slots['secondary-button']) {
        return slots['secondary-button']();
      }
      if (!shouldShowSecondary() || !props.secondaryButtonText) {
        return null;
      }
      return (
        <VanButton
          round={props.round}
          plain
          type={props.secondaryButtonType}
          text={props.secondaryButtonText}
          disabled={props.secondaryDisabled}
          loading={props.secondaryLoading}
          class={getButtonClass(bem, 'secondary', {
            width: props.secondaryButtonWidth,
          })}
          style={getButtonStyle(props.secondaryButtonWidth)}
          onClick={() => emit('click-secondary')}
        />
      );
    };

    // 渲染第三按钮
    const renderTertiary = () => {
      if (slots['tertiary-button']) {
        return slots['tertiary-button']();
      }
      if (!shouldShowTertiary() || !props.tertiaryButtonText) {
        return null;
      }
      return (
        <VanButton
          round={props.round}
          plain
          type={props.tertiaryButtonType}
          text={props.tertiaryButtonText}
          disabled={props.tertiaryDisabled}
          loading={props.tertiaryLoading}
          class={getButtonClass(bem, 'tertiary', {
            width: props.tertiaryButtonWidth,
          })}
          style={getButtonStyle(props.tertiaryButtonWidth)}
          onClick={() => emit('click-tertiary')}
        />
      );
    };

    // 渲染主按钮
    const renderPrimary = () => {
      if (slots['primary-button']) {
        return slots['primary-button']();
      }
      if (!props.showPrimaryButton) {
        return null;
      }
      const block = isPrimaryBlock();
      return (
        <VanButton
          round={props.round}
          type={props.primaryButtonType}
          text={props.primaryButtonText}
          disabled={props.primaryDisabled}
          loading={props.primaryLoading}
          class={getButtonClass(bem, 'primary', {
            width: props.primaryButtonWidth,
            block,
          })}
          style={getButtonStyle(props.primaryButtonWidth)}
          block={block}
          onClick={() => emit('click-primary')}
        />
      );
    };

    // 渲染右侧按钮组
    const renderActions = () => {
      if (slots.actions) {
        return slots.actions();
      }
      return (
        <>
          {renderSecondary()}
          {renderTertiary()}
          {renderPrimary()}
        </>
      );
    };

    // 渲染底部操作栏主体
    const renderBar = () => {
      const start = renderMore();
      return (
        <div
          ref={root}
          class={[bem(), { 'van-safe-area-bottom': props.safeAreaInsetBottom }]}
        >
          {slots.top ? <div class={bem('top')}>{slots.top()}</div> : null}
          {slots.default ? (
            <div class={bem('content')}>{slots.default()}</div>
          ) : null}
          <div class={bem('bar')}>
            {start ? <div class={bem('start')}>{start}</div> : null}
            <div class={bem('actions')}>{renderActions()}</div>
          </div>
        </div>
      );
    };

    // 渲染组件根节点（支持占位高度）
    return () => {
      if (props.placeholder) {
        return renderPlaceholder(renderBar);
      }
      return renderBar();
    };
  },
});
