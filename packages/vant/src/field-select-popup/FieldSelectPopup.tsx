import {
  defineComponent,
  type PropType,
  type ExtractPropTypes,
  type StyleValue,
  computed,
  ref,
} from 'vue';

// Utils
import {
  extend,
  truthProp,
  makeStringProp,
  createNamespace,
} from '../utils';

// Components
import Field from '../field';
import Popup from '../popup';
import Radio from '../radio';
import RadioGroup from '../radio-group';
import Checkbox from '../checkbox';
import CheckboxGroup from '../checkbox-group';
import { Icon } from '../icon';
import FieldSelectPopupInner from './FieldSelectPopupInner';
import Highlight from '../highlight';

// Types
import type { FieldSelectPopupOption } from './types';
import { optionHasHighlightKeywords } from './types';
import { renderListOptionLabel } from './renderListOptionLabel';

const [name, bem] = createNamespace('field-select-popup');

function toArray(v: unknown): (string | number)[] {
  if (Array.isArray(v)) {
    return v as (string | number)[];
  }
  if (v === '' || v === undefined || v === null) {
    return [];
  }
  return [v as string | number];
}

function hasValue(list: (string | number)[], val: string | number) {
  return list.some((x) => x === val);
}

function toggleValue(
  list: (string | number)[],
  val: string | number,
): (string | number)[] {
  if (hasValue(list, val)) {
    return list.filter((x) => x !== val);
  }
  return [...list, val];
}

function isEmptyModelValue(v: unknown) {
  if (v === '' || v === undefined || v === null) {
    return true;
  }
  return Array.isArray(v) && v.length === 0;
}

export const fieldSelectPopupProps = {
  options: {
    type: Array as PropType<FieldSelectPopupOption[]>,
    default: () => [],
  },
  /** 与 Form 提交一致的实际值：单选为标量，多选为数组 */
  modelValue: {
    type: [String, Number, Array] as PropType<
      string | number | (string | number)[]
    >,
    default: '',
  },
  /**
   * 单选时 `#input` 展示文案；不传则按 `modelValue` 在 `options` 里匹配 `text`。
   * 多选由内部 Tag 展示，可不传。
   */
  displayText: {
    type: String,
    default: undefined,
  },
  /** 未选中时 `#input` 内展示，样式与 Field 的 placeholder 一致 */
  placeholder: makeStringProp('请选择'),
  /** 弹层显示；不传则由组件内部维护，仍可通过 `v-model:show` 受控 */
  show: {
    type: Boolean,
    default: undefined,
  },
  multiple: Boolean,
  /**
   * `close`：标题 + 关闭，点选项立即提交并关闭（适合单选，或多选由父组件即时改 modelValue）。
   * `confirm`：取消 + 标题 + 确定，选项操作改 `draftValue`（适合多选确认）。
   * 未传入时：多选默认为 `confirm`，单选为 `close`。
   */
  toolbar: {
    type: String as PropType<'close' | 'confirm'>,
    default: undefined,
  },
  /** `toolbar` 为 `confirm` 时弹层内的临时多选，由父组件同步 */
  draftValue: {
    type: Array as PropType<(string | number)[]>,
    default: undefined,
  },
  layout: makeStringProp<'list' | 'grid'>('list'),
  columns: {
    type: Number,
    default: 3,
  },
  /**
   * 多选时 `#input` 单行展示的 Tag 个数（从左起保留），其余合并为一个 `+N` Tag。
   */
  maxVisibleTags: {
    type: Number,
    default: 1,
  },
  /**
   * 列表且单选时，输入区是否展示与弹层列表项相同的完整结构（主文案、subText、content、desc 及对应高亮）。
   * 宫格布局或多选下无效。
   */
  showFullOptionLabel: Boolean,
  title: String,
  cancelText: makeStringProp('取消'),
  confirmText: makeStringProp('确定'),
  teleport: makeStringProp('body'),
  round: truthProp,
  destroyOnClose: truthProp,
};

export type FieldSelectPopupProps = ExtractPropTypes<
  typeof fieldSelectPopupProps
>;

