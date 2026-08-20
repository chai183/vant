import {
  ref,
  watch,
  nextTick,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  truthProp,
  numericProp,
  BORDER_BOTTOM,
  inBrowser,
  getZIndexStyle,
  makeArrayProp,
  createNamespace,
  HAPTICS_FEEDBACK,
} from '../utils';

// Composables
import { usePlaceholder } from '../composables/use-placeholder';

// Components
import { Icon } from '../icon';
import { Search, type SearchProps } from '../search';

// Types
import type { NavBarButton, NavBarMenuItem } from './types';

const [name, bem] = createNamespace('nav-bar');

/* ----按钮配置start---- */
// 插槽名称
const actionSlotNames = {
  left: ['left-action', 'left-extra-action'],
  right: ['right-action', 'right-extra-action'],
} as const;
/* ----按钮配置end---- */

/* ----组件属性配置start---- */
export const navBarProps = {
  title: String,
  subtitle: String,
  fixed: Boolean,
  zIndex: numericProp,
  background: String,
  border: truthProp,
  leftText: String,
  rightText: String,
  // 按钮数组配置
  leftButtons: makeArrayProp<NavBarButton>(),
  rightButtons: makeArrayProp<NavBarButton>(),
  leftDisabled: Boolean,
  rightDisabled: Boolean,
  leftArrow: Boolean,
  placeholder: Boolean,
  safeAreaInsetTop: Boolean,
  clickable: truthProp,
  search: Boolean,
  searchValue: String,
  searchPlaceholder: String,
  searchProps: Object as PropType<Partial<SearchProps>>,
};

export type NavBarProps = ExtractPropTypes<typeof navBarProps>;
/* ----组件属性配置end---- */

