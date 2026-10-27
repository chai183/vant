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

/* ----------默认配置----------- */
const DEFAULT_HEAD_HEIGHT = 88; //拖拽高度
const DEFAULT_LOADING_ICON = 'replay'; //加载图标
const DEFAULT_LOOSING_ICON = 'down'; //下拉和松开图标
// 下拉的三种状态文本
type PullRefreshTextStatus = 'pulling' | 'loosing' | 'loading';
// 报错事件的类型
export type PullRefreshErrorHandler = (error?: unknown) => void;

export type PullRefreshRefreshParams = {
  error: PullRefreshErrorHandler;
};

// 五种状态
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
  errorText: makeStringProp('请求错误'),
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
    // 是否在顶部
    let reachTop: boolean;
    let refreshFailed = false; //是否刷新失败

    // 根节点
    const root = ref<HTMLElement>();
    // 滑动区域节点
    const track = ref<HTMLElement>();
    // 寻找滚动容器
    const scrollParent = useScrollParent(root);

    const state = reactive({
      status: 'normal' as PullRefreshStatus,
      distance: 0,
      duration: 0,
    });

    const touch = useTouch();

    // 获取头部高度
    // 头部高度等于默认值时走 CSS 变量，只有自定义高度才写入内联样式。
    const getHeadStyle = () => {
      if (props.headHeight !== DEFAULT_HEAD_HEIGHT) {
        return {
          height: `${props.headHeight}px`,
        };
      }
    };
    // 获取设置的下拉距离
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
    // 获取对应的状态文本
    const getStatusText = () => {
      const { status } = state;
      const map = {
        loading: props.loadingText,
        loosing: props.loosingText,
        pulling: props.pullingText,
        success: props.successText,
      };
      return status === 'normal' ? '' : map[status] || t(status);
    };

    // pulling 阶段图标随下拉距离从 0 缩放到 100%，自定义插槽也可以复用 distance 做同样效果。
    const getIconScale = () =>
      Math.min(state.distance / getPullDistance(), 1).toFixed(2);

    /* -----渲染顶部状态文本start----- */
    // 普通形式：图标 + 文案
    const renderTextStatus = (status: PullRefreshTextStatus) => {
      const iconKey = `${status}Icon` as `${PullRefreshTextStatus}Icon`;
      // 默认的Icon
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

    // 成功提示:特殊样式处理-胶囊形式
    const renderSuccessStatus = () => (
      <div class={bem('success')}>
        <Icon name={props.successIcon} size={16} class={bem('success-icon')} />
        <span class={bem('success-text')}>{getStatusText()}</span>
      </div>
    );
    // 针对状态进行渲染
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

    /* -----渲染顶部状态文本end----- */

    // 刷新报错事件处理
    const onRefreshError: PullRefreshErrorHandler = (error) => {
      refreshFailed = true;
      showToast(props.errorText);
      emit('error', error);
      emit('update:modelValue', false);
    };

    /*------ 拖动逻辑start------ */
    // 是否拖动支持
    const isTouchable = () =>
      state.status !== 'loading' &&
      state.status !== 'success' &&
      !props.disabled;

    // 检测滚动容器-是否在顶部
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
        if (!reachTop) {
          checkPosition(event);
        }

        const { deltaY } = touch;
        touch.move(event);

        // 根据移动距离-设置对应的状态
        if (reachTop && deltaY.value >= 0 && touch.isVertical()) {
          preventDefault(event);
          setStatus(ease(deltaY.value));
        }
      }
    };

    const onTouchEnd = () => {
      if (reachTop && touch.deltaY.value && isTouchable()) {
        state.duration = +props.animationDuration;

        // 达到触发距离后进入loosing(松手刷新)状态,进行回调操作
        if (state.status === 'loosing') {
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

    // 成功提示会先停留在头部区域，等待 success-duration 后再回到顶部。
    const showSuccessTip = () => {
      if (!state.distance) {
        state.distance = +props.headHeight;
      }
      state.status = 'success';
      // 固定时间后,回退高度
      setTimeout(() => {
        setStatus(0);
      }, +props.successDuration);
    };

    // 外部通过 v-model 控制刷新状态；刷新结束后根据配置展示成功提示或回到初始位置。
    watch(
      () => props.modelValue,
      (value) => {
        state.duration = +props.animationDuration;

        if (value) {
          // 监听 true时,保持固定设置的高度,进行加载状态
          refreshFailed = false;
          setStatus(+props.headHeight, true);
        } else if (refreshFailed) {
          refreshFailed = false;
          setStatus(0, false);
        } else if (slots.success || props.successText) {
          // 当refresh执行完毕,设置false,配置了 successText ,会进入保持高度的同时,进行对应提示
          showSuccessTip();
        } else {
          setStatus(0, false);
        }
      },
    );

    useEventListener('touchmove', onTouchMove, {
      target: track,
    });

    return () => {
      // 滑块的样式
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