export default defineComponent({
  name,

  inheritAttrs: false,

  props: fieldSelectPopupProps,

  emits: [
    'update:show',
    'update:modelValue',
    'update:draftValue',
    'confirm',
    'cancel',
    'clickInput',
  ],

  setup(props, { emit, attrs }) {
    const passAttrs = attrs as Record<string, unknown>;
    const innerShow = ref(false);

    const isShowControlled = () => props.show !== undefined;

    const getShow = () =>
      isShowControlled() ? !!props.show : innerShow.value;

    const setShow = (v: boolean) => {
      if (!isShowControlled()) {
        innerShow.value = v;
      }
      emit('update:show', v);
    };

    const resolvedDisplayText = computed(() => {
      if (props.multiple) {
        return '';
      }
      if (isEmptyModelValue(props.modelValue)) {
        return '';
      }
      if (props.displayText !== undefined) {
        return props.displayText;
      }
      const hit = props.options.find((o) => o.value === props.modelValue);
      return hit?.text ?? String(props.modelValue ?? '');
    });

    const resolvedToolbar = computed(() => {
      if (!props.multiple) {
        return 'close' as const;
      }
      return props.toolbar ?? ('confirm' as const);
    });

    const listSelection = computed<(string | number)[]>(() => {
      if (props.multiple && resolvedToolbar.value === 'confirm') {
        return props.draftValue ?? toArray(props.modelValue);
      }
      return toArray(props.modelValue);
    });

    const isSelected = (val: string | number) => {
      if (!props.multiple) {
        return props.modelValue === val;
      }
      return hasValue(listSelection.value, val);
    };

    const onFieldClick = (e: MouseEvent) => {
      emit('clickInput', e);
      if (passAttrs.disabled) {
        return;
      }
      setShow(true);
    };

    const onPick = (val: string | number) => {
      if (!props.multiple) {
        emit('update:modelValue', val);
        setShow(false);
        return;
      }
      if (resolvedToolbar.value === 'confirm') {
        const next = toggleValue(listSelection.value, val);
        emit('update:draftValue', next);
        return;
      }
      emit('update:modelValue', toggleValue(toArray(props.modelValue), val));
    };

    const onClose = () => {
      setShow(false);
    };

    const onCancel = () => {
      emit('cancel');
      setShow(false);
    };

    const onConfirm = () => {
      emit('confirm');
      setShow(false);
    };

    const renderList = () => {
      const disabled = !!passAttrs.disabled;

      if (!props.multiple) {
        return (
          <div class={bem('body')}>
            <RadioGroup
              modelValue={props.modelValue}
              disabled={disabled}
              direction="vertical"
              onUpdate:modelValue={(val: unknown) => {
                emit('update:modelValue', val);
                setShow(false);
              }}
            >
              {props.options.map((opt) => (
                <Radio
                  key={String(opt.value)}
                  name={opt.value}
                  labelPosition="left"
                  disabled={disabled || !!opt.disabled}
                >
                  {{
                    default: () => renderListOptionLabel(opt),
                  }}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        );
      }

      return (
        <div class={bem('body')}>
          <CheckboxGroup
            modelValue={listSelection.value}
            disabled={disabled}
            direction="vertical"
            shape="square"
            onUpdate:modelValue={(val: unknown[]) => {
              if (resolvedToolbar.value === 'confirm') {
                emit('update:draftValue', val as (string | number)[]);
              } else {
                emit('update:modelValue', val as (string | number)[]);
              }
            }}
          >
            {props.options.map((opt) => (
              <Checkbox
                key={String(opt.value)}
                name={opt.value}
                labelPosition="left"
                disabled={disabled || !!opt.disabled}
              >
                {{
                  default: () => renderListOptionLabel(opt),
                }}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
      );
    };

    const renderGrid = () => {
      const fieldDisabled = !!passAttrs.disabled;
      const style = {
        gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
      };
      return (
        <div class={bem('body')}>
          <div class={bem('grid')} style={style}>
            {props.options.map((opt) => {
              const sel = isSelected(opt.value);
              const tileDisabled = fieldDisabled || !!opt.disabled;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  class={bem('tile', {
                    active: sel,
                    disabled: tileDisabled,
                  })}
                  disabled={tileDisabled}
                  onClick={() => {
                    if (!tileDisabled) {
                      onPick(opt.value);
                    }
                  }}
                >
                  {optionHasHighlightKeywords(opt.highlightKeywords) ? (
                    <Highlight
                      tag="span"
                      sourceString={opt.text}
                      keywords={opt.highlightKeywords!}
                    />
                  ) : (
                    opt.text
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    const renderHeader = () => {
      const { title } = props;
      if (resolvedToolbar.value === 'confirm') {
        return (
          <div class={bem('header')}>
            <button
              type="button"
              class={bem('header-btn', ['cancel'])}
              onClick={onCancel}
            >
              {props.cancelText}
            </button>
            <div class={bem('title')}>{title}</div>
            <button
              type="button"
              class={bem('header-btn', ['confirm'])}
              onClick={onConfirm}
            >
              {props.confirmText}
            </button>
          </div>
        );
      }
      return (
        <div class={bem('header')}>
          <div class={bem('title')}>{title}</div>
          <button type="button" class={bem('close')} onClick={onClose}>
            <Icon name="cross" size={18} />
          </button>
        </div>
      );
    };

    return () => {
      const fieldAttrs = extend({}, passAttrs) as Record<string, unknown>;
      const rootClass = fieldAttrs.class;
      const rootStyle = fieldAttrs.style;
      delete fieldAttrs.class;
      delete fieldAttrs.style;

      return (
        <div
          class={[bem(), rootClass].filter(Boolean)}
          style={rootStyle as StyleValue | undefined}
        >
          <Field
            {...fieldAttrs}
            placeholder={props.placeholder}
            readonly
            is-link
            clickable
            modelValue=""
            onClickInput={onFieldClick}
          >
            {{
              input: () => (
                <FieldSelectPopupInner
                  modelValue={props.modelValue}
                  displayText={resolvedDisplayText.value}
                  placeholder={props.placeholder}
                  multiple={props.multiple}
                  options={props.options}
                  maxVisibleTags={props.maxVisibleTags}
                  showFullOptionLabel={
                    !props.multiple &&
                    props.layout === 'list' &&
                    !!props.showFullOptionLabel
                  }
                />
              ),
            }}
          </Field>
          <Popup
            show={getShow()}
            onUpdate:show={(v: boolean) => setShow(v)}
            round={props.round}
            position="bottom"
            teleport={props.teleport}
            destroyOnClose={props.destroyOnClose}
            safeAreaInsetBottom
          >
            {renderHeader()}
            {props.layout === 'grid' ? renderGrid() : renderList()}
          </Popup>
        </div>
      );
    };
  },
});
