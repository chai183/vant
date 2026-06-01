import {
  ref,
  watch,
  computed,
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  clamp,
  addUnit,
  addNumber,
  numericProp,
  isSameValue,
  getSizeStyle,
  preventDefault,
  stopPropagation,
  createNamespace,
  makeNumericProp,
  makeStringProp,
} from '../utils';

// Types
import type { SliderType } from './types';

// Composables
import { useRect, useCustomFieldValue, useEventListener } from '@vant/use';
import { useTouch } from '../composables/use-touch';

const [name, bem] = createNamespace('slider');

type NumberRange = [number, number];

type SliderValue = number | NumberRange;

export const sliderProps = {
  min: makeNumericProp(0),
  max: makeNumericProp(100),
  step: makeNumericProp(1),
  type: makeStringProp<SliderType>('single'),
  marks: Array as PropType<number[]>,
  range: Boolean,
  reverse: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  vertical: Boolean,
  barHeight: numericProp,
  buttonSize: numericProp,
  activeColor: String,
  inactiveColor: String,
  showValue: Boolean,
  showInputs: Boolean,
  unselectedText: makeStringProp('未选择'),
  minPlaceholder: makeStringProp('¥ 最低金额'),
  maxPlaceholder: makeStringProp('¥ 最高金额'),
  formatter: Function as PropType<(value: number) => string>,
  parser: Function as PropType<(text: string) => number | null>,
  modelValue: {
    type: [Number, Array] as PropType<SliderValue>,
    default: 0,
  },
};

export type SliderProps = ExtractPropTypes<typeof sliderProps>;

