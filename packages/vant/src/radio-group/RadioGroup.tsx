import {
  watch,
  defineComponent,
  type PropType,
  type CSSProperties,
  type InjectionKey,
  type ExtractPropTypes,
} from 'vue';
import {
  unknownProp,
  numericProp,
  makeArrayProp,
  makeNumericProp,
  createNamespace,
} from '../utils';
import { useChildren, useCustomFieldValue } from '@vant/use';

import Radio from '../radio';
import Cell from '../cell';
import CellGroup from '../cell-group';
import type { RadioShape } from '../radio';
import type { CheckerDirection } from '../checkbox/Checker';
import type { RadioGroupOption } from './types';

const [name, bem] = createNamespace('radio-group');

export type RadioGroupDirection = CheckerDirection;

export const radioGroupProps = {
  shape: String as PropType<RadioShape>,
  disabled: Boolean,
  iconSize: numericProp,
  direction: String as PropType<RadioGroupDirection>,
  columns: makeNumericProp(3),
  modelValue: unknownProp,
  checkedColor: String,
  isList: Boolean,
  options: makeArrayProp<RadioGroupOption>(),
};

export type RadioGroupProps = ExtractPropTypes<typeof radioGroupProps>;

export type RadioGroupProvide = {
  props: RadioGroupProps;
  updateValue: (value: unknown) => void;
};

export const RADIO_KEY: InjectionKey<RadioGroupProvide> = Symbol(name);

export default defineComponent({
  name,

  props: radioGroupProps,

  emits: ['change', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const { linkChildren } = useChildren(RADIO_KEY);

    const updateValue = (value: unknown) => emit('update:modelValue', value);

    watch(
      () => props.modelValue,
      (value) => emit('change', value),
    );

    linkChildren({
      props,
      updateValue,
    });

    useCustomFieldValue(() => props.modelValue);

    const renderOptions = () =>
      props.options.map((option) => (
        <Radio
          key={String(option.value)}
          name={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </Radio>
      ));

    const selectOption = (option: RadioGroupOption) => {
      if (props.disabled || option.disabled) {
        return;
      }
      updateValue(option.value);
    };

    const renderListOptions = () => (
      <CellGroup>
        {props.options.map((option) => {
          const { label, value, disabled, cellProps } = option;

          return (
            <Cell
              key={String(value)}
              title={label}
              {...cellProps}
              clickable={
                cellProps?.clickable ?? (!props.disabled && !disabled)
              }
              onClick={() => selectOption(option)}
            >
              {{
                'right-icon': () => (
                  <Radio
                    name={value}
                    disabled={disabled}
                    onClick={(event: MouseEvent) => event.stopPropagation()}
                  />
                ),
              }}
            </Cell>
          );
        })}
      </CellGroup>
    );

    return () => (
      <div
        class={bem([
          !props.isList && props.direction,
          { list: props.isList, block: props.shape === 'block' },
        ])}
        role="radiogroup"
        style={
          !props.isList &&
          props.direction === 'horizontal' &&
          props.shape === 'block'
            ? ({
                '--van-radio-group-columns': props.columns,
              } as CSSProperties)
            : undefined
        }
      >
        {props.isList ? renderListOptions() : renderOptions()}
        {slots.default?.()}
      </div>
    );
  },
});
