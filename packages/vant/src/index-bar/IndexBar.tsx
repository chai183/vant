import {
  ref,
  watch,
  computed,
  nextTick,
  Teleport,
  isVNode,
  cloneVNode,
  onMounted,
  defineComponent,
  type VNode,
  type PropType,
  type InjectionKey,
  type CSSProperties,
  type TeleportProps,
  type ExtractPropTypes,
  type ComponentPublicInstance,
} from 'vue';

import {
  isDef,
  isHidden,
  truthProp,
  numericProp,
  getScrollTop,
  preventDefault,
  makeNumberProp,
  makeStringProp,
  createNamespace,
  getRootScrollTop,
  setRootScrollTop,
  matchSearchText,
  type Numeric,
} from '../utils';

import {
  useRect,
  useChildren,
  useScrollParent,
  useEventListener,
} from '@vant/use';
import { useTouch } from '../composables/use-touch';
import { useExpose } from '../composables/use-expose';

import { type IndexBarProvide } from './types';
import { Search } from '../search';
import { Empty } from '../empty';

// 默认右侧索引 A-Z
function genAlphabet() {
  const charCodeOfA = 'A'.charCodeAt(0);
  return Array(26)
    .fill('')
    .map((_, i) => String.fromCharCode(charCodeOfA + i));
}

const [name, bem] = createNamespace('index-bar');

// ---------- 以下为 searchable 时「传统写法」在 VNode 层过滤 slot 用到的工具 ----------

const getVNodeComponentName = (vnode: VNode) => {
  const { type } = vnode;
  if (typeof type === 'object' && type && 'name' in type) {
    return type.name;
  }
};

const isIndexAnchorVNode = (vnode: VNode) =>
  getVNodeComponentName(vnode) === 'van-index-anchor';

const isCellVNode = (vnode: VNode) =>
  getVNodeComponentName(vnode) === 'van-cell';

const hasCellVNode = (node: unknown): boolean => {
  if (!isVNode(node)) return false;
  if (isCellVNode(node)) return true;
  return Array.isArray(node.children) && node.children.some(hasCellVNode);
};

// 传统写法：Anchor 后紧跟手写 Cell 时，列表由 IndexBar 过滤而非 Anchor 内置渲染
const hasManualCellAfterAnchor = (children: unknown[], anchorIndex: number) => {
  for (let index = anchorIndex + 1; index < children.length; index++) {
    const child = children[index];
    if (isVNode(child) && isIndexAnchorVNode(child)) return false;
    if (hasCellVNode(child)) return true;
  }
  return false;
};

// 读 VNode 上的 prop（兼容 camelCase / kebab-case）
const getVNodeProp = <T,>(
  vnode: VNode,
  camelizeName: string,
  hyphenateName?: string,
) => {
  const props = vnode.props as Record<string, T> | null;
  return props?.[camelizeName] ?? props?.[hyphenateName || camelizeName];
};

// 与 IndexAnchor.searchTexts 逻辑一致：用于判断分组是否命中搜索
const getSearchTextsFromAnchor = (vnode: VNode) => {
  const searchTexts = getVNodeProp<unknown>(
    vnode,
    'searchTexts',
    'search-texts',
  );
  const index = getVNodeProp<Numeric>(vnode, 'index');

  if (Array.isArray(searchTexts) && searchTexts.length) {
    return searchTexts.map(String);
  }
  return [String(index ?? '')];
};

// 分组 search-texts 任一命中则保留该 Anchor（具体 Cell 再单独过滤）
const isAnchorMatched = (vnode: VNode, keyword: string) =>
  getSearchTextsFromAnchor(vnode).some((text) =>
    matchSearchText(text, keyword),
  );

const isCellMatched = (vnode: VNode, keyword: string) => {
  const title = getVNodeProp<unknown>(vnode, 'title');
  // 无 title 的自定义 Cell 不参与过滤，避免误删
  if (!isDef(title)) return true;
  if (Array.isArray(title)) {
    return title.some((item) => matchSearchText(String(item), keyword));
  }
  return matchSearchText(String(title), keyword);
};

