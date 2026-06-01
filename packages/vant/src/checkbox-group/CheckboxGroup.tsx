import {
  watch,
  defineComponent,
  type PropType,
  type CSSProperties,
  type InjectionKey,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  numericProp,
  makeArrayProp,
  makeNumericProp,
  makeStringProp,
  createNamespace,
} from '../utils';

// Composables
import { useChildren, useCustomFieldValue } from '@vant/use';
import { useExpose } from '../composables/use-expose';
import { useRefs } from '../composables/use-refs';

// Components
import Checkbox from '../checkbox';
import Cell from '../cell';
import CellGroup from '../cell-group';

// Types
import type { CheckboxInstance } from '../checkbox/types';
import type { CheckerShape, CheckerDirection } from '../checkbox/Checker';
import type {
  CheckboxGroupExpose,
  CheckboxGroupOption,
  CheckboxGroupProvide,
  CheckboxGroupToggleAllOptions,
} from './types';

const [name, bem] = createNamespace('checkbox-group');

export const checkboxGroupProps = {
  max: numericProp,
  shape: makeStringProp<CheckerShape>('round'),
  disabled: Boolean,
  iconSize: numericProp,
  direction: String as PropType<CheckerDirection>,
  columns: makeNumericProp(3),
  modelValue: makeArrayProp<unknown>(),
  checkedColor: String,
  isList: Boolean,
  options: makeArrayProp<CheckboxGroupOption>(),
};

export type CheckboxGroupProps = ExtractPropTypes<typeof checkboxGroupProps>;

export const CHECKBOX_GROUP_KEY: InjectionKey<CheckboxGroupProvide> =
  Symbol(name);

export default defineComponent({
  name,

  props: checkboxGroupProps,

  emits: ['change', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const { children, linkChildren } = useChildren(CHECKBOX_GROUP_KEY);
    const [checkboxRefs, setCheckboxRefs] = useRefs<CheckboxInstance>();

    const updateValue = (value: unknown[]) => emit('update:modelValue', value);

    const toggleAll = (options: CheckboxGroupToggleAllOptions = {}) => {
      if (typeof options === 'boolean') {
        options = { checked: options };
      }

      const { checked, skipDisabled } = options;

      const checkedChildren = children.filter((item: any) => {
        if (!item.props.bindGroup) {
          return false;
        }
        if (item.props.disabled && skipDisabled) {
          return item.checked.value;
        }
        return checked ?? !item.checked.value;
      });

      const names = checkedChildren.map((item: any) => item.name);
      updateValue(names);
    };

    watch(
      () => props.modelValue,
      (value) => emit('change', value),
    );

    useExpose<CheckboxGroupExpose>({ toggleAll });
    useCustomFieldValue(() => props.modelValue);
    linkChildren({
      props,
      updateValue,
    });

    const renderOptions = () =>
      props.options.map((option) => (
        <Checkbox
          key={String(option.value)}
          name={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </Checkbox>
      ));

    const toggleOption = (index: number, option: CheckboxGroupOption) => {
      if (props.disabled || option.disabled) {
        return;
      }
      checkboxRefs.value[index]?.toggle();
    };

    const renderListOptions = () => (
      <CellGroup>
        {props.options.map((option, index) => {
          const { label, value, disabled, cellProps } = option;

          return (
            <Cell
              key={String(value)}
              title={label}
              {...cellProps}
              clickable={
                cellProps?.clickable ?? (!props.disabled && !disabled)
              }
              onClick={() => toggleOption(index, option)}
            >
              {{
                'right-icon': () => (
                  <Checkbox
                    shape="square"
                    ref={setCheckboxRefs(index)}
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
        style={
          !props.isList &&
          props.direction === 'horizontal' &&
          props.shape === 'block'
            ? ({
                '--van-checkbox-group-columns': props.columns,
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
