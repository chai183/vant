import { defineComponent, type PropType } from 'vue';
import { useCustomFieldValue } from '@vant/use';
import { createNamespace, makeStringProp } from '../utils';
import Tag from '../tag';
import Highlight from '../highlight';
import type { FieldSelectPopupOption } from './types';
import { optionHasHighlightKeywords } from './types';
import { renderListOptionLabel } from './renderListOptionLabel';

const [, bem] = createNamespace('field-select-popup');

function isEmptyModelValue(v: unknown) {
  if (v === '' || v === undefined || v === null) {
    return true;
  }
  return Array.isArray(v) && v.length === 0;
}

function toValueArray(v: unknown): (string | number)[] {
  if (Array.isArray(v)) {
    return v as (string | number)[];
  }
  return [];
}

function resolveLabel(
  options: FieldSelectPopupOption[],
  val: string | number,
) {
  return options.find((o) => o.value === val)?.text ?? String(val);
}

function resolveOption(
  options: FieldSelectPopupOption[],
  val: string | number,
) {
  return options.find((o) => o.value === val);
}

function renderHighlightedSource(
  sourceString: string,
  keywords: string | string[] | undefined,
) {
  if (optionHasHighlightKeywords(keywords)) {
    return (
      <Highlight tag="span" sourceString={sourceString} keywords={keywords!} />
    );
  }
  return sourceString;
}

export default defineComponent({
  name: 'VanFieldSelectPopupInner',

  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<
        string | number | (string | number)[]
      >,
      default: '',
    },
    displayText: String,
    placeholder: makeStringProp('请选择'),
    multiple: Boolean,
    options: {
      type: Array as PropType<FieldSelectPopupOption[]>,
      default: () => [],
    },
    maxVisibleTags: {
      type: Number,
      default: 1,
    },
    showFullOptionLabel: Boolean,
  },

  setup(props) {
    useCustomFieldValue(() => props.modelValue);

    return () => {
      const empty = isEmptyModelValue(props.modelValue);
      if (empty) {
        return (
          <div class={bem('display', { placeholder: true })}>
            {props.placeholder}
          </div>
        );
      }

      if (props.multiple) {
        const values = toValueArray(props.modelValue);
        const max = Math.max(1, Number(props.maxVisibleTags) || 1);
        const visible = values.slice(0, max);
        const overflow = values.length - visible.length;

        const tagProps = {
          color: '#EEEEEE',
          textColor: '#333333',
          size: 'medium',
        } as const;

        return (
          <div class={bem('display', ['tags'])}>
            {visible.map((val) => {
              const opt = resolveOption(props.options, val);
              const label = resolveLabel(props.options, val);
              return (
                <div key={String(val)} class={bem('tag')}>
                  <Tag {...tagProps}>
                    <span class={bem('tag-text')}>
                      {renderHighlightedSource(
                        label,
                        opt?.highlightKeywords,
                      )}
                    </span>
                  </Tag>
                </div>
              );
            })}
            {overflow > 0 ? (
              <div class={bem('tag', ['overflow'])}>
                <Tag {...tagProps}>+{overflow}</Tag>
              </div>
            ) : null}
          </div>
        );
      }

      const selected = resolveOption(
        props.options,
        props.modelValue as string | number,
      );

      if (props.showFullOptionLabel && selected) {
        return (
          <div class={bem('display', ['value', 'full'])}>
            {renderListOptionLabel(selected)}
          </div>
        );
      }

      const shown = props.displayText ?? '';
      return (
        <div class={bem('display', ['value'])}>
          {renderHighlightedSource(shown, selected?.highlightKeywords)}
        </div>
      );
    };
  },
});
