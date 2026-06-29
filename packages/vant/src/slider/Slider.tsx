import {
  ref,
  watch,
  computed,
  onMounted,
  nextTick,
  onBeforeUnmount,
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
import type { SliderType, SliderInputLayout } from './types';

// Composables
import { useRect, useCustomFieldValue, useEventListener } from '@vant/use';
import { useTouch } from '../composables/use-touch';

// Components
import { Field } from '../field';
import { RangeInput } from '../range-input';

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
  inputLayout: makeStringProp<SliderInputLayout>('horizontal'),
  unselectedText: makeStringProp('未选择'),
  minPlaceholder: makeStringProp('最低金额'),
  maxPlaceholder: makeStringProp('最高金额'),
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
    const buttonLayoutVersion = ref(0);
    let customButtonResizeObservers: Array<ResizeObserver | undefined> = [];
    const customButtonMeasuredSizes: [number, number] = [0, 0];
    const dragStatus = ref<'start' | 'dragging' | ''>();
    const valueSelected = ref(false);
    const touch = useTouch();

    const minInput = ref('');
    const maxInput = ref('');

    const formatInputValue = (value: number) => {
      if (props.formatter) {
        return props.formatter(value);
      }

      return String(value);
    };

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
      minInput.value = formatInputValue(min);
      maxInput.value = formatInputValue(max);
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
      syncCustomButtonSizes();

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

    const hasCustomButton = (index?: 0 | 1) => {
      if (typeof index === 'number') {
        return !!slots[index === 0 ? 'left-button' : 'right-button'];
      }

      return !!slots.button;
    };

    const getLiveButtonSize = (index: 0 | 1) => {
      void buttonLayoutVersion.value;

      const el = slider[index].value;
      if (!el) {
        return customButtonMeasuredSizes[index];
      }

      let size = props.vertical ? el.offsetHeight : el.offsetWidth;

      if (!size && el.firstElementChild instanceof HTMLElement) {
        const inner = el.firstElementChild;
        size = props.vertical ? inner.offsetHeight : inner.offsetWidth;
      }

      return size || customButtonMeasuredSizes[index];
    };

    const getButtonMainSize = (index?: 0 | 1) => {
      const buttonStyle = getSizeStyle(props.buttonSize);
      const buttonIndex = index ?? 0;

      if (props.vertical) {
        if (buttonStyle?.height || buttonStyle?.width) {
          return buttonStyle.height || buttonStyle.width;
        }
      } else if (buttonStyle?.width || buttonStyle?.height) {
        return buttonStyle.width || buttonStyle.height;
      }

      if (hasCustomButton(index)) {
        const measuredSize = getLiveButtonSize(buttonIndex);
        if (measuredSize) {
          return addUnit(measuredSize);
        }
      }

      return props.vertical
        ? 'var(--van-slider-button-height)'
        : 'var(--van-slider-button-width)';
    };

    const updateCustomButtonSize = (index: 0 | 1) => {
      const el = slider[index].value;
      if (!el) {
        return;
      }

      const size = props.vertical ? el.offsetHeight : el.offsetWidth;
      if (!size || customButtonMeasuredSizes[index] === size) {
        return;
      }

      customButtonMeasuredSizes[index] = size;
      buttonLayoutVersion.value += 1;
    };

    const syncCustomButtonSizes = () => {
      const buttonCount = isRangeMode.value ? 2 : 1;

      for (let index = 0; index < buttonCount; index += 1) {
        updateCustomButtonSize(index as 0 | 1);
      }
    };

    const setupCustomButtonObservers = () => {
      customButtonResizeObservers.forEach((observer) => observer?.disconnect());
      customButtonResizeObservers = [];

      const buttonCount = isRangeMode.value ? 2 : 1;
      for (let index = 0; index < buttonCount; index += 1) {
        const buttonIndex = index as 0 | 1;
        if (!hasCustomButton(buttonIndex) || getSizeStyle(props.buttonSize)) {
          continue;
        }

        const el = slider[buttonIndex].value;
        if (!el) {
          continue;
        }

        updateCustomButtonSize(buttonIndex);

        if (typeof ResizeObserver === 'undefined') {
          continue;
        }

        const observer = new ResizeObserver(() => {
          updateCustomButtonSize(buttonIndex);
        });
        observer.observe(el);
        customButtonResizeObservers[buttonIndex] = observer;
      }
    };

    const getButtonPositionStyle = (
      value: number,
      index?: 0 | 1,
    ): CSSProperties => {
      const percent = ((value - Number(props.min)) * 100) / scope.value;
      const position = props.reverse ? 100 - percent : percent;
      const mainAxis = props.vertical ? 'top' : 'left';
      const buttonStyle = getSizeStyle(props.buttonSize);
      const mainSize = getButtonMainSize(index);
      const style: CSSProperties = {
        [mainAxis]: `clamp(0px, calc(${position}% - ${mainSize} / 2), calc(100% - ${mainSize}))`,
      };

      if (buttonStyle?.width) {
        style['--van-slider-button-width'] = buttonStyle.width;
      }

      if (buttonStyle?.height) {
        style['--van-slider-button-height'] = buttonStyle.height;
      }

      return style;
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
        <div
          class={bem('button')}
          style={Object.keys(buttonStyle).length ? buttonStyle : undefined}
        >
          <span class={bem('button-grip')} />
        </div>
      );
    };

    const getMarkPositionStyle = (mark: number): CSSProperties => {
      const percent = ((mark - Number(props.min)) * 100) / scope.value;
      const position =
        props.reverse && props.vertical ? `${100 - percent}%` : `${percent}%`;
      return props.vertical ? { top: position } : { left: position };
    };

    const getMarkState = () => {
      const { modelValue } = props;
      const rangeValue = isRange(modelValue) ? modelValue : null;
      const min = Number(props.min);

      return markList.value.map((mark) => {
        const percent = ((mark - min) * 100) / scope.value;
        const position =
          props.reverse && props.vertical ? 100 - percent : percent;

        return {
          mark,
          positionStyle: getMarkPositionStyle(mark),
          isStartBoundary: position === 0,
          isEndBoundary: position === 100,
          isEndpoint:
            !!rangeValue && (mark === rangeValue[0] || mark === rangeValue[1]),
          isActive:
            !!rangeValue && mark >= rangeValue[0] && mark <= rangeValue[1],
        };
      });
    };

    const renderMarkLabels = () => {
      if (!isNodeRange.value || !markList.value.length) {
        return;
      }

      return (
        <div class={bem('marks')}>
          {getMarkState().map(
            ({
              mark,
              positionStyle,
              isEndpoint,
              isStartBoundary,
              isEndBoundary,
            }) => (
              <div
                key={mark}
                class={bem('mark', {
                  start: isStartBoundary,
                  end: isEndBoundary,
                })}
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
            ),
          )}
        </div>
      );
    };

    const renderMarkDots = () => {
      if (!isNodeRange.value || !markList.value.length) {
        return;
      }

      return (
        <div class={bem('track-dots')}>
          {getMarkState().map(
            ({
              mark,
              positionStyle,
              isActive,
              isEndpoint,
              isStartBoundary,
              isEndBoundary,
            }) => {
              // 滑块所在节点及轨道两端不展示圆点
              if (isEndpoint || isStartBoundary || isEndBoundary) {
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
            },
          )}
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
        type: 'money' as const,
        disabled: props.disabled || undefined,
        readonly: props.readonly || undefined,
      };

      const renderRangeField = (index: 0 | 1, placeholder: string) => (
        <Field
          {...inputProps}
          inputBorder
          placeholder={placeholder}
          onBlur={() =>
            syncModelFromInput(
              index,
              index === 0 ? minInput.value : maxInput.value,
            )
          }
        />
      );

      return (
        <div class={bem('inputs')}>
          <RangeInput
            class={bem('range-input')}
            layout={props.inputLayout}
            modelValue={[minInput.value, maxInput.value]}
            onUpdate:modelValue={(value) => {
              minInput.value = String(value[0] ?? '');
              maxInput.value = String(value[1] ?? '');
            }}
            start={() => renderRangeField(0, props.minPlaceholder)}
            end={() => renderRangeField(1, props.maxPlaceholder)}
          />
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
          style={getButtonPositionStyle(current, index)}
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

    onMounted(() => {
      nextTick(() => {
        syncCustomButtonSizes();
        setupCustomButtonObservers();
      });
    });

    onBeforeUnmount(() => {
      customButtonResizeObservers.forEach((observer) => observer?.disconnect());
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
            <div class={bem('bar')} style={barStyle.value} />
            {isRangeMode.value
              ? [renderButton(0), renderButton(1)]
              : renderButton()}
          </div>
        </div>
        {renderValue()}
        {renderInputs()}
      </div>
    );
  },
});