export default defineComponent({
  name,

  props: sliderProps,

  emits: ['change', 'dragEnd', 'dragStart', 'update:modelValue'],

  setup(props, { emit, slots }) {
    let buttonIndex: 0 | 1;
    let current: SliderValue;
    let startValue: SliderValue;

    const root = ref<HTMLElement>();
    const slider = [ref<HTMLElement>(), ref<HTMLElement>()] as const;
    const dragStatus = ref<'start' | 'dragging' | ''>();
    const valueSelected = ref(false);
    const touch = useTouch();

    const minInput = ref('');
    const maxInput = ref('');

    const formatDisplayValue = (value: number) => {
      if (props.formatter) {
        return props.formatter(value);
      }

      return `¥ ${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const parseDisplayValue = (text: string) => {
      if (props.parser) {
        return props.parser(text);
      }

      const num = Number(text.replace(/[^\d.]/g, ''));
      return Number.isFinite(num) ? num : null;
    };

    const getRangeValue = (): NumberRange => {
      const value = props.modelValue;
      if (Array.isArray(value)) {
        return value as NumberRange;
      }
      return [Number(props.min), Number(props.max)];
    };

    const syncInputsFromModel = () => {
      if (!props.showInputs || !isRangeMode.value) {
        return;
      }

      const [min, max] = getRangeValue();
      minInput.value = formatDisplayValue(min);
      maxInput.value = formatDisplayValue(max);
    };

    const markValueSelected = () => {
      if (props.showValue && !isRangeMode.value) {
        valueSelected.value = true;
      }
    };

    const scope = computed(() => Number(props.max) - Number(props.min));

    const isRangeMode = computed(() => {
      if (props.type === 'range' || props.type === 'node-range') {
        return true;
      }
      if (props.type === 'single') {
        return props.range;
      }
      return props.range;
    });

    watch(
      () => props.modelValue,
      () => {
        syncInputsFromModel();
      },
      { immediate: true, deep: true },
    );

    const isNodeRange = computed(() => props.type === 'node-range');

    const markList = computed(() => {
      if (!isNodeRange.value) {
        return [];
      }

      if (props.marks?.length) {
        return props.marks.map((mark) => Number(mark));
      }

      const min = Number(props.min);
      const max = Number(props.max);
      const step = Number(props.step);
      const list: number[] = [];

      for (let value = min; value <= max; value += step) {
        list.push(value);
      }

      return list;
    });

    const trackStyle = computed(() => {
      const crossAxis = props.vertical ? 'width' : 'height';
      return {
        background: props.inactiveColor,
        [crossAxis]: addUnit(props.barHeight),
      };
    });

    const isRange = (val: unknown): val is NumberRange =>
      isRangeMode.value && Array.isArray(val);

    // 计算选中条的长度百分比
    const calcMainAxis = () => {
      const { modelValue, min } = props;
      if (isRange(modelValue)) {
        return `${((modelValue[1] - modelValue[0]) * 100) / scope.value}%`;
      }
      return `${((modelValue - Number(min)) * 100) / scope.value}%`;
    };

    // 计算选中条的开始位置的偏移量
    const calcOffset = () => {
      const { modelValue, min } = props;
      if (isRange(modelValue)) {
        return `${((modelValue[0] - Number(min)) * 100) / scope.value}%`;
      }
      return '0%';
    };

    const barStyle = computed(() => {
      const mainAxis = props.vertical ? 'height' : 'width';
      const style: CSSProperties = {
        [mainAxis]: calcMainAxis(),
        background: props.activeColor,
      };

      if (dragStatus.value) {
        style.transition = 'none';
      }

      const getPositionKey = () => {
        if (props.vertical) {
          return props.reverse ? 'bottom' : 'top';
        }
        return props.reverse ? 'right' : 'left';
      };

      style[getPositionKey()] = calcOffset();

      return style;
    });

    const formatToMark = (value: number) => {
      const marks = markList.value;
      if (!marks.length) {
        return value;
      }

      return marks.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
      );
    };

    const format = (value: number) => {
      const min = +props.min;
      const max = +props.max;
      const step = +props.step;

      value = clamp(value, min, max);

      if (isNodeRange.value) {
        return formatToMark(value);
      }

      const diff = Math.round((value - min) / step) * step;
      return addNumber(min, diff);
    };

    const updateStartValue = () => {
      const current = props.modelValue;
      if (isRange(current)) {
        startValue = current.map(format) as NumberRange;
      } else {
        startValue = format(current);
      }
    };

    const handleRangeValue = (value: NumberRange) => {
      const left = value[0] ?? Number(props.min);
      const right = value[1] ?? Number(props.max);
      return left > right ? [right, left] : [left, right];
    };

    const updateValue = (value: SliderValue, end?: boolean) => {
      if (isRange(value)) {
        value = handleRangeValue(value).map(format) as NumberRange;
      } else {
        value = format(value);
      }

      if (!isSameValue(value, props.modelValue)) {
        emit('update:modelValue', value);
      }

      if (end && !isSameValue(value, startValue)) {
        markValueSelected();
        emit('change', value);
      }
    };

    const onClick = (event: MouseEvent) => {
      event.stopPropagation();

      if (props.disabled || props.readonly) {
        return;
      }

      updateStartValue();

      const { min, reverse, vertical, modelValue } = props;
      const rect = useRect(root);

      const getDelta = () => {
        if (vertical) {
          if (reverse) {
            return rect.bottom - event.clientY;
          }
          return event.clientY - rect.top;
        }
        if (reverse) {
          return rect.right - event.clientX;
        }
        return event.clientX - rect.left;
      };

      const total = vertical ? rect.height : rect.width;
      const value = Number(min) + (getDelta() / total) * scope.value;

      if (isRange(modelValue)) {
        const [left, right] = modelValue;
        const middle = (left + right) / 2;

        if (value <= middle) {
          updateValue([value, right], true);
        } else {
          updateValue([left, value], true);
        }
      } else {
        updateValue(value, true);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      if (props.disabled || props.readonly) {
        return;
      }

      markValueSelected();
      touch.start(event);
      current = props.modelValue;
      updateStartValue();

      dragStatus.value = 'start';
    };

    const onTouchMove = (event: TouchEvent) => {
      if (props.disabled || props.readonly) {
        return;
      }

      if (dragStatus.value === 'start') {
        emit('dragStart', event);
      }

      preventDefault(event, true);
      touch.move(event);
      dragStatus.value = 'dragging';

      const rect = useRect(root);
      const delta = props.vertical ? touch.deltaY.value : touch.deltaX.value;
      const total = props.vertical ? rect.height : rect.width;

      let diff = (delta / total) * scope.value;
      if (props.reverse) {
        diff = -diff;
      }

      if (isRange(startValue)) {
        const index = props.reverse ? 1 - buttonIndex : buttonIndex;
        (current as NumberRange)[index] = startValue[index] + diff;
      } else {
        current = startValue + diff;
      }
      updateValue(current);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (props.disabled || props.readonly) {
        return;
      }

      if (dragStatus.value === 'dragging') {
        updateValue(current, true);
        emit('dragEnd', event);
      }

      dragStatus.value = '';
    };

    const getButtonClassName = (index?: 0 | 1) => {
      if (typeof index === 'number') {
        const position = ['left', 'right'];
        return bem(`button-wrapper`, position[index]);
      }
      return bem('button-wrapper', props.reverse ? 'left' : 'right');
    };

    const renderButtonContent = (value: number, index?: 0 | 1) => {
      const dragging = dragStatus.value === 'dragging';

      if (typeof index === 'number') {
        const slot = slots[index === 0 ? 'left-button' : 'right-button'];
        let dragIndex;

        if (dragging && Array.isArray(current)) {
          dragIndex = current[0] > current[1] ? buttonIndex ^ 1 : buttonIndex;
        }

        if (slot) {
          return slot({ value, dragging, dragIndex });
        }
      }

      if (slots.button) {
        return slots.button({ value, dragging });
      }

      const buttonStyle = getSizeStyle(props.buttonSize) || {};

      if (buttonStyle.height) {
        buttonStyle.borderRadius = `calc(${buttonStyle.height} / 2)`;
      } else if (buttonStyle.width) {
        buttonStyle.borderRadius = `calc(${buttonStyle.width} / 2)`;
      }

      return (
        <div class={bem('button')} style={Object.keys(buttonStyle).length ? buttonStyle : undefined}>
          <span class={bem('button-grip')} />
        </div>
      );
    };

    const getMarkPercent = (mark: number) =>
      `${((mark - Number(props.min)) * 100) / scope.value}%`;

    const getMarkPositionStyle = (mark: number): CSSProperties => {
      const percent =
        ((mark - Number(props.min)) * 100) / scope.value;
      const position =
        props.reverse && props.vertical
          ? `${100 - percent}%`
          : `${percent}%`;
      return props.vertical ? { top: position } : { left: position };
    };

    const getMarkState = () => {
      const modelValue = props.modelValue;
      const rangeValue = isRange(modelValue) ? modelValue : null;

      return markList.value.map((mark) => ({
        mark,
        positionStyle: getMarkPositionStyle(mark),
        isEndpoint:
          !!rangeValue &&
          (mark === rangeValue[0] || mark === rangeValue[1]),
        isActive:
          !!rangeValue && mark >= rangeValue[0] && mark <= rangeValue[1],
      }));
    };

    const renderMarkLabels = () => {
      if (!isNodeRange.value || !markList.value.length) {
        return;
      }

      return (
        <div class={bem('marks')}>
          {getMarkState().map(({ mark, positionStyle, isEndpoint }) => (
            <div
              key={mark}
              class={bem('mark')}
              style={positionStyle}
            >
              <span
                class={bem('mark-label', {
                  active: isEndpoint,
                })}
              >
                {mark}
              </span>
            </div>
          ))}
        </div>
      );
    };

    const renderMarkDots = () => {
      if (!isNodeRange.value || !markList.value.length) {
        return;
      }

      return (
        <div class={bem('track-dots')}>
          {getMarkState().map(({ mark, positionStyle, isActive, isEndpoint }) => {
            // 滑块所在节点不展示圆点，避免与滑块重叠
            if (isEndpoint) {
              return null;
            }

            return (
              <span
                key={mark}
                class={bem('mark-dot', {
                  active: isActive,
                })}
                style={positionStyle}
              />
            );
          })}
        </div>
      );
    };

    const syncModelFromInput = (index: 0 | 1, text: string) => {
      const parsed = parseDisplayValue(text);
      if (parsed === null) {
        syncInputsFromModel();
        return;
      }

      let min = getRangeValue()[0];
      let max = getRangeValue()[1];

      if (index === 0) {
        min = clamp(Number(parsed), Number(props.min), Number(props.max));
      } else {
        max = clamp(Number(parsed), Number(props.min), Number(props.max));
      }

      if (min > max) {
        if (index === 0) {
          max = min;
        } else {
          min = max;
        }
      }

      updateValue([min, max], true);
    };

    const renderInputs = () => {
      if (!props.showInputs || !isRangeMode.value || props.vertical) {
        return null;
      }

      if (slots['range-input']) {
        return slots['range-input']({
          modelValue: getRangeValue(),
          min: minInput.value,
          max: maxInput.value,
        });
      }

      const inputProps = {
        type: 'text',
        inputMode: 'decimal' as const,
        disabled: props.disabled || undefined,
        readOnly: props.readonly || undefined,
      };

      return (
        <div class={bem('inputs')}>
          <label class={bem('field')}>
            <input
              {...inputProps}
              class={bem('input')}
              value={minInput.value}
              placeholder={props.minPlaceholder}
              onInput={(event) => {
                minInput.value = (event.target as HTMLInputElement).value;
              }}
              onBlur={() => syncModelFromInput(0, minInput.value)}
            />
          </label>
          <span class={bem('divider')} />
          <label class={bem('field')}>
            <input
              {...inputProps}
              class={bem('input')}
              value={maxInput.value}
              placeholder={props.maxPlaceholder}
              onInput={(event) => {
                maxInput.value = (event.target as HTMLInputElement).value;
              }}
              onBlur={() => syncModelFromInput(1, maxInput.value)}
            />
          </label>
        </div>
      );
    };

    const renderValue = () => {
      if (!props.showValue || isRangeMode.value || props.vertical) {
        return null;
      }

      const value = props.modelValue as number;

      if (slots.value) {
        return slots.value({
          value,
          selected: valueSelected.value,
        });
      }

      const text = valueSelected.value
        ? formatDisplayValue(value)
        : props.unselectedText;

      return (
        <p class={bem('value', { active: valueSelected.value })}>{text}</p>
      );
    };

    const renderButton = (index?: 0 | 1) => {
      const current =
        typeof index === 'number'
          ? (props.modelValue as NumberRange)[index]
          : (props.modelValue as number);

      return (
        <div
          ref={slider[index ?? 0]}
          role="slider"
          class={getButtonClassName(index)}
          tabindex={props.disabled ? undefined : 0}
          aria-valuemin={props.min}
          aria-valuenow={current}
          aria-valuemax={props.max}
          aria-disabled={props.disabled || undefined}
          aria-readonly={props.readonly || undefined}
          aria-orientation={props.vertical ? 'vertical' : 'horizontal'}
          onTouchstartPassive={(event) => {
            if (typeof index === 'number') {
              buttonIndex = index;
            }
            onTouchStart(event);
          }}
          onTouchend={onTouchEnd}
          onTouchcancel={onTouchEnd}
          onClick={stopPropagation}
        >
          {renderButtonContent(current, index)}
        </div>
      );
    };

    // format initial value
    updateValue(props.modelValue);
    useCustomFieldValue(() => props.modelValue);

    slider.forEach((item) => {
      useEventListener('touchmove', onTouchMove, {
        target: item,
      });
    });

    return () => (
      <div
        class={bem('container', {
          vertical: props.vertical,
          'with-marks':
            isNodeRange.value && markList.value.length && !props.vertical,
          'with-marks-vertical':
            isNodeRange.value && markList.value.length && props.vertical,
        })}
      >
        {!props.vertical && renderMarkLabels()}
        <div
          class={bem({
            vertical: props.vertical,
            disabled: props.disabled,
          })}
        >
          {props.vertical && renderMarkLabels()}
          <div
            ref={root}
            style={trackStyle.value}
            class={bem('track')}
            onClick={onClick}
          >
            {renderMarkDots()}
            <div class={bem('bar')} style={barStyle.value}>
              {isRangeMode.value
                ? [renderButton(0), renderButton(1)]
                : renderButton()}
            </div>
          </div>
        </div>
        {renderValue()}
        {renderInputs()}
      </div>
    );
  },
});
