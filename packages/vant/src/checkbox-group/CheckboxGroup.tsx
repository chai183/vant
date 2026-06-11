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
import {
  filterListOptions,
  getListSearchHighlight,
  isListSearchEmpty,
} from '../composables/filter-list-options';

// Components
import Checkbox from '../checkbox';
import Cell from '../cell';
import CellGroup from '../cell-group';
import Search from '../search';
import Empty from '../empty';
import { Icon } from '../icon';

// Types
import type { CheckboxInstance } from '../checkbox/types';
import type { CheckerShape, CheckerDirection } from '../checkbox/Checker';
import type {
  CheckboxGroupExpose,
  CheckboxGroupOption,
  CheckboxGroupProvide,
  CheckboxGroupToggleAllOptions,
} from './types';

const [name, bem, t] = createNamespace('checkbox-group');

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
  showSearch: Boolean,
  searchPlaceholder: String,
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

    const renderOptionLabel = (option: CheckboxGroupOption) => {
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
        <Checkbox
          key={String(option.value)}
          name={option.value}
          disabled={option.disabled}
        >
          {renderOptionLabel(option)}
        </Checkbox>
      ));

    const toggleOption = (option: CheckboxGroupOption) => {
      if (props.disabled || option.disabled) {
        return;
      }
      const index = props.options.findIndex((item) => item.value === option.value);
      if (index >= 0) {
        checkboxRefs.value[index]?.toggle();
      }
    };

    const renderSearch = () => {
      if (!props.isList || !props.showSearch) {
        return;
      }

      return (
        <Search
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
          const index = props.options.findIndex((item) => item.value === value);
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
              onClick={() => toggleOption(option)}
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
    };

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
        {renderSearch()}
        {props.isList ? renderListOptions() : renderOptions()}
        {slots.default?.()}
      </div>
    );
  },
});
