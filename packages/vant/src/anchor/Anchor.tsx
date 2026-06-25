import {
  ref,
  watch,
  computed,
  Teleport,
  nextTick,
  onMounted,
  onBeforeUnmount,
  defineComponent,
  type PropType,
  type TeleportProps,
  type ExtractPropTypes,
  onDeactivated,
  onActivated,
} from 'vue';

import {
  extend,
  addUnit,
  inBrowser,
  numericProp,
  getScrollTop,
  setScrollTop,
  getZIndexStyle,
  createNamespace,
  makeNumericProp,
  makeStringProp,
} from '../utils';
import { throttle } from '../lazyload/vue-lazyload/util';
import { useEventListener, getScrollParent } from '@vant/use';
import { Icon } from '../icon';
import { Popup } from '../popup';
import { Cell } from '../cell';
import type { AnchorType, AnchorMode, AnchorItem } from './types';

const [name, bem] = createNamespace('anchor');

export const anchorProps = {
  type: makeStringProp<AnchorType>('back-top'), // back-top | catalog | terms
  mode: makeStringProp<AnchorMode>('fixed'), // fixed 常显展开态；auto 先胶囊后延时展开
  text: String, // 自定义文案，覆盖各 type 默认
  items: Array as PropType<AnchorItem[]>, // catalog：弹层目录项 { id, title }
  termsTarget: String, // terms：点击后 scrollIntoView 的目标选择器
  screenOffset: makeNumericProp(2), // back-top 出现阈值 = 屏高 * screenOffset（无 offset 时）
  offset: numericProp, // 出现阈值（px），优先于 screenOffset
  resetOffset: makeNumericProp(0), // back-top 滚回此值以下才隐藏（滞回，避免边界抖动）
  expandDelay: makeNumericProp(0), // auto 模式下胶囊→圆球延时，0 用 type 默认
  right: numericProp,
  bottom: numericProp,
  zIndex: numericProp,
  target: [String, Object] as PropType<TeleportProps['to']>, // 滚动容器，默认取最近可滚父级
  immediate: Boolean, // 滚动是否无动画
  teleport: {
    type: [String, Object] as PropType<TeleportProps['to']>,
    default: 'body', // 浮层挂到 body，根节点留 placeholder 占位
  },
};

export type AnchorProps = ExtractPropTypes<typeof anchorProps>;

