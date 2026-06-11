import {
  ref,
  computed,
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
import {
  filterListOptions,
  getListSearchHighlight,
  isListSearchEmpty,
} from '../composables/filter-list-options';

import Radio from '../radio';
import Cell from '../cell';
import CellGroup from '../cell-group';
import Search from '../search';
import Empty from '../empty';
import { Icon } from '../icon';
import type { RadioShape } from '../radio';
import type { CheckerDirection } from '../checkbox/Checker';
import type { RadioGroupOption } from './types';

const [name, bem, t] = createNamespace('radio-group');

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
  showSearch: Boolean,
  searchPlaceholder: String,
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
    const searchKeyword = ref('');

    const listOptions = computed(() => {
      if (!props.isList || !props.showSearch) {
        return props.options;
      }
      return filterListOptions(props.options, searchKeyword.value);
    });

    const listHighlight = computed(() =>
      props.showSearch ? getListSearchHighlight(searchKeyword.value) : [],
    );

    const showListEmpty = computed(
      () =>
        props.isList &&
        props.showSearch &&
        isListSearchEmpty(searchKeyword.value, listOptions.value.length),
    );

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

    const renderOptionLabel = (option: RadioGroupOption) => {
      if (option.icon) {
        return (
          <>
            <Icon name={option.icon} class={bem('option-icon')} />
            {option.label}
          </>
        );
      }
      return option.label;
    };

    const renderOptions = () =>
      props.options.map((option) => (
        <Radio
          key={String(option.value)}
          name={option.value}
          disabled={option.disabled}
        >
          {renderOptionLabel(option)}
        </Radio>
      ));

    const selectOption = (option: RadioGroupOption) => {
      if (props.disabled || option.disabled) {
        return;
      }
      updateValue(option.value);
    };

    const renderSearch = () => {
      if (!props.isList || !props.showSearch) {
        return;
      }

      return (
        <Search
          class={bem('search')}
          modelValue={searchKeyword.value}
          placeholder={props.searchPlaceholder ?? t('searchPlaceholder')}
          onUpdate:modelValue={(value: string) => {
            searchKeyword.value = value;
          }}
        />
      );
    };

    const renderListEmpty = () => {
      if (slots['search-empty']) {
        return slots['search-empty']();
      }

      return (
        <Empty class={bem('empty')} description={t('searchEmpty')}>
          {{ image: () => null }}
        </Empty>
      );
    };

    const renderListOptions = () => {
      if (showListEmpty.value) {
        return renderListEmpty();
      }

      return (
      <CellGroup border={false}>
        {listOptions.value.map((option) => {
          const { label, value, disabled, icon, cellProps } = option;
          const highlight =
            listHighlight.value.length > 0
              ? listHighlight.value
              : cellProps?.highlight;

          return (
            <Cell
              key={String(value)}
              title={label}
              {...cellProps}
              highlight={highlight}
              icon={cellProps?.icon ?? icon}
              border={false}
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
    };

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
        {renderSearch()}
        {props.isList ? renderListOptions() : renderOptions()}
        {slots.default?.()}
      </div>
    );
  },
});