export const indexBarProps = {
  sticky: truthProp,
  zIndex: numericProp,
  teleport: [String, Object] as PropType<TeleportProps['to']>,
  highlightColor: String,
  stickyOffsetTop: makeNumberProp(0),
  indexList: {
    type: Array as PropType<Numeric[]>,
    default: genAlphabet,
  },
  searchable: Boolean, // 顶部 Search + 列表过滤 + Empty
  search: String, // v-model:search
  searchPlaceholder: String,
  emptyImage: makeStringProp('search'),
  emptyDescription: String,
};

export type IndexBarProps = ExtractPropTypes<typeof indexBarProps>;

// 供 IndexAnchor useParent 注入 props、search
export const INDEX_BAR_KEY: InjectionKey<IndexBarProvide> = Symbol(name);

// IndexAnchor 内部 state，由 onScroll 写入以驱动吸顶样式
type IndexAnchorState = {
  top: number;
  left: number | null;
  rect: { top: number; height: number };
  width: number | null;
  active: boolean;
};

type IndexAnchorInstance = ComponentPublicInstance & {
  index: Numeric;
  state: IndexAnchorState;
  isVisible: () => boolean;
  getRect: (
    scrollParent: Window | Element,
    scrollParentRect: { top: number },
  ) => { top: number; height: number };
};

