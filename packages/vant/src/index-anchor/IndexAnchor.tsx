import {
  ref,
  reactive,
  computed,
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

import {
  extend,
  numericProp,
  BORDER_BOTTOM,
  getZIndexStyle,
  createNamespace,
  matchSearchText,
} from '../utils';
import { INDEX_BAR_KEY } from '../index-bar/IndexBar';
import { getScrollTop, getRootScrollTop } from '../utils/dom';

import { useRect, useParent } from '@vant/use';
import { useExpose } from '../composables/use-expose';
import type { IndexBarProvide } from '../index-bar/types';
import { Cell } from '../cell';

const [name, bem] = createNamespace('index-anchor');

export const indexAnchorProps = {
  index: numericProp,
  searchTexts: Array as PropType<string[]>, // 分组搜索文案；可触发内置 Cell 列表
  skipSearchItems: Boolean, // IndexBar 注入：传统写法含手写 Cell 时跳过内置列表
};

export type IndexAnchorProps = ExtractPropTypes<typeof indexAnchorProps>;

export default defineComponent({
  name,

  props: indexAnchorProps,

  setup(props, { slots }) {
    const state = reactive({
      top: 0,
      left: null,
      rect: { top: 0, height: 0 },
      width: null,
      active: false,
      rootHeight: 0,
    });

    // root：分组容器；anchor：标题条 DOM（getRect.height 仅量标题）
    const root = ref<HTMLElement>();
    const anchor = ref<HTMLElement>();
    const { parent } = useParent<IndexBarProvide>(INDEX_BAR_KEY);

    if (!parent) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Vant] <IndexAnchor> must be a child component of <IndexBar>.',
        );
      }
      return;
    }

    const searchTexts = computed(() => {
      if (props.searchTexts?.length) return props.searchTexts;
      return [String(props.index ?? '')];
    });

    const keyword = computed(() => parent.search.value.trim());

    const matchedTexts = computed(() => {
      if (!parent.props.searchable || !keyword.value) return searchTexts.value;
      return searchTexts.value.filter((text) =>
        matchSearchText(text, keyword.value),
      );
    });

    // 供 IndexBar 过滤 visibleChildren / scrollTo
    const isVisible = computed(
      () =>
        !parent.props.searchable ||
        !keyword.value ||
        matchedTexts.value.length > 0,
    );

    const isSticky = () => state.active && parent.props.sticky;

    const anchorStyle = computed<CSSProperties | undefined>(() => {
      const { zIndex, highlightColor } = parent.props;

      if (isSticky()) {
        return extend(getZIndexStyle(zIndex), {
          left: state.left ? `${state.left}px` : undefined,
          width: state.width ? `${state.width}px` : undefined,
          transform: state.top
            ? `translate3d(0, ${state.top}px, 0)`
            : undefined,
          color: highlightColor,
        });
      }
    });

    // top：分组起点；height：仅标题条（供 IndexBar.getActiveAnchor）
    const getRect = (
      scrollParent: Window | Element,
      scrollParentRect: { top: number },
    ) => {
      const rootRect = useRect(root);
      const titleRect = useRect(anchor);
      state.rootHeight = rootRect.height;
      state.rect.height = titleRect.height || rootRect.height;

      if (scrollParent === window || scrollParent === document.body) {
        state.rect.top = rootRect.top + getRootScrollTop();
      } else {
        state.rect.top =
          rootRect.top + getScrollTop(scrollParent) - scrollParentRect.top;
      }

      return state.rect;
    };

    const renderSearchItem = (text: string, index: number) => {
      const slotProps = {
        text,
        item: text,
        index,
        anchorIndex: props.index,
      };
      const cellSlots: Record<string, () => unknown> = {};
      if (slots['item-icon']) {
        cellSlots.icon = () => slots['item-icon']!(slotProps);
      }
      if (slots['item-label']) {
        cellSlots.label = () => slots['item-label']!(slotProps);
      }
      if (slots['item-value']) {
        cellSlots.value = () => slots['item-value']!(slotProps);
      }
      if (slots['item-extra']) {
        cellSlots.extra = () => slots['item-extra']!(slotProps);
      }

      return (
        <Cell
          key={index}
          title={text}
          highlight={keyword.value ? [keyword.value] : []}
          v-slots={cellSlots}
        />
      );
    };

    const renderBody = () => {
      // #body：完全自定义列表；否则 searchTexts + searchable 时内置 Cell
      if (slots.body) {
        return slots.body({ texts: matchedTexts.value });
      }

      if (
        props.skipSearchItems ||
        !parent.props.searchable ||
        !props.searchTexts?.length
      ) {
        return null;
      }

      return matchedTexts.value.map(renderSearchItem);
    };

    useExpose({
      state,
      getRect,
      isVisible: () => isVisible.value,
    });

    return () => {
      if (!isVisible.value) return null;

      const sticky = isSticky();

      return (
        <div
          ref={root}
          style={{
            height: sticky
              ? `${state.rootHeight || state.rect.height}px`
              : undefined,
          }}
        >
          <div
            ref={anchor}
            style={anchorStyle.value}
            class={[bem({ sticky }), { [BORDER_BOTTOM]: sticky }]}
          >
            {slots.default ? slots.default() : props.index}
          </div>
          {renderBody()}
        </div>
      );
    };
  },
});
