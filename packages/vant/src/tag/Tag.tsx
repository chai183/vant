import {
  Transition,
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';
import {
  truthProp,
  makeStringProp,
  createNamespace,
  HAPTICS_FEEDBACK,
} from '../utils';
import { Icon } from '../icon';
import { resolveStampFrameUrl } from './stamp-presets';
import { getTagCurrencyPreset } from './currency-presets';
import type { TagType, TagSize, TagPreset, TagStampType } from './types';

const [name, bem] = createNamespace('tag');

/** 单行最多字数；超过则两行，首行固定 4 字 */
const STAMP_SINGLE_LINE_MAX = 5;
/** 换行时第一行字数 */
const STAMP_FIRST_LINE_WHEN_WRAP = 4;

/** 插槽内容转纯文本（用于印章分行等） */
function getSlotText(content: unknown): string {
  if (content == null || typeof content === 'boolean') {
    return '';
  }
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }
  if (Array.isArray(content)) {
    return content.map(getSlotText).join('');
  }
  if (typeof content === 'object') {
    const node = content as { children?: unknown };
    if (node.children != null) {
      return getSlotText(node.children);
    }
  }
  return '';
}

/** 印章文案 → 行数组 + 字号修饰 class 后缀 */
function formatStampLines(raw: string) {
  const chars = [...raw.trim()];
  const len = chars.length;
  if (len === 0) {
    return { lines: [] as string[], modifier: '' };
  }
  if (len <= STAMP_SINGLE_LINE_MAX) {
    return {
      lines: [chars.join('')],
      modifier: getStampSingleLineModifier(len),
    };
  }
  const secondLen = len - STAMP_FIRST_LINE_WHEN_WRAP;
  return {
    lines: [
      chars.slice(0, STAMP_FIRST_LINE_WHEN_WRAP).join(''),
      chars.slice(STAMP_FIRST_LINE_WHEN_WRAP).join(''),
    ],
    modifier: getStampWrapModifier(secondLen),
  };
}

/** ≤5 字单行时的修饰后缀 */
function getStampSingleLineModifier(length: number) {
  if (length <= 2) {
    return 'short';
  }
  if (length === 3) {
    return 'len-3';
  }
  if (length === 4) {
    return 'len-4';
  }
  return 'len-5';
}

/** 两行时按第二行字数缩小，保证 4+2、4+3 等业务长度落在圈内 */
function getStampWrapModifier(secondLineLen: number) {
  if (secondLineLen <= 2) {
    return 'wrap-s';
  }
  if (secondLineLen === 3) {
    return 'wrap-m';
  }
  if (secondLineLen <= 5) {
    return 'wrap-l';
  }
  return 'wrap-xl';
}

export const tagProps = {
  size: String as PropType<TagSize>,
  /** 角标样式：高度 24px，圆角 0 8px 0 8px，左右内边距 8px */
  mark: Boolean,
  show: truthProp,
  type: makeStringProp<TagType>('default'),
  color: String,
  /** 浅色标签：浅底 + 1px 描边，文字/边框色与 type 对应实心背景色一致 */
  plain: Boolean,
  round: Boolean,
  textColor: String,
  closeable: Boolean,
  /** 左侧图标名称，等同 Icon 的 name；也可用 icon 插槽自定义 */
  icon: String,
  /** 币种标签：灰底 #f5f5f5、文字 #333333，常配合 icon 使用 */
  currency: Boolean,
  /**
   * 币种预制：`currency=true` 时生效，为三字母等 ISO 代码（见 `currency-presets.json`）。
   * 未传默认插槽时展示中文全称；占位图标取自 JSON `defaultIcon`（可逐项覆盖 `icon`）。
   */
  currencyCode: String,
  /**
   * 预制样式，文案由默认插槽传入。
   * 理财风险：risk-high / risk-medium-high / risk-medium / risk-low /
   * risk-medium-low / risk-new / risk-selected
   * 产品类型：product-bill / product-finance / product-deposit / product-payroll
   */
  preset: String as PropType<TagPreset>,
  /** 印章标签类型：success / fail / wait / void，尺寸 64×64，颜色见对应 CSS 变量 */
  stampType: String as PropType<TagStampType>,
};

export type TagProps = ExtractPropTypes<typeof tagProps>;

