import {
  ref,
  watch,
  reactive,
  onUnmounted,
  defineComponent,
  type ExtractPropTypes,
} from 'vue';
import { getNotifyAutoCloseDuration } from './duration';
import {
  pick,
  extend,
  numericProp,
  unknownProp,
  makeStringProp,
  makeNumericProp,
  makeNumberProp,
  createNamespace,
} from '../utils';
import { doubleRaf, useEventListener, onMountedOrActivated } from '@vant/use';
import { Popup } from '../popup';
import { Icon } from '../icon';
import VanButton from '../button';
import { popupSharedProps } from '../popup/shared';
import type { NotifyType, NotifyPosition } from './types';

const [name, bem] = createNamespace('notify');

export const NOTIFY_BUTTON_TEXT_MAX_LENGTH = 4;

// 截断实心按钮文案，最多展示 4 个字
const formatButtonText = (text: string) =>
  text.slice(0, NOTIFY_BUTTON_TEXT_MAX_LENGTH);

const TYPE_ICON_MAP: Record<NotifyType, string> = {
  primary: 'info-o',
  success: 'passed',
  danger: 'cross',
  warning: 'info-o',
};

const popupInheritProps = [
  'lockScroll',
  'position',
  'show',
  'teleport',
  'zIndex',
] as const;

export const notifyProps = extend({}, popupSharedProps, {
  type: makeStringProp<NotifyType>('warning'),
  color: String,
  message: numericProp,
  position: makeStringProp<NotifyPosition>('top'),
  className: unknownProp,
  background: String,
  lockScroll: Boolean,
  leftIcon: String,
  actionText: String,
  buttonText: String,
  closeable: Boolean,
  wrapable: Boolean,
  scrollable: Boolean,
  plain: Boolean,
  speed: makeNumericProp(60),
  scrollDelay: makeNumberProp(1500),
  duration: makeNumberProp(3000),
  persistent: Boolean,
});

export type NotifyProps = ExtractPropTypes<typeof notifyProps>;

