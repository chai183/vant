import {
  ref,
  watch,
  reactive,
  nextTick,
  defineComponent,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  numericProp,
  getScrollTop,
  preventDefault,
  createNamespace,
  makeStringProp,
  makeNumericProp,
} from '../utils';

// Composables
import { useEventListener, useScrollParent } from '@vant/use';
import { useTouch } from '../composables/use-touch';

// Components
import { Icon } from '../icon';
import { showToast } from '../toast';

const [name, bem, t] = createNamespace('pull-refresh');

// 默认拖拽高度，默认触发刷新距离也会跟随该值。
const DEFAULT_HEAD_HEIGHT = 88;
const DEFAULT_LOADING_ICON = 'replay';
const DEFAULT_LOOSING_ICON = 'down';

type PullRefreshTextStatus = 'pulling' | 'loosing' | 'loading';

export type PullRefreshErrorHandler = (error?: unknown) => void;

export type PullRefreshRefreshParams = {
  error: PullRefreshErrorHandler;
};

type PullRefreshStatus =
  | 'normal'
  | 'loading'
  | 'loosing'
  | 'pulling'
  | 'success';

export const pullRefreshProps = {
  disabled: Boolean,
  modelValue: Boolean,
  headHeight: makeNumericProp(DEFAULT_HEAD_HEIGHT),
  successText: String,
  errorText: makeStringProp('网络不可用，请检查网络设置'),
  pullingText: makeStringProp('下拉刷新'),
  loosingText: makeStringProp('松开刷新'),
  loadingText: makeStringProp('刷新中'),
  pullingIcon: makeStringProp('down'),
  loosingIcon: makeStringProp(DEFAULT_LOOSING_ICON),
  loadingIcon: makeStringProp(DEFAULT_LOADING_ICON),
  successIcon: makeStringProp('passed'),
  pullDistance: numericProp,
  successDuration: makeNumericProp(500),
  animationDuration: makeNumericProp(300),
};

export type PullRefreshProps = ExtractPropTypes<typeof pullRefreshProps>;

