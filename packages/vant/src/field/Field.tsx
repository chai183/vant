import {
  ref,
  watch,
  provide,
  computed,
  nextTick,
  reactive,
  onMounted,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
  type HTMLAttributes,
  type CSSProperties,
} from 'vue';

// Utils
import {
  isDef,
  extend,
  addUnit,
  toArray,
  FORM_KEY,
  numericProp,
  unknownProp,
  resetScroll,
  formatNumber,
  preventDefault,
  truthProp,
  makeStringProp,
  makeNumericProp,
  createNamespace,
  type ComponentInstance,
  clamp,
} from '../utils';
import {
  cutString,
  runSyncRule,
  endComposing,
  mapInputType,
  isEmptyValue,
  startComposing,
  getRuleMessage,
  resizeTextarea,
  getStringLength,
  runRuleValidator,
  limitMoneyDigits,
  getMoneyUnitLabel,
  moneyStringToChineseUppercase,
} from './utils';
import { getBuiltinGroupedDisplayConfig } from './grouped-display';
import { cellSharedProps } from '../cell/Cell';

// Composables
import {
  useParent,
  useEventListener,
  CUSTOM_FIELD_INJECTION_KEY,
} from '@vant/use';
import { useId } from '../composables/use-id';
import { useExpose } from '../composables/use-expose';

// Components
import { Icon } from '../icon';
import { Cell } from '../cell';
import { Popover } from '../popover';
import TextEllipsis from '../text-ellipsis/TextEllipsis';
import FieldReadonlyTags from './FieldReadonlyTags';

// Types
import type {
  FieldRule,
  FieldType,
  FieldExpose,
  FieldTextAlign,
  FieldClearTrigger,
  FieldFormatTrigger,
  FieldValidateError,
  FieldAutosizeConfig,
  FieldValidationStatus,
  FieldValidateTrigger,
  FieldFormSharedProps,
  FieldEnterKeyHint,
  FieldGroupedDisplayConfig,
} from './types';
import type { PopoverProps } from '../popover';

const [name, bem, t] = createNamespace('field');

// provide to Search component to inherit
export const fieldSharedProps = {
  id: String,
  name: String,
  leftIcon: String,
  rightIcon: String,
  showRightIconDivider: {
    type: Boolean,
    default: false,
  },
  autofocus: Boolean,
  clearable: Boolean,
  maxlength: numericProp,
  max: Number,
  min: Number,
  formatter: Function as PropType<(value: string) => string>,
  clearIcon: makeStringProp('clear'),
  modelValue: {
    type: [Number, String, Array] as PropType<string | number | unknown[]>,
    default: '',
  },
  inputAlign: String as PropType<FieldTextAlign>,
  placeholder: String,
  autocomplete: String,
  autocapitalize: String,
  autocorrect: String,
  errorMessage: String,
  inputComment: String,
  enterkeyhint: String as PropType<FieldEnterKeyHint>,
  clearTrigger: makeStringProp<FieldClearTrigger>('focus'),
  formatTrigger: makeStringProp<FieldFormatTrigger>('onChange'),
  spellcheck: {
    type: Boolean,
    default: null,
  },
  error: {
    type: Boolean,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: null,
  },
  inputmode: String as PropType<HTMLAttributes['inputmode']>,
  /** 是否为输入区域添加外边框样式，常用于 RangeInput 等嵌套场景 */
  inputBorder: Boolean,
};

export const fieldProps = extend({}, cellSharedProps, fieldSharedProps, {
  rows: numericProp,
  type: makeStringProp<FieldType>('text'),
  rules: Array as PropType<FieldRule[]>,
  autosize: [Boolean, Object] as PropType<boolean | FieldAutosizeConfig>,
  labelWidth: numericProp,
  labelClass: unknownProp,
  inputClass: unknownProp,
  inputStyle: null as unknown as PropType<string | CSSProperties>,
  bodyClass: unknownProp,
  bodyStyle: null as unknown as PropType<string | CSSProperties>,
  labelTooltip: String,
  labelTooltipPopoverProps: Object as PropType<Partial<PopoverProps>>,
  labelComment: String,
  readonlyEllipsis: truthProp,
  readonlyEllipsisRows: makeNumericProp(1),
  groupedDisplay: Object as PropType<FieldGroupedDisplayConfig | undefined>,
  labelAlign: String as PropType<FieldTextAlign>,
  showWordLimit: Boolean,
  showMoneyUppercase: Boolean,
  showMoneyUnit: Boolean,
  moneyUppercaseLabel: String,
  errorMessageAlign: String as PropType<FieldTextAlign>,
  errorMessageInfo: Boolean,
  labelActionText: String,
  showLabelAction: {
    type: Boolean,
    default: null,
  },
  colon: {
    type: Boolean,
    default: null,
  },
  labelCollapsible: Boolean,
  labelExpanded: {
    type: Boolean,
    default: true,
  },
});