export default defineComponent({
  name,

  props: tagProps,

  emits: ['close'],

  setup(props, { slots, emit }) {
    const onClose = (event: MouseEvent) => {
      event.stopPropagation();
      emit('close', event);
    };

    /** 是否印章模式 */
    const isStamp = () => Boolean(props.stampType);
    /** 可走 type 主题色 class（非预制/非币种/非印章） */
    const useThemeClass = () => !props.preset && !props.currency && !isStamp();

    /** color / text-color / plain 定制的内联样式 */
    const getStyle = (): CSSProperties | undefined => {
      if (props.preset || props.currency || isStamp()) {
        if (!props.color && !props.textColor) {
          return undefined;
        }
      }

      if (props.plain) {
        if (props.color || props.textColor) {
          return {
            color: props.textColor || props.color,
            borderColor: props.color,
          };
        }
        return undefined;
      }

      if (props.color || props.textColor) {
        return {
          color: props.textColor,
          background: props.color,
        };
      }

      return undefined;
    };

    /** 印章蒙版：单行/换行两套 SVG */
    const getStampFrameStyle = (lineCount: number): CSSProperties => {
      const url = resolveStampFrameUrl(lineCount);
      return {
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
      };
    };

    /** 印章 DOM：外框 + 文案（或 stamp 插槽整块自定义） */
    const renderStamp = () => {
      if (slots.stamp) {
        return <span class={bem('stamp')}>{slots.stamp()}</span>;
      }

      if (!props.stampType) {
        return;
      }

      const { lines, modifier } = formatStampLines(
        getSlotText(slots.default?.()),
      );

      return (
        <span class={bem('stamp')}>
          <span
            class={bem('stamp-frame')}
            style={getStampFrameStyle(lines.length)}
            aria-hidden="true"
          />
          {lines.length > 0 ? (
            <span class={['van-chuangcuhei-font', bem('stamp-text', modifier)]}>
              {lines.map((line, i) => (
                <span key={i} class={bem('stamp-text-line')}>
                  {line}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      );
    };

    /** 普通标签：图标 + 文案；印章走 renderStamp */
    const renderTag = () => {
      const { type, mark, plain, round, size, closeable, currency, preset } =
        props;
      const stamp = isStamp();

      const curPreset =
        !stamp && currency && props.currencyCode
          ? getTagCurrencyPreset(props.currencyCode)
          : null;

      const slotPlainText = stamp ? '' : getSlotText(slots.default?.());

      const iconFromPresetOrProp = stamp
        ? ''
        : slots.icon
          ? ''
          : (props.icon ?? curPreset?.icon ?? '');

      /** 左侧：icon 插槽 > Vant Icon（含币种预制图片 URL） */
      const renderLeadingIcon = () => {
        if (stamp) {
          return;
        }
        if (slots.icon) {
          return <span class={bem('icon')}>{slots.icon()}</span>;
        }
        if (iconFromPresetOrProp) {
          return <Icon name={iconFromPresetOrProp} class={bem('icon')} />;
        }
      };

      /** 文案：有插槽用插槽，否则币种预制中文名 */
      const renderDefaultSlot = () => {
        if (stamp) {
          return;
        }
        if (slotPlainText !== '') {
          return slots.default?.();
        }
        if (curPreset) {
          return curPreset.labelZh;
        }
        return slots.default?.();
      };

      const classes: Record<string, unknown> = {
        mark: mark && !stamp,
        plain: plain && useThemeClass(),
        round,
        currency: currency && !stamp,
        stamp,
      };
      /**   几种模式样式的优先级：印章 > 预制 > 普通主题 */
      if (stamp && props.stampType) {
        classes[`stamp-${props.stampType}`] = props.stampType;
      } else if (preset) {
        classes[`preset-${preset}`] = preset;
      } else if (useThemeClass() && type) {
        classes[type] = type;
      }

      if (size) {
        classes[size] = size;
      }

      const CloseIcon = closeable && (
        <Icon
          name="cross"
          class={[bem('close'), HAPTICS_FEEDBACK]}
          onClick={onClose}
        />
      );

      return (
        <span style={getStyle()} class={bem([classes])}>
          {stamp ? renderStamp() : renderLeadingIcon()}
          {renderDefaultSlot()}
          {CloseIcon}
        </span>
      );
    };

    return () => (
      <Transition name={props.closeable ? 'van-fade' : undefined}>
        {props.show ? renderTag() : null}
      </Transition>
    );
  },
});