export default defineComponent({
  name,

  props: navBarProps,

  emits: [
    'clickLeft',
    'clickRight',
    'clickLeftButton',
    'clickRightButton',
    'selectRightMenu',
    'update:searchValue',
    'search',
  ],

  setup(props, { emit, slots }) {
    /* ----基础状态start---- */

    // 组件/元素的节点ref
    const navBarRef = ref<HTMLElement>();
    const leftRef = ref<HTMLElement>();
    const rightRef = ref<HTMLElement>();
    const titleRef = ref<HTMLElement>();

    const titleFontSize = ref<number>(); // 标题字体大小
    const searchLeft = ref<string>(); // search模式下左侧宽度
    const searchRight = ref<string>(); // search模式右侧宽度
    const activeRightMenu = ref<number>(); // 按钮菜单索引
    const renderPlaceholder = usePlaceholder(navBarRef, bem);

    let rafId = 0;
    /* ----基础状态end---- */

    /* ----交互事件处理start---- */

    // 基础按钮 -点击事件
    const onClickLeft = (event: MouseEvent) => {
      if (!props.leftDisabled) {
        emit('clickLeft', event);
      }
    };
    const onClickRight = (event: MouseEvent) => {
      if (!props.rightDisabled) {
        emit('clickRight', event);
      }
    };
    // 右侧菜单按钮交互事件处理
    const closeRightMenu = () => {
      activeRightMenu.value = undefined;
    };
    const onClickDocument = (event: MouseEvent) => {
      // 菜单打开后点击外部关闭，内部点击会被按钮/菜单事件拦截。
      if (
        activeRightMenu.value !== undefined &&
        navBarRef.value &&
        !navBarRef.value.contains(event.target as Node)
      ) {
        closeRightMenu();
      }
    };

    // 左侧多按钮多按钮点击事件
    const onClickLeftButton = (
      button: NavBarButton,
      index: number,
      event: MouseEvent,
    ) => {
      event.stopPropagation();

      if (props.leftDisabled || button.disabled) {
        return;
      }
      // 返回按钮信息，索引，event元素
      emit('clickLeftButton', button, index, event);

      // 左侧第一个按钮默认承担返回语义，同时兼容原 click-left 事件。
      if (index === 0) {
        emit('clickLeft', event);
      }
    };
    // 右侧多按钮点击事件
    const onClickRightButton = (
      button: NavBarButton,
      index: number,
      event: MouseEvent,
    ) => {
      event.stopPropagation();

      if (props.rightDisabled || button.disabled) {
        return;
      }

      // 有菜单时展示当前菜单；普通按钮点击后收起
      if (button.menu?.length) {
        activeRightMenu.value =
          activeRightMenu.value === index ? undefined : index;
      } else {
        emit('clickRightButton', button, index, event);
        closeRightMenu();
      }
    };
    // 右侧菜单按钮点击事件
    const onSelectRightMenu = (
      item: NavBarMenuItem,
      itemIndex: number,
      button: NavBarButton,
      buttonIndex: number,
      event: MouseEvent,
    ) => {
      event.stopPropagation();

      if (item.disabled) {
        return;
      }

      // 菜单项选择后立即关闭，避免选中态残留。
      emit('selectRightMenu', item, itemIndex, button, buttonIndex, event);
      closeRightMenu();
    };
    // 更新搜索值的事件
    const onUpdateSearchValue = (value: string) => {
      emit('update:searchValue', value);
    };
    // 点击搜索框左侧搜索按钮的事件
    const onClickSearchIcon = (event: MouseEvent) => {
      emit('search', props.searchValue ?? props.searchProps?.modelValue, event);
    };
    /* ----交互事件处理end---- */

    /* ----多按钮输出处理start---- */

    // 此处处理只是为了能获取到有效的buttons里的占位空间数据
    const getLeftButtons = () => {
      const hasText = props.leftArrow || props.leftText;
      // 左侧文本/箭头本身占一个展示位，避免再叠加出第三个位置。
      const maxCount = hasText ? 1 : 2;
      // 返回按钮列表
      return props.leftButtons.slice(0, maxCount);
    };

    const getRightButtons = () => {
      // 右侧文本占一个展示位，因此按钮最多保留一个。
      const maxCount = props.rightText ? 1 : 2;
      return props.rightButtons.slice(0, maxCount);
    };
    /* ----按钮输出处理end---- */

    /* ----动态计算布局大小----start */

    // 搜索框只在没有标题和 title 插槽时接管中间区域。
    const shouldRenderSearch = () =>
      props.search && !props.title && !slots.title;

    // 动态计算左右/标题宽度
    // 根据左右两侧的宽度，来获取左右宽度
    const updateTitleLayout = () => {
      const navBar = navBarRef.value;
      // 标题左右2侧预留的gap宽度
      const gap =
        navBar &&
        parseFloat(
          window
            .getComputedStyle(navBar)
            .getPropertyValue('--van-nav-bar-title-gap'),
        );
      const titleGap = gap || 6;
      // 左侧右侧的左右距离
      const edgeGap =
        navBar &&
        parseFloat(
          window
            .getComputedStyle(navBar)
            .getPropertyValue('--van-nav-bar-horizontal-padding'),
        );
      const horizontalPadding = edgeGap || 8;

      // 左右的具体宽度；实际宽度->插槽默认数量2->实际数量
      const leftWidth = leftRef.value?.getBoundingClientRect().width || 0;
      const rightWidth = rightRef.value?.getBoundingClientRect().width || 0;

      // search情况下判断出left/right的宽度
      const nextSearchLeft = `${leftWidth ? leftWidth + titleGap : horizontalPadding}px`;
      const nextSearchRight = `${rightWidth ? rightWidth + titleGap : horizontalPadding}px`;

      // 左侧search宽度
      if (searchLeft.value !== nextSearchLeft) {
        searchLeft.value = nextSearchLeft;
      }
      // 右侧search宽度
      if (searchRight.value !== nextSearchRight) {
        searchRight.value = nextSearchRight;
      }
    };

    // 动态计算标题文字大小
    const updateTitleFontSize = () => {
      if (!inBrowser) {
        return;
      }

      updateTitleLayout();
      // 开启搜索模式后，没有标题了
      if (shouldRenderSearch()) {
        titleFontSize.value = undefined;
        return;
      }

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const title = titleRef.value;
        if (!title) {
          return;
        }

        // 先清空内联字号，避免上一次缩放影响本次默认字号计算。
        const previousFontSize = title.style.fontSize;
        title.style.fontSize = '';
        // 获取文字大小
        const { fontSize } = window.getComputedStyle(title);
        const minFontSize =
          parseFloat(
            window
              .getComputedStyle(title)
              .getPropertyValue('--van-nav-bar-title-min-font-size'),
          ) || 14;
        const maxFontSize = parseFloat(fontSize);

        // 标题先滚动宽度和元素宽度 按比例缩小，仍超出时交给省略样式截断。
        const nextFontSize =
          title.scrollWidth > title.clientWidth && title.clientWidth > 0
            ? Math.max(
                minFontSize,
                Math.floor(
                  (maxFontSize * title.clientWidth) / title.scrollWidth,
                ),
              )
            : undefined;

        title.style.fontSize = previousFontSize;
        // 字体赋值
        if (titleFontSize.value !== nextFontSize) {
          titleFontSize.value = nextFontSize;
        }
      });
    };
    /* ----动态计算布局大小----end */

    /* ----按钮和菜单渲染start---- */

    // 左侧根据left-arrow left-text渲染指定内容
    const renderLegacyLeftContent = () => [
      props.leftArrow && <Icon class={bem('arrow')} name="arrow-left" />,
      props.leftText && <span class={bem('text')}>{props.leftText}</span>,
    ];

    // 普通按钮渲染逻辑
    const renderButtonContent = (
      button: NavBarButton,
      index: number,
      side: 'left' | 'right',
    ) => {
      // 单个按钮插槽优先级高于 icon/text 配置，便于精确覆盖某个位置。
      const slot = slots[actionSlotNames[side][index]];
      if (slot) {
        return slot({ button, index });
      }

      return [
        button.icon && (
          <Icon
            name={button.icon}
            classPrefix={button.iconPrefix}
            size={button.size}
            class={bem('action-icon')}
          />
        ),
        button.text && (
          <span class={bem('action-text', { right: side === 'right' })}>
            {button.text}
          </span>
        ),
      ];
    };

    // 右侧菜单按钮渲染的逻辑
    const renderRightMenu = (button: NavBarButton, buttonIndex: number) => {
      // 菜单挂在按钮内部，配合 NavBar 提层避免被后续内容遮挡。
      const { menu } = button;

      if (!menu?.length || activeRightMenu.value !== buttonIndex) {
        return;
      }

      return (
        <div class={bem('menu-wrapper')}>
          <div class={bem('menu-arrow')}></div>
          <div class={bem('menu')} role="menu">
            {menu.map((item, itemIndex) => (
              <div
                role="menuitem"
                class={[
                  bem('menu-item', { disabled: item.disabled }),
                  item.className,
                ]}
                tabindex={item.disabled ? undefined : 0}
                aria-disabled={item.disabled || undefined}
                onClick={(event) =>
                  onSelectRightMenu(item, itemIndex, button, buttonIndex, event)
                }
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    classPrefix={item.iconPrefix}
                    class={bem('menu-icon')}
                    size={16}
                    color={item.color}
                  />
                )}
                <span
                  class={[
                    bem('menu-text'),
                    { [BORDER_BOTTOM]: itemIndex < menu.length - 1 },
                  ]}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    // 按钮渲染动作 --调用上方按钮渲染逻辑
    const renderAction = (
      button: NavBarButton,
      index: number,
      side: 'left' | 'right',
    ) => {
      const disabled =
        button.disabled ||
        (side === 'left' ? props.leftDisabled : props.rightDisabled);
      const hasMenu = side === 'right' && !!button.menu?.length;

      return (
        <div
          class={[
            bem('action', {
              disabled,
              menu: hasMenu,
              active: side === 'right' && activeRightMenu.value === index,
            }),
            props.clickable && !disabled ? HAPTICS_FEEDBACK : '',
            button.className,
          ]}
          style={{
            color: button.color,
          }}
          tabindex={disabled ? undefined : 0}
          aria-disabled={disabled || undefined}
          onClick={(event) =>
            side === 'left'
              ? onClickLeftButton(button, index, event)
              : onClickRightButton(button, index, event)
          }
        >
          {renderButtonContent(button, index, side)}
          {/* 检测是否有右侧菜单 */}
          {side === 'right' && renderRightMenu(button, index)}
        </div>
      );
    };
    /* ----按钮和菜单渲染end---- */

    /* ----左右区域渲染start---- */
    const renderLeft = () => {
      // left 插槽会整体接管左侧区域，不再混入内置按钮逻辑。
      if (slots.left) {
        return slots.left();
      }

      const leftButtons = getLeftButtons();
      if (leftButtons.length) {
        return (
          <div class={bem('actions')}>
            {/* 渲染左侧原本支持的arrow和text */}
            {(props.leftArrow || props.leftText) && (
              <div
                class={[
                  bem('action', { disabled: props.leftDisabled }),
                  props.clickable && !props.leftDisabled
                    ? HAPTICS_FEEDBACK
                    : '',
                ]}
                aria-disabled={props.leftDisabled || undefined}
                tabindex={props.leftDisabled ? undefined : 0}
                onClick={(event) => {
                  event.stopPropagation();
                  onClickLeft(event);
                }}
              >
                {/* 左侧箭头和文本 */}
                {renderLegacyLeftContent()}
              </div>
            )}
            {/* 渲染按钮 */}
            {leftButtons.map((button, index) =>
              renderAction(button, index, 'left'),
            )}
          </div>
        );
      }

      return renderLegacyLeftContent();
    };

    const renderRight = () => {
      // right 插槽会整体接管右侧区域，不再混入内置按钮逻辑。
      if (slots.right) {
        return slots.right();
      }

      const rightButtons = getRightButtons();
      if (rightButtons.length) {
        return (
          <div class={bem('actions')}>
            {/* 右侧通过rightText文本传递的 */}
            {props.rightText && (
              <span
                class={[
                  bem('text', { right: true }),
                  props.clickable && !props.rightDisabled
                    ? HAPTICS_FEEDBACK
                    : '',
                ]}
                onClick={(event) => {
                  closeRightMenu();
                  onClickRight(event);
                }}
              >
                {props.rightText}
              </span>
            )}
            {/* 渲染右侧按钮 */}
            {rightButtons.map((button, index) =>
              renderAction(button, index, 'right'),
            )}
          </div>
        );
      }

      return (
        <span class={bem('text', { right: true })}>{props.rightText}</span>
      );
    };
    /* ----左右区域渲染end---- */

    /* ----标题和搜索渲染start---- */
    const renderSearch = () => {
      if (slots.search) {
        return slots.search();
      }

      // 搜索框复用 VanSearch，仅透出内容同步和左侧搜索图标点击事件。
      const searchProps = props.searchProps || {};
      return (
        <div class={bem('search')}>
          <Search
            {...searchProps}
            modelValue={props.searchValue ?? searchProps.modelValue}
            placeholder={props.searchPlaceholder ?? searchProps.placeholder}
            onClickLeftIcon={onClickSearchIcon}
            onUpdate:modelValue={onUpdateSearchValue}
          />
        </div>
      );
    };

    const renderTitleContent = () => {
      const title = slots.title ? slots.title() : props.title;
      const subtitle = slots.subtitle ? slots.subtitle() : props.subtitle;
      if (subtitle) {
        return (
          <div class={bem('title-content')}>
            <div class={[bem('titlemain'), 'van-ellipsis']}>{title}</div>
            <div class={[bem('subtitle'), 'van-ellipsis']}>{subtitle}</div>
          </div>
        );
      }
      return title;
    };

    // 渲染标题区域（标题/搜索）
    const renderTitle = (hasLeft: boolean, hasRight: boolean) => {
      const isSearch = shouldRenderSearch();
      const style: CSSProperties = {};

      if (titleFontSize.value) {
        style.fontSize = `${titleFontSize.value}px`;
        style.lineHeight = `${titleFontSize.value}px`;
      }

      // 左右两侧定制search定位
      if (isSearch) {
        style.left = searchLeft.value;
        style.right = searchRight.value;
      }

      return (
        <div
          ref={titleRef}
          style={Object.keys(style).length ? style : undefined}
          class={[
            bem('title', {
              search: isSearch,
              'has-left': isSearch && hasLeft,
              'has-right': isSearch && hasRight,
            }),
            !isSearch ? 'van-ellipsis' : '',
          ]}
        >
          {isSearch ? renderSearch() : renderTitleContent()}
        </div>
      );
    };
    /* ----标题和搜索渲染end---- */

    /* ----导航栏整体渲染start---- */
    const renderNavBar = () => {
      const { fixed, border, zIndex } = props;
      const style: CSSProperties = getZIndexStyle(zIndex);

      if (props.background) {
        style.background = props.background;
      }

      const hasLeftButtons = props.leftButtons.length > 0;
      const hasRightButtons = props.rightButtons.length > 0;
      // 是否渲染左右容器看原始配置；实际展示数量由 getLeft/RightButtons 裁剪。
      const hasLeft =
        hasLeftButtons || props.leftArrow || props.leftText || slots.left;
      const hasRight = hasRightButtons || props.rightText || slots.right;

      return (
        <div
          ref={navBarRef}
          style={style}
          class={[
            // 菜单打开时提高 NavBar 层级，避免被后续内容遮挡。
            bem({
              fixed,
              'menu-open': activeRightMenu.value !== undefined,
              'custom-background': !!props.background,
            }),
            {
              [BORDER_BOTTOM]: border,
              'van-safe-area-top': props.safeAreaInsetTop,
            },
          ]}
        >
          <div class={bem('content')}>
            {hasLeft && (
              <div
                ref={leftRef}
                class={[
                  bem('left', { disabled: props.leftDisabled }),
                  props.clickable && !props.leftDisabled && !hasLeftButtons
                    ? HAPTICS_FEEDBACK
                    : '',
                ]}
                onClick={hasLeftButtons ? undefined : onClickLeft}
              >
                {renderLeft()}
              </div>
            )}
            {renderTitle(Boolean(hasLeft), Boolean(hasRight))}
            {hasRight && (
              <div
                ref={rightRef}
                class={[
                  bem('right', { disabled: props.rightDisabled }),
                  props.clickable && !props.rightDisabled && !hasRightButtons
                    ? HAPTICS_FEEDBACK
                    : '',
                ]}
                onClick={hasRightButtons ? undefined : onClickRight}
              >
                {renderRight()}
              </div>
            )}
          </div>
        </div>
      );
    };
    /* ----导航栏整体渲染end---- */

    /* ----生命周期和布局监听start---- */
    onMounted(() => {
      // 初始化计算font-size
      updateTitleFontSize();

      if (inBrowser) {
        document.addEventListener('click', onClickDocument);
      }
    });

    onUpdated(updateTitleFontSize);

    onBeforeUnmount(() => {
      if (inBrowser) {
        cancelAnimationFrame(rafId);
        document.removeEventListener('click', onClickDocument);
      }
    });

    watch(
      () => [
        props.title,
        props.leftText,
        props.rightText,
        props.leftButtons,
        props.rightButtons,
        props.search,
      ],
      // 标题、按钮或搜索态变化后，需要等 DOM 更新完成再重算左右避让宽度。
      () => {
        nextTick(() => updateTitleFontSize());
      },
      { deep: true },
    );
    /* ----生命周期和布局监听end---- */

    return () => {
      if (props.fixed && props.placeholder) {
        return renderPlaceholder(renderNavBar);
      }
      return renderNavBar();
    };
  },
});