export default defineComponent({
  name,

  props: indexBarProps,

  emits: ['select', 'change', 'update:search'],

  setup(props, { emit, slots }) {
    const root = ref<HTMLElement>();
    const sidebar = ref<HTMLElement>();
    const activeAnchor = ref<Numeric>(''); // 当前高亮索引，驱动侧栏 active 与 change 事件
    const search = ref(props.search ?? ''); // 与 props.search / v-model:search 同步

    const touch = useTouch();
    const scrollParent = useScrollParent(root); // 列表滚动容器（window 或内部可滚元素）
    const { children, linkChildren } = useChildren<
      IndexAnchorInstance,
      IndexBarProvide
    >(INDEX_BAR_KEY);
    // 用户点击/滑动侧栏后暂存目标索引，onScroll 里优先用它算 active（避免滚动动画期间高亮乱跳）
    let selectActiveIndex: string;

    linkChildren({ props, search });

    // searchable 时由 updateSidebarLayout 写入 top / maxHeight
    const sidebarLayout = ref<CSSProperties>({});

    const sidebarStyle = computed<CSSProperties>(() => {
      const style: CSSProperties = { ...sidebarLayout.value };
      // 侧栏略高于锚点，避免被 sticky 标题盖住
      if (isDef(props.zIndex)) {
        style.zIndex = +props.zIndex + 1;
      }
      return style;
    });

    // 侧栏当前激活项文字色（bubble 内 label 也用到）
    const highlightStyle = computed<CSSProperties | undefined>(() => {
      if (props.highlightColor) {
        return { color: props.highlightColor };
      }
    });

    // 有搜索词：仅保留仍可见的 IndexAnchor
    const visibleChildren = computed(() =>
      !props.searchable || !search.value.trim()
        ? children
        : children.filter((item) => item.isVisible()),
    );

    // 侧栏索引：无搜索用 indexList，有搜索与 visibleChildren 对齐
    const visibleIndexList = computed(() => {
      const visible = visibleChildren.value;
      if (!props.searchable || !search.value.trim() || !children.length) {
        return props.indexList;
      }
      return props.indexList.filter((index) =>
        visible.some((item) => String(item.index) === String(index)),
      );
    });

    // 有搜索词且全部锚点不可见
    const showEmpty = computed(
      () =>
        props.searchable &&
        !!search.value.trim() &&
        !!children.length &&
        !visibleChildren.value.length,
    );

    // 搜索有关键词时隐藏侧栏
    const isSearching = computed(
      () => props.searchable && !!search.value.trim(),
    );

    // 外部 v-model:search 写入
    watch(
      () => props.search,
      (value) => {
        if (value !== undefined && value !== search.value) {
          search.value = value;
        }
      },
    );

    // 根据滚动位置判断当前应高亮第几个锚点（从下往上找第一个 top 已滚过的）
    // rects[i].height 必须是标题条高度，见 IndexAnchor.getRect
    const getActiveAnchor = (
      scrollTop: number,
      rects: Array<{ top: number; height: number }>,
    ) => {
      for (let i = rects.length - 1; i >= 0; i--) {
        const prevHeight = i > 0 ? rects[i - 1].height : 0;
        // sticky 时上一段标题占位也算进 reachTop，避免过早切到下一字母
        const reachTop = props.sticky ? prevHeight + props.stickyOffsetTop : 0;

        if (scrollTop + reachTop >= rects[i].top) {
          return i;
        }
      }
      return -1;
    };

    const getMatchAnchor = (index: string) =>
      children.find((item) => String(item.index) === index);

    // 侧栏限制在容器可见区域内（基础用法与 searchable 一致，避免超出 Tab）
    const updateSidebarLayout = () => {
      if (!sidebar.value || showEmpty.value) {
        sidebarLayout.value = {};
        return;
      }

      let regionTop = 0;
      if (root.value) {
        regionTop = Math.max(useRect(root).top, 0);
        if (props.searchable) {
          const searchEl = root.value.querySelector(
            `.${bem('search')}`,
          ) as HTMLElement | null;
          if (searchEl) {
            regionTop = searchEl.getBoundingClientRect().bottom;
          }
        }
      }

      const bottomPadding = 16;
      const regionBottom = window.innerHeight - bottomPadding;
      const availableHeight = Math.max(regionBottom - regionTop, 0);
      const sidebarHeight = useRect(sidebar).height;

      // 尽量居中，但不超出 [regionTop, regionBottom]
      let top = (window.innerHeight - sidebarHeight) / 2;
      top = Math.max(top, regionTop);
      top = Math.min(top, regionBottom - sidebarHeight);

      // 侧栏过高则贴搜索框下缘，并限制 maxHeight 以支持内部滚动
      if (sidebarHeight > availableHeight) {
        top = regionTop;
      }

      sidebarLayout.value = {
        top: `${top}px`,
        maxHeight: `${availableHeight}px`,
        transform: 'none', // 覆盖 less 里 translateY(-50%)
      };
    };

    // 滚动主逻辑：更新侧栏高亮 + 各 IndexAnchor 吸顶 state
    const onScroll = () => {
      if (isHidden(root)) return;

      const { sticky } = props;
      const indexList = visibleIndexList.value; // 侧栏要渲染的字母列表
      // 参与位置计算的锚点：搜索时只用仍可见的分组
      const scrollAnchors =
        props.searchable && search.value.trim()
          ? visibleChildren.value
          : children;
      const scrollTop = getScrollTop(scrollParent.value!);
      const scrollParentRect = useRect(scrollParent);

      const rects = scrollAnchors.map((item) =>
        item.getRect(scrollParent.value!, scrollParentRect),
      );

      let active = -1;
      if (selectActiveIndex) {
        // 刚点击侧栏：按目标锚点位置反推 active，而不是当前 scrollTop
        const match = getMatchAnchor(selectActiveIndex);
        if (match) {
          const rect = match.getRect(scrollParent.value!, scrollParentRect);
          if (props.sticky && props.stickyOffsetTop) {
            active = getActiveAnchor(rect.top - props.stickyOffsetTop, rects);
          } else {
            active = getActiveAnchor(rect.top, rects);
          }
        }
      } else {
        active = getActiveAnchor(scrollTop, rects);
      }

      activeAnchor.value = indexList[active];

      if (sticky) {
        scrollAnchors.forEach((item, index) => {
          const { state, $el } = item;
          // 当前项与上一项需要同步 left/width，吸顶标题与列表同宽
          if (index === active || index === active - 1) {
            const rect = $el.getBoundingClientRect();
            state.left = rect.left;
            state.width = rect.width;
          } else {
            state.left = null;
            state.width = null;
          }

          if (index === active) {
            // 当前分组标题吸顶
            state.active = true;
            state.top =
              Math.max(props.stickyOffsetTop, rects[index].top - scrollTop) +
              scrollParentRect.top;
          } else if (index === active - 1 && selectActiveIndex === '') {
            // 上一分组标题被顶出：随滚动做「顶走」动画
            const activeItemTop = rects[active].top - scrollTop;
            state.active = activeItemTop > 0;
            state.top =
              activeItemTop + scrollParentRect.top - rects[index].height;
          } else {
            state.active = false;
          }
        });
      }

      selectActiveIndex = '';
      updateSidebarLayout();
    };

    // 挂载或 indexList 变化后：首帧计算高亮与侧栏位置
    const init = () => {
      nextTick(() => {
        onScroll();
        updateSidebarLayout();
      });
    };

    useEventListener('scroll', onScroll, {
      target: scrollParent,
      passive: true,
    });

    useEventListener('resize', updateSidebarLayout);

    onMounted(init);

    watch(() => props.indexList, init);

    // 搜索词变化：同步 v-model 并重算高亮 / 侧栏 / 吸顶
    watch(search, (value) => {
      emit('update:search', value);
      nextTick(onScroll);
    });

    watch(activeAnchor, (value) => {
      if (value) emit('change', value);
    });

    // 右侧 A/B/C… 与左侧 bubble
    const renderIndexes = () =>
      visibleIndexList.value.map((index) => {
        const active = index === activeAnchor.value;
        return (
          <span
            class={bem('index', { active })}
            style={active ? highlightStyle.value : undefined}
            data-index={index}
          >
            <span class={bem('bubble', { show: active })}>{index}</span>
            <span class={bem('label')}>{index}</span>
          </span>
        );
      });

    // searchable + 传统写法：在 VNode 树里按搜索词裁剪 Cell（Anchor 仍保留以维持 useChildren 注册）
    const filterSearchChildren = (
      children: unknown[],
      inheritedAnchorMatched?: boolean,
    ): unknown[] => {
      // 进入子树时继承外层 Anchor 是否命中（如 v-for 包一层 div）
      let currentAnchorMatched = inheritedAnchorMatched;

      return children.reduce<unknown[]>((nodes, child, index) => {
        if (!isVNode(child)) {
          nodes.push(child);
          return nodes;
        }

        if (isIndexAnchorVNode(child)) {
          currentAnchorMatched = isAnchorMatched(child, search.value);
          nodes.push(
            hasManualCellAfterAnchor(children, index)
              ? // 告诉 Anchor 不要内置渲染 Cell，避免与手写 Cell 重复
                cloneVNode(child, { skipSearchItems: true })
              : child,
          );
          return nodes;
        }

        if (isCellVNode(child)) {
          // 分组未命中则不渲染该组下任何 Cell；命中再按 title 过滤
          if (
            currentAnchorMatched !== false &&
            isCellMatched(child, search.value)
          ) {
            nodes.push(child);
          }
          return nodes;
        }

        // 兼容 <div v-for> 包一层的情况，递归过滤子节点
        if (Array.isArray(child.children)) {
          const cloned = cloneVNode(child);
          cloned.children = filterSearchChildren(
            child.children,
            currentAnchorMatched,
          ) as VNode['children'];
          (cloned as VNode & { dynamicChildren?: null }).dynamicChildren = null;
          nodes.push(cloned);
          return nodes;
        }

        nodes.push(child);
        return nodes;
      }, []);
    };

    const renderContent = () => {
      const content = slots.default?.();
      if (!props.searchable || !content) return content;
      return filterSearchChildren(content);
    };

    // 点击 bubble 等子元素时向上找 data-index
    const getIndexFromElement = (element: Element | null) => {
      let current = element;
      while (current) {
        const { index } = (current as HTMLElement).dataset;
        if (index) return index;
        current = current.parentElement;
      }
    };

    // 侧栏点击 / 滑动选中时滚动到对应锚点
    const scrollTo = (index: Numeric) => {
      selectActiveIndex = String(index);
      const match = getMatchAnchor(selectActiveIndex);

      if (
        match &&
        (!props.searchable || !search.value.trim() || match.isVisible())
      ) {
        const scrollTop = getScrollTop(scrollParent.value!);
        const scrollParentRect = useRect(scrollParent);
        const { offsetHeight } = document.documentElement;

        match.$el.scrollIntoView();

        // 已在底部时 scrollIntoView 无效，手动触发一次 onScroll
        if (scrollTop === offsetHeight - scrollParentRect.height) {
          onScroll();
          return;
        }

        // sticky 时补偿 stickyOffsetTop，避免标题被挡在搜索栏/顶栏下
        if (props.sticky && props.stickyOffsetTop) {
          if (getRootScrollTop() === offsetHeight - scrollParentRect.height) {
            setRootScrollTop(getRootScrollTop());
          } else {
            setRootScrollTop(getRootScrollTop() - props.stickyOffsetTop);
          }
        }

        emit('select', match.index);
      }
    };

    const onClickSidebar = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const index = target.dataset.index || getIndexFromElement(target);
      if (index) scrollTo(index);
    };

    let touchActiveIndex: string;

    // 侧栏纵向滑动快速选索引（需 passive: false 才能 preventDefault）
    const onTouchMove = (event: TouchEvent) => {
      touch.move(event);

      if (touch.isVertical()) {
        preventDefault(event);

        const { clientX, clientY } = event.touches[0];
        const target = document.elementFromPoint(
          clientX,
          clientY,
        ) as HTMLElement;
        if (target) {
          const index = target.dataset.index || getIndexFromElement(target);

          if (index && touchActiveIndex !== index) {
            touchActiveIndex = index;
            scrollTo(index);
          }
        }
      }
    };

    const renderSidebar = () => (
      <div
        ref={sidebar}
        class={bem('sidebar', {
          layout: isDef(sidebarLayout.value.top),
        })}
        style={sidebarStyle.value}
        onClick={onClickSidebar}
        onTouchstartPassive={touch.start}
      >
        {renderIndexes()}
      </div>
    );

    useExpose({ scrollTo });

    useEventListener('touchmove', onTouchMove, {
      target: sidebar,
    });

    return () => (
      <div ref={root} class={bem()}>
        {/* searchable：顶部搜索 */}
        {props.searchable && (
          <Search
            shape="round"
            class={bem('search')}
            modelValue={search.value}
            placeholder={props.searchPlaceholder}
            onUpdate:modelValue={(value) => {
              search.value = value;
            }}
          />
        )}
        {/* 有搜索词但无匹配分组 */}
        {showEmpty.value && (
          <Empty
            class={bem('empty')}
            image={props.emptyImage}
            description={props.emptyDescription}
          />
        )}
        {/* 侧栏可 teleport 到 body 等，避免被父级 overflow 裁剪 */}
        {!showEmpty.value &&
          !isSearching.value &&
          (props.teleport ? (
            <Teleport to={props.teleport}>{renderSidebar()}</Teleport>
          ) : (
            renderSidebar()
          ))}
        {/* 空结果用 display:none 而非卸载 slot，避免 IndexAnchor 反复注册 */}
        <div style={{ display: showEmpty.value ? 'none' : undefined }}>
          {renderContent()}
        </div>
      </div>
    );
  },
});