export default defineComponent({
  name,

  props: pullRefreshProps,

  emits: ['change', 'error', 'refresh', 'update:modelValue'],

  setup(props, { emit, slots }) {
    let reachTop: boolean;
    let refreshFailed = false;

    // 节点与内部状态
    const root = ref<HTMLElement>();
    const track = ref<HTMLElement>();
    const scrollParent = useScrollParent(root);

    const state = reactive({
      status: 'normal' as PullRefreshStatus,
      distance: 0,
      duration: 0,
    });

    const touch = useTouch();

    // 头部高度等于默认值时走 CSS 变量，只有自定义高度才写入内联样式。
    const getHeadStyle = () => {
      if (props.headHeight !== DEFAULT_HEAD_HEIGHT) {
        return {
          height: `${props.headHeight}px`,
        };
      }
    };

    const isTouchable = () =>
      state.status !== 'loading' &&
      state.status !== 'success' &&
      !props.disabled;

    const getPullDistance = () => +(props.pullDistance || props.headHeight);

    // 下拉超过触发距离后进入阻尼区，避免拖拽距离无限制增长。
    const ease = (distance: number) => {
      const pullDistance = getPullDistance();

      if (distance > pullDistance) {
        if (distance < pullDistance * 2) {
          distance = pullDistance + (distance - pullDistance) / 2;
        } else {
          distance = pullDistance * 1.5 + (distance - pullDistance * 2) / 4;
        }
      }

      return Math.round(distance);
    };

    // 根据当前拖拽距离统一维护状态，外部可通过 change 事件拿到状态和距离。
    const setStatus = (distance: number, isLoading?: boolean) => {
      const pullDistance = getPullDistance();
      state.distance = distance;

      if (isLoading) {
        state.status = 'loading';
      } else if (distance === 0) {
        state.status = 'normal';
      } else if (distance < pullDistance) {
        state.status = 'pulling';
      } else {
        state.status = 'loosing';
      }

      emit('change', {
        status: state.status,
        distance,
      });
    };

    const getStatusText = () => {
      const { status } = state;
      if (status === 'normal') {
        return '';
      }
      const textKey =
        `${status}Text` as `${Exclude<PullRefreshStatus, 'normal'>}Text`;
      return props[textKey] || t(status);
    };

    // pulling 阶段图标随下拉距离从 0 缩放到 100%，自定义插槽也可以复用 distance 做同样效果。
    const getIconScale = () =>
      Math.min(state.distance / getPullDistance(), 1).toFixed(2);

    // 默认提示内容：图标 + 文案。图片链接会由 Icon 组件自动渲染成 img。
    const renderTextStatus = (status: PullRefreshTextStatus) => {
      const iconKey = `${status}Icon` as `${PullRefreshTextStatus}Icon`;
      const isDefaultLoosingIcon =
        status === 'loosing' && props.loosingIcon === DEFAULT_LOOSING_ICON;
      const isDefaultLoadingIcon =
        status === 'loading' && props.loadingIcon === DEFAULT_LOADING_ICON;

      return (
        <div class={bem('status')}>
          <Icon
            name={props[iconKey]}
            class={bem('status-icon', {
              [status]: true,
              reverse: isDefaultLoosingIcon,
              spin: isDefaultLoadingIcon,
            })}
            style={
              status === 'pulling'
                ? { transform: `scale(${getIconScale()})` }
                : undefined
            }
          />
          <span class={bem('text')}>{getStatusText()}</span>
        </div>
      );
    };

    // 成功提示固定使用胶囊样式，success-icon 支持内置图标或图片链接。
    const renderSuccessStatus = () => (
      <div class={bem('success')}>
        <Icon name={props.successIcon} size={16} class={bem('success-icon')} />
        <span class={bem('success-text')}>{getStatusText()}</span>
      </div>
    );

    const renderStatus = () => {
      const { status, distance } = state;

      // 插槽优先级最高，便于用户完全自定义图标、GIF、缩放动画等内容。
      if (slots[status]) {
        return slots[status]!({ distance });
      }

      if (
        status === 'pulling' ||
        status === 'loosing' ||
        status === 'loading'
      ) {
        return renderTextStatus(status);
      }

      if (status === 'success') {
        return renderSuccessStatus();
      }

      return null;
    };

    // 成功提示会先停留在头部区域，等待 success-duration 后再回到顶部。
    const showSuccessTip = () => {
      if (!state.distance) {
        state.distance = +props.headHeight;
      }
      state.status = 'success';

      setTimeout(() => {
        setStatus(0);
      }, +props.successDuration);
    };

    // refresh 回调中调用该方法时，组件会默认 Toast 提示，并通过 error 事件把错误对象抛给业务层。
    const onRefreshError: PullRefreshErrorHandler = (error) => {
      refreshFailed = true;
      showToast(props.errorText);
      emit('error', error);
      emit('update:modelValue', false);
    };

    // 只有滚动父元素在顶部时才允许触发下拉刷新。
    const checkPosition = (event: TouchEvent) => {
      reachTop = getScrollTop(scrollParent.value!) === 0;

      if (reachTop) {
        state.duration = 0;
        touch.start(event);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isTouchable()) {
        checkPosition(event);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (isTouchable()) {
        // 首次 touchstart 不在顶部时，移动过程中仍需要重新检查是否已经到顶。
        if (!reachTop) {
          checkPosition(event);
        }

        const { deltaY } = touch;
        touch.move(event);

        if (reachTop && deltaY.value >= 0 && touch.isVertical()) {
          preventDefault(event);
          setStatus(ease(deltaY.value));
        }
      }
    };

    const onTouchEnd = () => {
      if (reachTop && touch.deltaY.value && isTouchable()) {
        state.duration = +props.animationDuration;

        if (state.status === 'loosing') {
          // 达到触发距离后进入 loading，并通知外部开始刷新。
          refreshFailed = false;
          setStatus(+props.headHeight, true);
          emit('update:modelValue', true);

          // ensure value change can be watched
          nextTick(() => emit('refresh', { error: onRefreshError }));
        } else {
          setStatus(0);
        }
      }
    };

    // 外部通过 v-model 控制刷新状态；刷新结束后根据配置展示成功提示或回到初始位置。
    watch(
      () => props.modelValue,
      (value) => {
        state.duration = +props.animationDuration;

        if (value) {
          refreshFailed = false;
          setStatus(+props.headHeight, true);
        } else if (refreshFailed) {
          refreshFailed = false;
          setStatus(0, false);
        } else if (slots.success || props.successText) {
          showSuccessTip();
        } else {
          setStatus(0, false);
        }
      },
    );

    // useEventListener will set passive to `false` to eliminate the warning of Chrome
    useEventListener('touchmove', onTouchMove, {
      target: track,
    });

    return () => {
      const trackStyle = {
        transitionDuration: `${state.duration}ms`,
        transform: state.distance
          ? `translate3d(0,${state.distance}px, 0)`
          : '',
      };

      return (
        <div ref={root} class={bem()}>
          <div
            ref={track}
            class={bem('track')}
            style={trackStyle}
            onTouchstartPassive={onTouchStart}
            onTouchend={onTouchEnd}
            onTouchcancel={onTouchEnd}
          >
            <div class={bem('head')} style={getHeadStyle()}>
              {renderStatus()}
            </div>
            {slots.default?.()}
          </div>
        </div>
      );
    };
  },
});