export type FieldProps = ExtractPropTypes<typeof fieldProps>;

export default defineComponent({
  name,

  props: fieldProps,

  emits: [
    'blur',
    'focus',
    'clear',
    'keypress',
    'clickInput',
    'endValidate',
    'startValidate',
    'clickLeftIcon',
    'clickRightIcon',
    'update:modelValue',
    'update:labelExpanded',
    'clickLabelAction',
  ],

  setup(props, { emit, slots }) {
    const id = useId();
    const state = reactive({
      status: 'unvalidated' as FieldValidationStatus,
      focused: false,
      validateMessage: '',
    });

    const inputRef = ref<HTMLInputElement>();
    const clearIconRef = ref<ComponentInstance>();
    const customValue = ref<() => unknown>();
    const labelExpanded = ref(props.labelExpanded);

    const { parent: form } = useParent(FORM_KEY);

    watch(
      () => props.labelExpanded,
      (value) => {
        labelExpanded.value = value;
      },
    );

    const isLabelCollapsible = () =>
      props.labelCollapsible && getProp('labelAlign') === 'top';

    const toggleLabelExpanded = (event?: MouseEvent) => {
      if (!isLabelCollapsible()) {
        return;
      }
      if (event) {
        preventDefault(event);
      }
      labelExpanded.value = !labelExpanded.value;
      emit('update:labelExpanded', labelExpanded.value);
    };

    const getModelValue = () => String(props.modelValue ?? '');

    const getProp = <T extends FieldFormSharedProps>(key: T) => {
      if (isDef(props[key])) {
        return props[key];
      }
      if (form && isDef(form.props[key])) {
        return form.props[key];
      }
    };

    const resolvedGroupedDisplay = computed(
      () => props.groupedDisplay ?? getBuiltinGroupedDisplayConfig(props.type),
    );

    const showClear = computed(() => {
      const readonly = getProp('readonly');

      if (props.clearable && !readonly) {
        const hasValue = Array.isArray(props.modelValue)
          ? props.modelValue.length > 0
          : getModelValue() !== '';
        const trigger =
          props.clearTrigger === 'always' ||
          (props.clearTrigger === 'focus' && state.focused);

        return hasValue && trigger;
      }
      return false;
    });

    const formValue = computed(() => {
      if (customValue.value && slots.input) {
        return customValue.value();
      }
      return props.modelValue;
    });

    const showRequiredMark = computed(() => {
      const required = getProp('required');
      if (required === 'auto') {
        return props.rules?.some((rule: FieldRule) => rule.required);
      }
      return required;
    });

    const runRules = (rules: FieldRule[]) =>
      rules.reduce(
        (promise, rule) =>
          promise.then(() => {
            if (state.status === 'failed') {
              return;
            }

            let { value } = formValue;

            if (rule.formatter) {
              value = rule.formatter(value, rule);
            }

            if (!runSyncRule(value, rule)) {
              state.status = 'failed';
              state.validateMessage = getRuleMessage(value, rule);
              return;
            }

            if (rule.validator) {
              if (isEmptyValue(value) && rule.validateEmpty === false) {
                return;
              }

              return runRuleValidator(value, rule).then((result) => {
                if (result && typeof result === 'string') {
                  state.status = 'failed';
                  state.validateMessage = result;
                } else if (result === false) {
                  state.status = 'failed';
                  state.validateMessage = getRuleMessage(value, rule);
                }
              });
            }
          }),
        Promise.resolve(),
      );

    const resetValidation = () => {
      state.status = 'unvalidated';
      state.validateMessage = '';
    };

    const endValidate = () =>
      emit('endValidate', {
        status: state.status,
        message: state.validateMessage,
      });

    const validate = (rules = props.rules) =>
      new Promise<FieldValidateError | void>((resolve) => {
        resetValidation();
        if (rules) {
          emit('startValidate');
          runRules(rules).then(() => {
            if (state.status === 'failed') {
              resolve({
                name: props.name,
                message: state.validateMessage,
              });
              endValidate();
            } else {
              state.status = 'passed';
              resolve();
              endValidate();
            }
          });
        } else {
          resolve();
        }
      });

    const validateWithTrigger = (trigger: FieldValidateTrigger) => {
      if (form && props.rules) {
        const { validateTrigger } = form.props;
        const defaultTrigger = toArray(validateTrigger).includes(trigger);
        const rules = props.rules.filter((rule) => {
          if (rule.trigger) {
            return toArray(rule.trigger).includes(trigger);
          }
          return defaultTrigger;
        });

        if (rules.length) {
          validate(rules);
        }
      }
    };

    // native maxlength have incorrect line-break counting
    // see: https://github.com/vant-ui/vant/issues/5033
    const limitValueLength = (value: string) => {
      const { maxlength } = props;
      if (isDef(maxlength) && getStringLength(value) > +maxlength) {
        const modelValue = getModelValue();
        if (modelValue && getStringLength(modelValue) === +maxlength) {
          return modelValue;
        }
        // Remove redundant interpolated values,
        // make it consistent with the native input maxlength behavior.
        const selectionEnd = inputRef.value?.selectionEnd;
        if (state.focused && selectionEnd) {
          const valueArr = [...value];
          const exceededLength = valueArr.length - +maxlength;
          valueArr.splice(selectionEnd - exceededLength, exceededLength);
          return valueArr.join('');
        }
        return cutString(value, +maxlength);
      }
      return value;
    };

    // 处理输入值：截断、数字/金额规范化、formatter、千分位展示，并同步 DOM 与 v-model（含光标修正）
    const updateValue = (
      value: string,
      // formatter 等逻辑依赖触发时机（如 onChange / onBlur）
      trigger: FieldFormatTrigger = 'onChange',
    ) => {
      const gd = resolvedGroupedDisplay.value;
      // console.log('value', value);
      // 聚焦时把「展示串上的选区」映射为 v-model 字符下标，便于插入分组符后还原光标
      let groupedDisplayRawSel:
        | { start: number; end: number }
        | undefined;
      if (gd && inputRef.value && state.focused) {
        const { selectionStart, selectionEnd } = inputRef.value;
        if (isDef(selectionStart) && isDef(selectionEnd)) {
          groupedDisplayRawSel = {
            start: value
              .slice(0, selectionStart)
              .replace(gd.stripDisplayRegex, '')
              .length,
            end: value
              .slice(0, selectionEnd)
              .replace(gd.stripDisplayRegex, '')
              .length,
          };
        }
      }

      if (gd?.parseDisplayToModel) {
        value = gd.parseDisplayToModel(value);
      }

      let typeCapDiffLen = 0;
      if (gd?.normalizeModelValue) {
        const out = gd.normalizeModelValue(value, {
          maxlength: isDef(props.maxlength) ? +props.maxlength : undefined,
        });
        value = out.value;
        typeCapDiffLen = out.capDiffLen ?? 0;
      }

      const originalValue = value;
      value = gd?.skipLimitValueLength ? value : limitValueLength(value);
      // 超过 maxlength 被截断时记录截掉的长度，用于修正光标位置
      // https://github.com/youzan/vant/issues/11289
      const limitDiffLen =
        typeCapDiffLen > 0
          ? typeCapDiffLen
          : originalValue.length - value.length;

      // 数字类：过滤非法字符；失焦时再按 min/max 钳位，避免输入过程中被强行改写
      // https://github.com/youzan/vant/issues/13058
      if (props.type === 'number' || props.type === 'digit' || props.type === 'money') {
        const allowDot = props.type !== 'digit';
        const allowMinus = props.type === 'number';
        value = formatNumber(value, allowDot, allowMinus);

        if (
          trigger === 'onBlur' &&
          value !== '' &&
          (props.min !== undefined || props.max !== undefined)
        ) {
          const adjustedValue = clamp(
            +value,
            props.min ?? -Infinity,
            props.max ?? Infinity,
          );

          if (+value !== adjustedValue) {
            value = adjustedValue.toString();
          }
        }
      }

      // formatter 可能改变光标左侧长度，聚焦时记录差值用于 setSelectionRange
      let formatterDiffLen = 0;
      if (props.formatter && trigger === props.formatTrigger) {
        const { formatter, maxlength } = props;
        value = formatter(value);
        // 格式化后可能超过 maxlength，需再截断
        if (isDef(maxlength) && getStringLength(value) > +maxlength) {
          value = cutString(value, +maxlength);
        }
        if (inputRef.value && state.focused) {
          const { selectionEnd } = inputRef.value;
          // 光标前的原始子串
          const bcoVal = cutString(originalValue, selectionEnd!);
          // 对该子串格式化后的长度变化，用于修正光标
          formatterDiffLen = formatter(bcoVal).length - bcoVal.length;
        }
      }

      if (props.type === 'money') {
        value = limitMoneyDigits(value);
      }

      // v-model 存无分隔符值；展示由 groupedDisplay（内置或传入）决定
      const displayValue = gd ? gd.formatDisplay(value) : value;

      if (inputRef.value && inputRef.value.value !== displayValue) {
        // 聚焦时改写 value 会丢选区，需按规则重算 selectionStart/End
        if (state.focused) {
          let { selectionStart, selectionEnd } = inputRef.value;
          inputRef.value.value = displayValue;

          if (isDef(selectionStart) && isDef(selectionEnd)) {
            const rangeLen = gd ? displayValue.length : value.length;

            if (
              gd &&
              displayValue !== value &&
              groupedDisplayRawSel
            ) {
              const cs = Math.min(groupedDisplayRawSel.start, value.length);
              const ce = Math.min(groupedDisplayRawSel.end, value.length);
              selectionStart = gd.rawOffsetToDisplayIndex(displayValue, cs);
              selectionEnd = gd.rawOffsetToDisplayIndex(displayValue, ce);
            } else if (limitDiffLen) {
              selectionStart -= limitDiffLen;
              selectionEnd -= limitDiffLen;
            } else if (formatterDiffLen) {
              selectionStart += formatterDiffLen;
              selectionEnd += formatterDiffLen;
            }

            inputRef.value.setSelectionRange(
              Math.min(selectionStart, rangeLen),
              Math.min(selectionEnd, rangeLen),
            );
          }
        } else {
          inputRef.value.value = displayValue;
        }
      }

      // 内部处理后的值与 v-model 不一致时再同步，避免多余触发
      if (value !== props.modelValue) {
        emit('update:modelValue', value);
      }
    };

    const onInput = (event: Event) => {
      // skip update value when composing
      if (!event.target!.composing) {
        updateValue((event.target as HTMLInputElement).value);
      }
    };

    const blur = () => inputRef.value?.blur();
    const focus = () => inputRef.value?.focus();

    const adjustTextareaSize = () => {
      const input = inputRef.value;
      if (props.type === 'textarea' && props.autosize && input) {
        resizeTextarea(input, props.autosize);
      }
    };

    const onFocus = (event: Event) => {
      state.focused = true;
      emit('focus', event);
      nextTick(adjustTextareaSize);

      // readonly not work in legacy mobile safari
      if (getProp('readonly')) {
        blur();
      }
    };

    const onBlur = (event: Event) => {
      state.focused = false;
      updateValue(getModelValue(), 'onBlur');
      emit('blur', event);

      if (getProp('readonly')) {
        return;
      }

      validateWithTrigger('onBlur');
      nextTick(adjustTextareaSize);
      resetScroll();
    };

    const onClickInput = (event: MouseEvent) => emit('clickInput', event);

    const onClickLeftIcon = (event: MouseEvent) => emit('clickLeftIcon', event);

    const onClickRightIcon = (event: MouseEvent) =>
      emit('clickRightIcon', event);

    const onClear = (event: TouchEvent) => {
      preventDefault(event);
      emit('update:modelValue', '');
      emit('clear', event);
    };

    const showError = computed(() => {
      if (typeof props.error === 'boolean') {
        return props.error;
      }
      if (form && form.props.showError && state.status === 'failed') {
        return true;
      }
    });

    const labelStyle = computed(() => {
      const labelWidth = getProp('labelWidth');
      const labelAlign = getProp('labelAlign');
      if (labelWidth && labelAlign !== 'top') {
        return { width: addUnit(labelWidth) };
      }
    });

    const onKeypress = (event: KeyboardEvent) => {
      const ENTER_CODE = 13;

      if (event.keyCode === ENTER_CODE) {
        const submitOnEnter = form && form.props.submitOnEnter;
        if (!submitOnEnter && props.type !== 'textarea') {
          preventDefault(event);
        }

        // trigger blur after click keyboard search button
        if (props.type === 'search') {
          blur();
        }
      }

      emit('keypress', event);
    };

    const getInputId = () => props.id || `${id}-input`;

    const getValidationStatus = () => state.status;

    const isReadonlyArrayValue = () => Array.isArray(props.modelValue);

    const showReadonlyDisplay = () =>
      getProp('readonly') &&
      !slots.input &&
      (props.readonlyEllipsis || isReadonlyArrayValue());

    const getReadonlyEllipsisRows = () => {
      if (props.type === 'textarea' && props.rows !== undefined) {
        return +props.rows;
      }
      return +(props.readonlyEllipsisRows ?? 1);
    };

    const renderReadonlyArrayInput = () => {
      const items = (props.modelValue as unknown[]) ?? [];
      const isPlaceholder = items.length === 0;

      const controlClass = bem('control', [
        getProp('inputAlign'),
        {
          error: showError.value,
          custom: true,
        },
      ]);

      const wrapperProps = {
        id: getInputId(),
        class: [
          controlClass,
          props.inputClass,
          bem('readonly-ellipsis', {
            placeholder: isPlaceholder,
            tags: true,
          }),
        ],
        style: props.inputStyle,
        onClick: onClickInput,
      };

      return (
        <div {...wrapperProps}>
          <FieldReadonlyTags items={items} placeholder={props.placeholder} />
        </div>
      );
    };

    const renderReadonlyEllipsisInput = () => {
      if (isReadonlyArrayValue()) {
        return renderReadonlyArrayInput();
      }

      const value = getModelValue();
      const displayContent = value || props.placeholder || '';
      const isPlaceholder = !value;

      const controlClass = bem('control', [
        getProp('inputAlign'),
        {
          error: showError.value,
          custom: true,
        },
      ]);

      const wrapperProps = {
        id: getInputId(),
        class: [
          controlClass,
          props.inputClass,
          bem('readonly-ellipsis', { placeholder: isPlaceholder }),
        ],
        style: props.inputStyle,
        onClick: onClickInput,
      };

      return (
        <div {...wrapperProps}>
          <TextEllipsis rows={getReadonlyEllipsisRows()} content={displayContent} />
        </div>
      );
    };

    const renderInput = () => {
      const controlClass = bem('control', [
        getProp('inputAlign'),
        {
          error: showError.value,
          custom: !!slots.input,
          'min-height': props.type === 'textarea' && !props.autosize,
        },
      ]);

      if (slots.input) {
        return (
          <div
            class={[controlClass, props.inputClass]}
            style={props.inputStyle}
            onClick={onClickInput}
          >
            {slots.input()}
          </div>
        );
      }

      if (showReadonlyDisplay()) {
        return renderReadonlyEllipsisInput();
      }

      const inputAttrs = {
        id: getInputId(),
        ref: inputRef,
        name: props.name,
        rows: props.rows !== undefined ? +props.rows : undefined,
        class: [controlClass, props.inputClass],
        style: props.inputStyle,
        disabled: getProp('disabled'),
        readonly: getProp('readonly'),
        autofocus: props.autofocus,
        placeholder: props.placeholder,
        autocomplete: props.autocomplete,
        autocapitalize: props.autocapitalize,
        autocorrect: props.autocorrect,
        enterkeyhint: props.enterkeyhint,
        spellcheck: props.spellcheck,
        'aria-labelledby': props.label ? `${id}-label` : undefined,
        'data-allow-mismatch': 'attribute',
        onBlur,
        onFocus,
        onInput,
        onClick: onClickInput,
        onChange: endComposing,
        onKeypress,
        onCompositionend: endComposing,
        onCompositionstart: startComposing,
      };

      if (props.type === 'textarea') {
        return <textarea {...inputAttrs} inputmode={props.inputmode} />;
      }
      
      return (
        <input {...mapInputType(props.type, props.inputmode)} {...inputAttrs} />
      );
    };

    const renderLeftIcon = () => {
      const leftIconSlot = slots['left-icon'];

      if (props.leftIcon || leftIconSlot) {
        return (
          <div class={bem('left-icon')} onClick={onClickLeftIcon}>
            {leftIconSlot ? (
              leftIconSlot()
            ) : (
              <Icon name={props.leftIcon} classPrefix={props.iconPrefix} />
            )}
          </div>
        );
      }
    };

    const renderRightIcon = () => {
      const rightIconSlot = slots['right-icon'];

      if (props.rightIcon || rightIconSlot) {
        const icon = (
          <div key="right-icon" class={bem('right-icon')} onClick={onClickRightIcon}>
            {rightIconSlot ? (
              rightIconSlot()
            ) : (
              <Icon name={props.rightIcon} classPrefix={props.iconPrefix} />
            )}
          </div>
        );

        if (props.showRightIconDivider) {
          return [
            <div key="right-icon-divider" class={bem('right-icon-divider')} />,
            icon,
          ];
        }

        return icon;
      }
    };

    const renderWordLimit = () => {
      if (props.showWordLimit && props.maxlength) {
        const count = getStringLength(getModelValue());
        return (
          <div class={bem('word-limit')}>
            <span class={bem('word-num')}>{count}</span>/{props.maxlength}
          </div>
        );
      }
    };

    const renderMessage = () => {
      if (form && form.props.showErrorMessage === false) {
        return;
      }

      const message = props.errorMessage || state.validateMessage;

      if (message) {
        const slot = slots['error-message'];
        const errorMessageAlign = getProp('errorMessageAlign');
        return (
          <div
            class={bem('error-message', [
              errorMessageAlign,
              { info: props.errorMessageInfo },
            ])}
          >
            {slot ? slot({ message }) : message}
          </div>
        );
      }
    };

    const renderLabelTooltip = () => {
      const tooltipSlot = slots['label-tooltip'];
      if (!tooltipSlot && !props.labelTooltip) {
        return;
      }

      const renderTooltipContent = () => {
        if (tooltipSlot) {
          return tooltipSlot();
        }
        if (props.labelTooltip) {
          return (
            <div class={bem('label-tooltip-content')}>{props.labelTooltip}</div>
          );
        }
      };

      return (
        <span class={bem('label-tooltip')}>
          <Popover
            {...extend(
              {
                placement: 'top',
                theme: 'dark',
                iconPrefix: props.iconPrefix,
              },
              props.labelTooltipPopoverProps,
            )}
            v-slots={{
              reference: () => (
                <Icon
                  size={14}
                  name="info-o"
                  classPrefix={props.iconPrefix}
                  class={bem('label-tooltip-icon')}
                />
              ),
              default: renderTooltipContent,
            }}
          />
        </span>
      );
    };

    const renderCellLabel = () => {
      const commentSlot = slots['label-comment'];
      if (commentSlot) {
        return commentSlot();
      }
      if (props.labelComment) {
        return props.labelComment;
      }
    };

    const renderLabel = () => {
      const labelWidth = getProp('labelWidth');
      const labelAlign = getProp('labelAlign');
      const colon = getProp('colon') ? ':' : '';
      const tooltip = renderLabelTooltip();
      const collapsible = isLabelCollapsible();

      if (slots.label) {
        if (!tooltip) {
          return [slots.label(), colon];
        }
        return (
          <span class={bem('label-wrap')}>
            {slots.label()}
            {colon}
            {tooltip}
          </span>
        );
      }
      if (props.label) {
        const labelEl = (
          <label
            id={`${id}-label`}
            for={slots.input ? undefined : getInputId()}
            data-allow-mismatch="attribute"
            onClick={
              collapsible
                ? undefined
                : (event: MouseEvent) => {
                    // https://github.com/youzan/vant/issues/11831
                    preventDefault(event);
                    focus();
                  }
            }
            style={
              labelAlign === 'top' && labelWidth
                ? { width: addUnit(labelWidth) }
                : undefined
            }
          >
            {props.label + colon}
          </label>
        );

        if (!tooltip) {
          return labelEl;
        }

        return (
          <span class={bem('label-wrap')}>
            {labelEl}
            {tooltip}
          </span>
        );
      }
    };

    const renderLabelAction = () => {
      if (getProp('labelAlign') !== 'top') {
        return;
      }
      if (props.showLabelAction === false) {
        return;
      }
      const actionSlot = slots['label-action'];
      if (actionSlot) {
        return actionSlot();
      }
      if (props.labelActionText) {
        return (
          <button
            type="button"
            class={bem('label-action')}
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              preventDefault(event);
              emit('clickLabelAction', event);
            }}
          >
            {props.labelActionText}
          </button>
        );
      }
    };

    const renderLabelCollapseControl = () => {
      const text = labelExpanded.value
        ? t('labelCollapse') || '收起'
        : t('labelExpand') || '展开';

      return (
        <span class={bem('label-collapse')}>
          <span class={bem('label-collapse-text')}>{text}</span>
          <Icon
            name="arrow-down"
            size={12}
            class={bem('label-collapse-icon', {
              expanded: labelExpanded.value,
            })}
            classPrefix={props.iconPrefix}
          />
        </span>
      );
    };

    const renderTopLabelRow = () => {
      const Label = renderLabel();
      const action = renderLabelAction();
      if (!action) {
        return Label;
      }
      if (!Label) {
        return (
          <div class={bem('label-header', { 'end-only': true })}>{action}</div>
        );
      }
      return (
        <div class={bem('label-header')}>
          <div class={bem('label-header-main')}>{Label}</div>
          {action}
        </div>
      );
    };

    const renderMoneyUnit = () => {
      if (!props.showMoneyUnit || props.type !== 'money') {
        return;
      }

      const label = getMoneyUnitLabel(getModelValue());
      if (!label) {
        return;
      }

      return (
        <div class={bem('money-unit')}>
          <div class={bem('money-unit-box')}>
            <span class={bem('money-unit-text')}>{label}</span>
            <span class={bem('money-unit-caret')}>
              <svg
                viewBox="0 0 100 10"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 1 H35 L50 9 L65 1 H100"
                  stroke="currentColor"
                  stroke-width="1"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </span>
          </div>
        </div>
      );
    };

    const renderMoneyUppercase = () => {
      if (!props.showMoneyUppercase || props.type !== 'money') {
        return;
      }
      const text = moneyStringToChineseUppercase(getModelValue());
      const showLabel = Boolean(props.moneyUppercaseLabel);
      if (!showLabel && !text) {
        return;
      }
      return (
        <div class={bem('money-uppercase')}>
          {showLabel && (
            <span class={bem('money-uppercase-label')}>
              {props.moneyUppercaseLabel}
            </span>
          )}
          <span class={bem('money-uppercase-text')}>{text}</span>
        </div>
      );
    };

    const renderInputBottom = () => {
      const slot = slots['input-bottom'];
      if (!slot) {
        return;
      }
      return (
        <div class={bem('input-bottom')}>
          {slot()}
        </div>
      );
    };

    const renderInputComment = () => {
      const commentSlot = slots['input-comment'];
      if (commentSlot) {
        return (
          <div class={bem('input-comment')}>{commentSlot()}</div>
        );
      }
      if (props.inputComment) {
        return (
          <div class={bem('input-comment')}>{props.inputComment}</div>
        );
      }
    };

    const renderMoneyUppercaseFooter = () => {
      const money = renderMoneyUppercase();
      if (!money) {
        return;
      }
      return <div class={bem('input-bottom', 'fixed')}>{money}</div>;
    };

    const renderFieldBody = () => {
      if (isLabelCollapsible() && !labelExpanded.value) {
        return null;
      }

      const inputNode = renderInput();
      const wrappedInput =
        props.type === 'money' ? (
          <div class={bem('money-input-wrap')}>
            {renderMoneyUnit()}
            {inputNode}
          </div>
        ) : (
          inputNode
        );

      return [
        <div class={[bem('body'), props.bodyClass]} style={props.bodyStyle}>
          {slots['input-left'] && (
            <div class={bem('input-left')}>{slots['input-left']()}</div>
          )}
          {wrappedInput}
          {showClear.value && (
            <Icon
              ref={clearIconRef}
              name={props.clearIcon}
              class={bem('clear')}
            />
          )}
          {renderRightIcon()}
          {slots.button && <div class={bem('button')}>{slots.button()}</div>}
        </div>,
        renderInputBottom(),
        renderInputComment(),
        renderWordLimit(),
        renderMessage(),
        renderMoneyUppercaseFooter(),
      ];
    };

    useExpose<FieldExpose>({
      blur,
      focus,
      validate,
      formValue,
      resetValidation,
      getValidationStatus,
    });

    provide(CUSTOM_FIELD_INJECTION_KEY, {
      customValue,
      resetValidation,
      validateWithTrigger,
    });

    watch(
      () => props.modelValue,
      () => {
        updateValue(getModelValue());
        resetValidation();
        validateWithTrigger('onChange');
        nextTick(adjustTextareaSize);
      },
    );

    onMounted(() => {
      updateValue(getModelValue(), props.formatTrigger);
      nextTick(adjustTextareaSize);
    });

    // useEventListener will set passive to `false` to eliminate the warning of Chrome
    useEventListener('touchstart', onClear, {
      target: computed(() => clearIconRef.value?.$el),
    });

    return () => {
      const disabled = getProp('disabled');
      const labelAlign = getProp('labelAlign');
      const LeftIcon = renderLeftIcon();

      const renderTitle = () => {
        if (labelAlign === 'top') {
          const Label = renderTopLabelRow();
          const labelRow = [LeftIcon, Label].filter(Boolean);
          const comment = renderCellLabel();
          const collapsible = isLabelCollapsible();

          if (!labelRow.length && !comment) {
            return;
          }

          return (
            <>
              {labelRow.length > 0 && (
                <div
                  class={bem('label-top-row', {
                    collapsible,
                    expanded: collapsible ? labelExpanded.value : undefined,
                  })}
                  role={collapsible ? 'button' : undefined}
                  aria-expanded={
                    collapsible ? labelExpanded.value : undefined
                  }
                  onClick={collapsible ? toggleLabelExpanded : undefined}
                >
                  {collapsible ? (
                    <>
                      <div class={bem('label-top-row-main')}>{labelRow}</div>
                      {renderLabelCollapseControl()}
                    </>
                  ) : (
                    labelRow
                  )}
                </div>
              )}
              {comment && <div class="van-cell__label">{comment}</div>}
            </>
          );
        }
        const Label = renderLabel();
        return Label || [];
      };

      return (
        <Cell
          v-slots={{
            icon: LeftIcon && labelAlign !== 'top' ? () => LeftIcon : null,
            title: renderTitle,
            label:
              labelAlign !== 'top' &&
              (slots['label-comment'] || props.labelComment)
                ? renderCellLabel
                : null,
            value: renderFieldBody,
            extra: slots.extra,
            bottom: slots.bottom ?? null,
          }}
          size={props.size}
          class={bem({
            error: showError.value,
            disabled,
            'readonly-ellipsis': showReadonlyDisplay(),
            'money-uppercase':
              props.showMoneyUppercase && props.type === 'money',
            'input-border': props.inputBorder,
            'label-collapsed':
              isLabelCollapsible() && !labelExpanded.value,
            [`label-${labelAlign}`]: labelAlign,
          })}
          center={props.center}
          border={props.inputBorder ? false : props.border}
          isLink={props.isLink}
          clickable={props.clickable}
          titleStyle={labelStyle.value}
          valueClass={bem('value')}
          titleClass={[
            bem('label', [labelAlign, { required: showRequiredMark.value }]),
            props.labelClass,
          ]}
          arrowDirection={props.arrowDirection}
        />
      );
    };
  },
});