export default defineComponent({
  name,

  inheritAttrs: false,

  props: anchorProps,

  emits: ['click', 'select', 'open', 'close', 'update:show'],

  setup(props, { emit, slots, attrs }) {
    let shouldReshow = false; // keep-alive 切回时恢复显隐
    let expandTimer: ReturnType<typeof setTimeout> | null = null; // auto 模式延时展开
    let scrollingToTop = false; // 点击回到顶部后，滚动过程中保持圆球展开
    let lastScrollTop = 0; // 判断上滑 / 下滑
    let expandedAtScrollTop: number | null = null; // auto 圆球展开时的 scrollTop 基准

    const visible = ref(props.type === 'terms'); // 是否显示控件（terms 恒 true）
    const expanded = ref(props.type === 'terms'); // 是否圆球/条款展开态（false 为左侧胶囊）
    const popupShow = ref(false); // catalog 底部目录弹层
    const activeIndex = ref(0); // catalog 当前阅读章节索引
    const termsArrowUp = ref(false); // terms 箭头朝上/朝下（目标在视口上/下）
    const showOffset = ref(0); // 出现阈值缓存（px）
    const backTopEngaged = ref(false); // back-top 滞回：出现过则直到滚回 resetOffset 才隐藏
    const root = ref<HTMLElement>();
    const scrollParent = ref<Window | Element>();

    // 浮层定位：right / bottom / z-index
    const style = computed(() =>
      extend(getZIndexStyle(props.zIndex), {
        right: addUnit(props.right),
        bottom: addUnit(props.bottom),
      }),
    );

    // 条款展开条主文案
    const displayText = computed(() => {
      if (props.text) {
        return props.text;
      }
      if (props.type === 'terms') {
        return '查看《条款》';
      }
      if (props.type === 'catalog') {
        return '目录';
      }
      return '回到顶部';
    });

    // 圆球内短文案（catalog 为「目录」）
    const ballLabel = computed(() => {
      if (props.text) {
        return props.text;
      }
      if (props.type === 'catalog') {
        return '目录';
      }
      return '';
    });
    // 展不展示文字
    const showBallText = computed(
      () =>
        props.type === 'catalog' || !!(props.text || slots['ball-text']?.()),
    );

    // 停留多久变为展开圆球 expandDelay 后由收起展开为圆球   不传默认0为 设计稿上的默认值 目录 3秒 回到顶部 2秒
    const resolvedExpandDelay = computed(() => {
      const expandDelay = Number(props.expandDelay);
      if (expandDelay > 0) {
        return expandDelay;
      }
      return props.type === 'catalog' ? 3000 : 2000;
    });

    const isAutoMode = () =>
      props.mode === 'auto' &&
      (props.type === 'back-top' || props.type === 'catalog');

    const clearExpandTimer = () => {
      if (expandTimer) {
        clearTimeout(expandTimer);
        expandTimer = null;
      }
    };

    const markExpanded = (scrollTop: number) => {
      expanded.value = true;
      expandedAtScrollTop = scrollTop;
      clearExpandTimer();
    };

    const collapseExpanded = () => {
      expanded.value = false;
      expandedAtScrollTop = null;
      clearExpandTimer();
    };

    // 下滑且已 visible 时启动计时，到时 expanded=true 播放展开动画
    const scheduleExpand = () => {
      clearExpandTimer();
      if (!isAutoMode() || expanded.value || !visible.value) {
        return;
      }
      expandTimer = setTimeout(() => {
        if (scrollParent.value) {
          markExpanded(getScrollTop(scrollParent.value));
        }
      }, resolvedExpandDelay.value);
    };
    // 获取屏幕高度
    const getViewportHeight = () => {
      if (!scrollParent.value || scrollParent.value === window) {
        return window.innerHeight;
      }
      return (scrollParent.value as Element).clientHeight;
    };

    // auto 圆球态：自展开位起再滚过 1 屏则收回复胶囊
    const tryCollapseOnScroll = (scrollTop: number) => {
      if (
        !isAutoMode() ||
        !expanded.value ||
        scrollingToTop ||
        popupShow.value
      ) {
        return;
      }
      if (expandedAtScrollTop == null) {
        expandedAtScrollTop = scrollTop;
        return;
      }
      if (scrollTop - expandedAtScrollTop >= getViewportHeight()) {
        collapseExpanded();
      }
    };

    // 控件何时该「出现」的 scrollTop 下限
    const getOffsetThreshold = () => {
      if (props.offset != null && props.offset !== '') {
        return Number(props.offset);
      }
      // catalog：任意下滑即出现（scrollTop >= 1）
      if (props.type === 'catalog') {
        return 1;
      }
      // back-top：默认滚过 2 屏高（screenOffset=2）
      return getViewportHeight() * Number(props.screenOffset);
    };

    const refreshShowOffset = () => {
      showOffset.value = getOffsetThreshold();
    };

    const getResetOffset = () => Number(props.resetOffset);

    // back-top 滞回：滚过 showOffset 置 true，只有滚回 resetOffset 以下才 false
    const updateBackTopEngaged = (scrollTop: number) => {
      if (scrollTop >= showOffset.value) {
        backTopEngaged.value = true;
      } else if (scrollTop <= getResetOffset()) {
        backTopEngaged.value = false;
      }
    };

    // 解析页面内锚点 DOM（id 或 #id 或选择器）
    const getTargetElement = (selector?: string) => {
      if (!selector) {
        return null;
      }
      if (selector.startsWith('#')) {
        return document.querySelector(selector);
      }
      return (
        document.getElementById(selector) || document.querySelector(selector)
      );
    };

    // props.target 指定的滚动容器
    const getScrollTarget = () => {
      const { target } = props;

      if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) {
          return el;
        }
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            `[Vant] Anchor: target element "${target}" was not found.`,
          );
        }
        return null;
      }

      return (target as Element) || null;
    };

    const scrollToTop = () => {
      if (!scrollParent.value) {
        return;
      }

      scrollingToTop = true; // 滚动回顶期间保持圆球，避免 auto 模式中途收起
      expanded.value = true;
      clearExpandTimer();

      if ('scrollTo' in scrollParent.value) {
        scrollParent.value.scrollTo({
          top: 0,
          behavior: props.immediate ? 'auto' : 'smooth',
        });
        return;
      }

      setScrollTop(scrollParent.value, 0);
    };

    const scrollToElement = (id: string) => {
      const el = getTargetElement(id.startsWith('#') ? id : `#${id}`);
      if (!el) {
        return;
      }
      el.scrollIntoView({
        behavior: props.immediate ? 'auto' : 'smooth',
        block: 'start',
      });
    };

    // terms：目标在视口上半 → 箭头向上（点一下滚到条款）
    const updateTermsDirection = () => {
      const el = getTargetElement(props.termsTarget);
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      termsArrowUp.value = rect.top < window.innerHeight / 2;
    };

    // catalog：标题块 top 进入视口上 35% 区域则记为当前章
    const updateActiveIndex = () => {
      const { items } = props;
      if (!items?.length) {
        return;
      }

      let current = 0;
      items.forEach((item, index) => {
        const el = getTargetElement(item.id);
        if (!el) {
          return;
        }
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.35) {
          current = index;
        }
      });
      activeIndex.value = current;
    };

    // 滚动主入口：更新 visible / expanded / 目录高亮 / 条款箭头
    const scroll = () => {
      if (!scrollParent.value) {
        return;
      }

      const scrollTop = getScrollTop(scrollParent.value);
      const scrollingUp = scrollTop < lastScrollTop;
      lastScrollTop = scrollTop;

      // 复数条款：始终展示，只更新箭头方向
      if (props.type === 'terms') {
        visible.value = true;
        expanded.value = true;
        updateTermsDirection();
        return;
      }

      // ---------- back-top ----------
      // 超过 showOffset 出现；滚回 resetOffset 以下才消失（backTopEngaged 滞回）
      if (props.type === 'back-top') {
        updateBackTopEngaged(scrollTop);
        const show = backTopEngaged.value;
        visible.value = show;

        if (props.mode === 'fixed') {
          expanded.value = show; // fixed 无胶囊态，显隐即展开态
          return;
        }

        // auto：未达阈值则隐藏并清计时
        if (!show) {
          collapseExpanded();
          scrollingToTop = false;
          return;
        }

        if (scrollingToTop) {
          expanded.value = true;
          clearExpandTimer();
          return;
        }

        tryCollapseOnScroll(scrollTop);

        // auto：下滑且仍胶囊 → 延时展开
        if (!scrollingUp && !expanded.value) {
          scheduleExpand();
        }
        return;
      }

      // ---------- catalog ----------
      // 出现阈值通常为 scrollTop >= 1；auto/fixed 交互同 back-top
      const passedThreshold = scrollTop >= showOffset.value;
      visible.value = passedThreshold;

      if (props.mode === 'fixed') {
        expanded.value = passedThreshold;
        if (passedThreshold) {
          updateActiveIndex();
        }
        return;
      }

      if (!passedThreshold) {
        collapseExpanded();
        return;
      }

      // auto：上滑立即展开圆球（方便点目录）；下滑且胶囊则 scheduleExpand
      if (scrollingUp) {
        if (!expanded.value) {
          markExpanded(scrollTop);
        } else {
          clearExpandTimer();
        }
      } else if (!expanded.value) {
        scheduleExpand();
      }

      tryCollapseOnScroll(scrollTop);
      updateActiveIndex();
    };

    const openCatalogPopup = () => {
      if (!props.items?.length) {
        return;
      }
      popupShow.value = true;
      emit('open');
      emit('update:show', true);
    };

    // 点击左侧胶囊：立即展开为圆球，不触发业务 click
    const onCollapsedClick = (event: MouseEvent) => {
      event.stopPropagation();
      if (scrollParent.value) {
        markExpanded(getScrollTop(scrollParent.value));
      }
    };

    // 点击圆球 / 条款条：catalog 开弹层，terms 滚到条款，back-top 回顶
    const onExpandedClick = (event: MouseEvent) => {
      emit('click', event);

      if (props.type === 'catalog') {
        openCatalogPopup();
        return;
      }

      if (props.type === 'terms') {
        if (props.termsTarget) {
          scrollToElement(props.termsTarget);
        }
        return;
      }

      scrollToTop();
    };

    // 目录弹层选中某一章
    const onSelectItem = (item: AnchorItem, index: number) => {
      scrollToElement(item.id);
      activeIndex.value = index;
      popupShow.value = false;
      emit('select', item, index);
      emit('close');
      emit('update:show', false);
    };

    const onPopupClose = () => {
      popupShow.value = false;
      emit('close');
      emit('update:show', false);
    };

    // 解析滚动容器并首帧同步显隐
    const updateTarget = () => {
      if (inBrowser) {
        nextTick(() => {
          scrollParent.value = props.target
            ? getScrollTarget() || undefined
            : getScrollParent(root.value!);
          refreshShowOffset();
          scroll();
        });
      }
    };

    useEventListener('scroll', throttle(scroll, 100), { target: scrollParent });

    onMounted(updateTarget);

    onBeforeUnmount(clearExpandTimer);

    onActivated(() => {
      if (shouldReshow) {
        visible.value = props.type === 'terms' ? true : visible.value;
        shouldReshow = false;
      }
    });

    // teleport 到 body 时，路由切走先隐藏，避免浮层残留在其他页
    onDeactivated(() => {
      if (visible.value && props.teleport) {
        if (props.type !== 'terms') {
          visible.value = false;
        }
        shouldReshow = true;
      }
      clearExpandTimer();
    });

    watch(
      () => props.type,
      () => {
        refreshShowOffset();
        scroll();
      },
    );

    watch(() => props.target, updateTarget);
    // 阈值变化时重算显隐
    watch(
      () => [props.offset, props.screenOffset, props.resetOffset],
      () => {
        refreshShowOffset();
        scroll();
      },
    );
    watch(
      () => props.items,
      () => updateActiveIndex(),
      { deep: true },
    );

    // type=terms：底部固定条 + 箭头 + 文案
    const renderTerms = () => (
      <div class={bem('expanded', { terms: true })} onClick={onExpandedClick}>
        <Icon
          name="back-top"
          class={bem('icon', { terms: true, down: !termsArrowUp.value })}
        />
        <span class={bem('text')}>
          {slots.default?.() ?? displayText.value}
        </span>
      </div>
    );

    // back-top / catalog：胶囊 ↔ 圆球 morph（CSS 过渡，见 index.less）
    const renderControl = () => {
      const ballIcon = props.type === 'catalog' ? 'wap-nav' : 'back-top';
      const isBall = expanded.value;

      return (
        <div class={bem('control')}>
          <div
            class={bem('morph')}
            onClick={(event: MouseEvent) =>
              isBall ? onExpandedClick(event) : onCollapsedClick(event)
            }
          >
            <Icon
              name="arrow-down"
              class={bem('morph-icon', { collapsed: true })}
            />
            <div class={bem('morph-ball')}>
              <Icon name={ballIcon} class={bem('morph-icon', { ball: true })} />
              {showBallText.value && (
                <span class={bem('morph-text')}>
                  {slots['ball-text']?.() ?? ballLabel.value}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };

    // catalog 点击圆球后：底部目录弹层
    const renderPopup = () => {
      if (props.type !== 'catalog' || !props.items?.length) {
        return null;
      }

      return (
        <Popup
          show={popupShow.value}
          position="bottom"
          round
          safeAreaInsetBottom
          teleport="body"
          closeable
          closeIconPosition="top-right"
          onUpdate:show={(value: boolean) => {
            popupShow.value = value;
            if (!value) {
              onPopupClose();
            }
          }}
        >
          <div class={bem('popup')}>
            <div class={bem('popup-title')}>{ballLabel.value}</div>
            {props.items.map((item, index) => (
              <Cell
                key={item.id}
                title={item.title}
                class={bem('popup-item', {
                  active: activeIndex.value === index,
                })}
                clickable
                onClick={() => onSelectItem(item, index)}
              />
            ))}
          </div>
        </Popup>
      );
    };

    return () => {
      const showAnchor = props.type === 'terms' || visible.value;
      const showExpanded =
        props.type === 'terms' ? true : visible.value && expanded.value;
      const showCollapsed = visible.value && !expanded.value; // auto 胶囊态

      const Content = (
        <div
          ref={!props.teleport ? root : undefined}
          class={bem({
            active: showAnchor, // 整体入场动画
            expanded: showExpanded && props.type === 'terms',
            ball: showExpanded && props.type !== 'terms', // 圆球
            collapsed: showCollapsed, // 左侧胶囊
            terms: props.type === 'terms',
          })}
          style={style.value}
          {...attrs}
        >
          {props.type === 'terms'
            ? renderTerms()
            : visible.value
              ? renderControl()
              : null}
        </div>
      );

      const PopupNode = renderPopup();

      if (props.teleport) {
        return [
          // 占位：避免布局塌陷，真实浮层在 Teleport 目标
          <div ref={root} class={bem('placeholder')}></div>,
          <Teleport to={props.teleport}>
            {Content}
            {PopupNode}
          </Teleport>,
        ];
      }
      return (
        <>
          {Content}
          {PopupNode}
        </>
      );
    };
  },
});
