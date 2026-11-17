import { ref, computed, defineComponent, type ExtractPropTypes } from 'vue';
import { truthProp, makeStringProp, createNamespace } from '../utils';

import { Checkbox } from '../checkbox';
import VanButton, { type ButtonType } from '../button';
import { Icon } from '../icon';
import { usePlaceholder } from '../composables/use-placeholder';

const [name, bem] = createNamespace('order-select-bar');

export const orderSelectBarProps = {
  modelValue: Boolean,
  selectAllText: makeStringProp('全选'),
  secondaryButtonText: makeStringProp('次要操作'),
  tertiaryButtonText: makeStringProp(''),
  primaryButtonText: makeStringProp('结算'),
  secondaryButtonType: makeStringProp<ButtonType>('primary'),
  tertiaryButtonType: makeStringProp<ButtonType>('default'),
  primaryButtonType: makeStringProp<ButtonType>('primary'),
  showSecondaryButton: truthProp,
  showTertiaryButton: {
    type: Boolean,
    default: false,
  },
  checkboxDisabled: Boolean,
  indeterminate: Boolean,
  secondaryDisabled: Boolean,
  tertiaryDisabled: Boolean,
  primaryDisabled: Boolean,
  secondaryLoading: Boolean,
  tertiaryLoading: Boolean,
  primaryLoading: Boolean,
  collectText: makeStringProp('收藏'),
  shareText: makeStringProp('分享'),
  collectIcon: makeStringProp('star-o'),
  collectIconActive: makeStringProp('star'),
  collectActive: Boolean,
  shareIcon: makeStringProp('share-o'),
  showCollect: truthProp,
  showShare: truthProp,
  placeholder: Boolean,
  safeAreaInsetBottom: truthProp,
  isAllCheck: truthProp,
};

export type OrderSelectBarProps = ExtractPropTypes<typeof orderSelectBarProps>;

export default defineComponent({
  name,

  props: orderSelectBarProps,

  emits: [
    'update:modelValue',
    'click-collect',
    'click-share',
    'click-secondary',
    'click-tertiary',
    'click-primary',
  ],

  setup(props, { emit, slots }) {
    const root = ref<HTMLElement>();
    const renderPlaceholder = usePlaceholder(root, bem);

    const collectIconName = computed(() =>
      props.collectActive ? props.collectIconActive : props.collectIcon,
    );

    const onCheckboxChange = (value: boolean) => {
      emit('update:modelValue', value);
    };

    const toggleSelectAll = () => {
      if (props.checkboxDisabled) {
        return;
      }
      onCheckboxChange(!props.modelValue);
    };

    const getLeftSlotProps = () => ({
      checked: props.modelValue,
      indeterminate: props.indeterminate,
      disabled: props.checkboxDisabled,
      updateChecked: onCheckboxChange,
    });
    // 默认的全选
    const renderDefaultSelectAll = () => (
      <>
        <Checkbox
          modelValue={props.modelValue}
          disabled={props.checkboxDisabled}
          indeterminate={props.indeterminate}
          onUpdate:modelValue={onCheckboxChange}
          shape="square"
        />
        <span
          role="button"
          tabindex={0}
          class={bem('select-text')}
          onClick={toggleSelectAll}
          onKeydown={(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSelectAll();
            }
          }}
        >
          {props.selectAllText}
        </span>
      </>
    );
    // 左侧渲染
    const renderLeft = () => {
      if (slots.left) {
        return slots.left(getLeftSlotProps());
      }

      if (props.isAllCheck) {
        return renderDefaultSelectAll();
      }
    };
    // 收藏渲染
    const renderCollect = () => {
      if (slots.collect) {
        return slots.collect();
      }
      if (!props.showCollect) {
        return null;
      }
      return (
        <VanButton
          nativeType="button"
          type="default"
          plain
          size="small"
          class={bem('icon-item', { active: props.collectActive })}
          onClick={() => emit('click-collect')}
        >
          <div class={bem('icon-slot')}>
            <Icon name={collectIconName.value} class={bem('icon')} />
            <span>{props.collectText}</span>
          </div>
        </VanButton>
      );
    };
    // 分享渲染
    const renderShare = () => {
      if (slots.share) {
        return slots.share();
      }
      if (!props.showShare) {
        return null;
      }
      return (
        <VanButton
          nativeType="button"
          type="default"
          plain
          size="small"
          class={bem('icon-item')}
          onClick={() => emit('click-share')}
        >
          <div class={bem('icon-slot')}>
            <Icon name={props.shareIcon} class={bem('icon')} />
            <span>{props.shareText}</span>
          </div>
        </VanButton>
      );
    };

    const renderIconStrip = () => {
      const collect = renderCollect();
      const share = renderShare();
      if (!collect && !share) {
        return null;
      }
      return (
        <div class={bem('icons')}>
          {collect}
          {share}
        </div>
      );
    };

    const renderSecondary = () => {
      if (slots['secondary-button']) {
        return slots['secondary-button']();
      }
      if (!props.showSecondaryButton) {
        return null;
      }
      return (
        <VanButton
          size="large"
          width="112px"
          plain
          type={props.secondaryButtonType}
          text={props.secondaryButtonText}
          disabled={props.secondaryDisabled}
          loading={props.secondaryLoading}
          class={bem('button', 'secondary')}
          onClick={() => emit('click-secondary')}
        />
      );
    };

    const renderTertiary = () => {
      if (slots['tertiary-button']) {
        return slots['tertiary-button']();
      }
      if (!props.showTertiaryButton || !props.tertiaryButtonText) {
        return null;
      }
      return (
        <VanButton
          size="large"
          width="112px"
          plain
          type={props.tertiaryButtonType}
          text={props.tertiaryButtonText}
          disabled={props.tertiaryDisabled}
          loading={props.tertiaryLoading}
          class={bem('button', 'tertiary')}
          onClick={() => emit('click-tertiary')}
        />
      );
    };

    const renderPrimary = () => {
      if (slots['primary-button']) {
        return slots['primary-button']();
      }
      return (
        <VanButton
          size="large"
          width="112px"
          type={props.primaryButtonType}
          text={props.primaryButtonText}
          disabled={props.primaryDisabled}
          loading={props.primaryLoading}
          class={bem('button', 'primary')}
          onClick={() => emit('click-primary')}
        />
      );
    };

    const renderBar = () => (
      <div
        ref={root}
        class={[bem(), { 'van-safe-area-bottom': props.safeAreaInsetBottom }]}
      >
        {slots.top ? <div class={bem('tip')}>{slots.top()}</div> : null}
        <div class={bem('bar')}>
          <div class={bem('start')}>
            <div class={bem('left')}>{renderLeft()}</div>
            {renderIconStrip()}
          </div>
          <div class={bem('actions')}>
            {renderSecondary()}
            {renderTertiary()}
            {renderPrimary()}
          </div>
        </div>
      </div>
    );

    return () => {
      if (props.placeholder) {
        return renderPlaceholder(renderBar);
      }
      return renderBar();
    };
  },
});