export default defineComponent({
  name,

  props: notifyProps,

  emits: ['update:show', 'clickAction', 'clickButton', 'close'],

  // 组件 setup 入口
  setup(props, { emit, slots }) {
    // 更新通知显示状态
    const updateShow = (show: boolean) => emit('update:show', show);

    const wrapRef = ref<HTMLElement>();
    const contentRef = ref<HTMLElement>();

    let wrapHeight = 0;
    let lineHeight = 0;
    let contentHeight = 0;
    let totalSteps = 0;
    let currentStep = 0;
    let startTimer: ReturnType<typeof setTimeout>;
    let pauseTimer: ReturnType<typeof setTimeout>;
    let autoCloseTimer: ReturnType<typeof setTimeout>;

    const scrollState = reactive({
      offset: 0,
      duration: 0,
    });

    // 清除滚动相关定时器
    const clearScrollTimers = () => {
      clearTimeout(startTimer);
      clearTimeout(pauseTimer);
    };

    // 清除自动关闭定时器
    const clearAutoCloseTimer = () => {
      clearTimeout(autoCloseTimer);
    };

    // 启动自动关闭定时器
    const startAutoCloseTimer = () => {
      clearAutoCloseTimer();
      const autoCloseDuration = getNotifyAutoCloseDuration({
        persistent: props.persistent,
        duration: props.duration,
      });
      if (props.show && autoCloseDuration > 0) {
        autoCloseTimer = setTimeout(() => {
          updateShow(false);
          emit('close');
        }, autoCloseDuration);
      }
    };

    // 滚动到指定行
    const scrollToStep = (step: number, animate: boolean) => {
      scrollState.offset = -lineHeight * step;
      scrollState.duration = animate ? lineHeight / +props.speed : 0;
    };

    // 每行停留后调度下一次滚动
    const schedulePause = () => {
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => {
        if (currentStep >= totalSteps) {
          currentStep = 0;
          scrollToStep(0, false);
          schedulePause();
          return;
        }
        currentStep += 1;
        scrollToStep(currentStep, true);
      }, props.scrollDelay);
    };

    // 开始按行逐步滚动
    const startStepScroll = () => {
      currentStep = 0;
      totalSteps = Math.ceil((contentHeight - wrapHeight) / lineHeight);
      if (totalSteps <= 0) {
        return;
      }
      scrollToStep(0, false);
      schedulePause();
    };

    // 获取左侧图标名称
    const getIconName = () => {
      if (props.leftIcon) {
        return props.leftIcon;
      }
      if (props.plain || props.scrollable) {
        return;
      }
      if (props.actionText || props.buttonText) {
        return 'volume-o';
      }
      return TYPE_ICON_MAP[props.type];
    };

    // 判断是否展示左侧图标
    const showLeftIcon = () => !!getIconName() || !!slots['left-icon'];

    // 渲染左侧图标
    const renderLeftIcon = () => {
      if (slots['left-icon']) {
        return <div class={bem('left-icon')}>{slots['left-icon']()}</div>;
      }
      const name = getIconName();
      if (name) {
        return <Icon class={bem('left-icon')} name={name} />;
      }
    };

    // 点击关闭按钮
    const onCloseClick = (event: MouseEvent) => {
      event.stopPropagation();
      updateShow(false);
      emit('close');
    };

    // 点击右侧文字按钮
    const onActionClick = (event: MouseEvent) => {
      event.stopPropagation();
      emit('clickAction', event);
    };

    // 点击右侧实心按钮
    const onButtonClick = (event: MouseEvent) => {
      event.stopPropagation();
      emit('clickButton', event);
    };

    // 渲染右侧操作区（文字按钮 / 实心按钮 / 关闭）
    const renderRight = () => {
      if (slots.action) {
        return <div class={bem('action')}>{slots.action()}</div>;
      }
      if (props.actionText) {
        return (
          <button type="button" class={bem('action')} onClick={onActionClick}>
            {props.actionText}
          </button>
        );
      }
      if (slots.button) {
        return <div class={bem('button')}>{slots.button()}</div>;
      }
      if (props.buttonText) {
        return (
          <VanButton
            class={bem('button')}
            type={props.type === 'primary' ? 'primary' : props.type}
            size="small"
            round
            onClick={onButtonClick}
          >
            {formatButtonText(props.buttonText)}
          </VanButton>
        );
      }
      if (props.closeable) {
        return (
          <Icon class={bem('close')} name="cross" onClick={onCloseClick} />
        );
      }
    };

    // 滚动动画结束后继续调度下一行
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform' || scrollState.duration === 0) {
        return;
      }
      schedulePause();
    };

    // 渲染通知文案
    const renderMessage = () => {
      if (slots.default) {
        return slots.default();
      }
      return props.message;
    };

    // 渲染可滚动文案区域
    const renderScrollContent = () => {
      const style = {
        transform: scrollState.offset
          ? `translateY(${scrollState.offset}px)`
          : '',
        transitionDuration: `${scrollState.duration}s`,
      };

      return (
        <div ref={wrapRef} class={bem('wrap')}>
          <div
            ref={contentRef}
            style={style}
            class={bem('content')}
            onTransitionend={onTransitionEnd}
          >
            {renderMessage()}
          </div>
        </div>
      );
    };

    // 渲染通知主体（图标 + 文案）
    const renderBody = () => (
      <div class={bem('body')}>
        {showLeftIcon() ? renderLeftIcon() : null}
        {props.scrollable ? (
          renderScrollContent()
        ) : (
          <div class={[bem('message'), 'van-multi-ellipsis--l2']}>
            {renderMessage()}
          </div>
        )}
      </div>
    );

    // 重置滚动状态并计算是否需要滚动
    const resetScroll = () => {
      if (!props.scrollable) {
        return;
      }

      clearScrollTimers();
      wrapHeight = 0;
      lineHeight = 0;
      contentHeight = 0;
      totalSteps = 0;
      currentStep = 0;
      scrollState.offset = 0;
      scrollState.duration = 0;

      startTimer = setTimeout(() => {
        if (!wrapRef.value || !contentRef.value) {
          return;
        }

        doubleRaf(() => {
          const wrap = wrapRef.value!;
          const content = contentRef.value!;
          wrapHeight = wrap.clientHeight;
          const { lineHeight: lineHeightValue } = getComputedStyle(content);
          lineHeight = parseFloat(lineHeightValue) || wrapHeight;
          contentHeight = content.scrollHeight;

          if (contentHeight > wrapHeight && lineHeight > 0) {
            startStepScroll();
          }
        });
      }, 200);
    };

    // 挂载或激活时初始化滚动与自动关闭
    onMountedOrActivated(() => {
      resetScroll();
      startAutoCloseTimer();
    });
    // 卸载时清理定时器
    onUnmounted(() => {
      clearScrollTimers();
      clearAutoCloseTimer();
    });
    // 页面重新显示时重置滚动
    useEventListener('pageshow', resetScroll);

    // 监听显示状态与文案变化，重新计算滚动
    watch(
      () => [props.show, props.message, props.scrollable],
      () => {
        if (props.show) {
          resetScroll();
        }
      },
    );

    // 监听常驻与时长配置，重新启动自动关闭
    watch(
      () => [props.show, props.persistent, props.duration],
      () => {
        startAutoCloseTimer();
      },
    );

    // 渲染 Popup 容器
    return () => (
      <Popup
        class={[
          bem([
            props.type,
            {
              wrapable: props.wrapable,
              scrollable: props.scrollable,
              plain: props.plain,
            },
          ]),
          props.className,
        ]}
        style={{
          color: props.color,
          background: props.background,
        }}
        overlay={false}
        duration={0.2}
        onUpdate:show={updateShow}
        {...pick(props, popupInheritProps)}
      >
        {renderBody()}
        {renderRight()}
      </Popup>
    );
  },
});
