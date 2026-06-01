import {
  ref,
  watch,
  onMounted,
  onActivated,
  onBeforeUnmount,
  nextTick,
  defineComponent,
  type PropType,
} from 'vue';

import { createNamespace, makeStringProp } from '../utils';
import Tag from '../tag';

const [, bem] = createNamespace('field');

const TAG_GAP = 8;
const TAG_PROPS = {
  color: '#EEEEEE',
  textColor: '#333333',
  size: 'medium',
} as const;

function formatTagText(item: unknown) {
  return String(item);
}

export default defineComponent({
  name: 'VanFieldReadonlyTags',

  props: {
    items: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    placeholder: makeStringProp(''),
  },

  setup(props) {
    const containerRef = ref<HTMLElement>();
    const measureRef = ref<HTMLElement>();
    const overflowMeasureRef = ref<HTMLElement>();
    const visibleCount = ref(props.items.length);
    let needRecalculate = false;
    let resizeObserver: ResizeObserver | undefined;

    const calcVisible = async () => {
      await nextTick();

      const container = containerRef.value;
      const measure = measureRef.value;
      const overflowMeasure = overflowMeasureRef.value;
      const items = props.items;

      if (!items.length) {
        visibleCount.value = 0;
        return;
      }

      if (!container || !measure || !overflowMeasure) {
        needRecalculate = true;
        visibleCount.value = items.length;
        return;
      }

      const maxWidth = container.clientWidth;
      if (!maxWidth) {
        needRecalculate = true;
        visibleCount.value = items.length;
        return;
      }

      needRecalculate = false;
      const tagEls = measure.querySelectorAll('[data-measure-tag]');
      const overflowWidth = overflowMeasure.offsetWidth;
      let used = 0;
      let count = 0;

      for (let i = 0; i < tagEls.length; i++) {
        const tagWidth = (tagEls[i] as HTMLElement).offsetWidth;
        const gapBefore = i > 0 ? TAG_GAP : 0;
        const remaining = items.length - (i + 1);
        const reserve = remaining > 0 ? TAG_GAP + overflowWidth : 0;

        if (used + gapBefore + tagWidth + reserve > maxWidth) {
          break;
        }

        used += gapBefore + tagWidth;
        count++;
      }

      visibleCount.value = Math.min(items.length, Math.max(1, count));
    };

    const setupResizeObserver = () => {
      resizeObserver?.disconnect();

      if (containerRef.value && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          calcVisible();
        });
        resizeObserver.observe(containerRef.value);
      }
    };

    onMounted(() => {
      calcVisible();
      setupResizeObserver();
    });

    onActivated(() => {
      if (needRecalculate) {
        calcVisible();
        setupResizeObserver();
      }
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
    });

    watch(() => props.items, calcVisible, { deep: true });

    const renderTag = (text: string, key: string | number, measure = false) => (
      <div
        key={key}
        class={bem('readonly-tag')}
        {...(measure ? { 'data-measure-tag': true } : {})}
      >
        <Tag {...TAG_PROPS}>
          <span class={bem('readonly-tag-text')}>{text}</span>
        </Tag>
      </div>
    );

    return () => {
      const items = props.items;

      if (!items.length) {
        return (
          <div class={bem('readonly-tags', { placeholder: true })}>
            {props.placeholder}
          </div>
        );
      }

      const visible = items.slice(0, visibleCount.value);
      const overflow = items.length - visible.length;

      return (
        <>
          <div
            ref={measureRef}
            class={bem('readonly-tags-measure')}
            aria-hidden="true"
          >
            {items.map((item, index) =>
              renderTag(formatTagText(item), `m-${index}`, true),
            )}
            <div
              ref={overflowMeasureRef}
              class={bem('readonly-tag', ['overflow'])}
            >
              <Tag {...TAG_PROPS}>+{items.length}</Tag>
            </div>
          </div>
          <div ref={containerRef} class={bem('readonly-tags')}>
            {visible.map((item, index) =>
              renderTag(formatTagText(item), index),
            )}
            {overflow > 0 ? (
              <div class={bem('readonly-tag', ['overflow'])}>
                <Tag {...TAG_PROPS}>+{overflow}</Tag>
              </div>
            ) : null}
          </div>
        </>
      );
    };
  },
});
