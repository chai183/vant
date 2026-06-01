import {
  ref,
  watch,
  computed,
  nextTick,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';
import {
  extend,
  truthProp,
  numericProp,
  makeArrayProp,
  makeStringProp,
  createNamespace,
  HAPTICS_FEEDBACK,
  type Numeric,
} from '../utils';
// Composables
import { useRefs } from '../composables/use-refs';

// Components
import { Tab } from '../tab';
import { Tabs } from '../tabs';
import { Icon } from '../icon';

// Types
import type { TabsClickTabEventParams } from '../tabs/types';
import type {
  CascaderTab,
  CascaderOption,
  CascaderFieldNames,
  CascaderTabLayout,
} from './types';

const [name, bem, t] = createNamespace('cascader');

export const cascaderProps = {
  title: String,
  options: makeArrayProp<CascaderOption>(),
  closeable: truthProp,
  swipeable: truthProp,
  closeIcon: makeStringProp('cross'),
  showHeader: truthProp,
  modelValue: numericProp,
  fieldNames: Object as PropType<CascaderFieldNames>,
  placeholder: String,
  activeColor: String,
  tabLayout: makeStringProp<CascaderTabLayout>('tabs'),
};

export type CascaderProps = ExtractPropTypes<typeof cascaderProps>;

export default defineComponent({
  name,

  props: cascaderProps,

  emits: ['close', 'change', 'finish', 'clickTab', 'update:modelValue'],

  setup(props, { slots, emit }) {
    const tabs = ref<CascaderTab[]>([]);
    const activeTab = ref(0);
    const [selectedElementRefs, setSelectedElementRefs] =
      useRefs<HTMLElement>();

    const {
      text: textKey,
      value: valueKey,
      children: childrenKey,
      pinyin: pinyinKey,
    } = extend(
      {
        text: 'text',
        value: 'value',
        children: 'children',
        pinyin: 'pinyin',
      },
      props.fieldNames,
    );

    type ProcessedOption = {
      option: CascaderOption;
      index: string;
    };

    const processOptions = (options: CascaderOption[]): ProcessedOption[] => {
      const hasPinyin = options.some((item) => item[pinyinKey]);
      if (!hasPinyin) {
        return options.map((option) => ({ option, index: '' }));
      }

      const sorted = [...options].sort((a, b) => {
        const pinyinA = String(a[pinyinKey] || '').toUpperCase();
        const pinyinB = String(b[pinyinKey] || '').toUpperCase();
        if (!pinyinA && !pinyinB) return 0;
        if (!pinyinA) return 1;
        if (!pinyinB) return -1;
        return pinyinA.localeCompare(pinyinB);
      });

      let lastIndex = '';
      return sorted.map((option) => {
        const pinyin = String(option[pinyinKey] || '');
        const index = pinyin ? pinyin.charAt(0).toUpperCase() : '';
        const showIndex = index && index !== lastIndex;
        if (showIndex) {
          lastIndex = index;
        }
        return { option, index: showIndex ? index : '' };
      });
    };

    const getSelectedOptionsByValue = (
      options: CascaderOption[],
      value: Numeric,
    ): CascaderOption[] | undefined => {
      for (const option of options) {
        if (option[valueKey] === value) {
          return [option];
        }

        if (option[childrenKey]) {
          const selectedOptions = getSelectedOptionsByValue(
            option[childrenKey],
            value,
          );
          if (selectedOptions) {
            return [option, ...selectedOptions];
          }
        }
      }
    };

    const updateTabs = () => {
      const { options, modelValue } = props;

      if (modelValue !== undefined) {
        const selectedOptions = getSelectedOptionsByValue(options, modelValue);

        if (selectedOptions) {
          let optionsCursor = options;

          tabs.value = selectedOptions.map((option) => {
            const tab = {
              options: optionsCursor,
              selected: option,
            };

            const next = optionsCursor.find(
              (item) => item[valueKey] === option[valueKey],
            );
            if (next) {
              optionsCursor = next[childrenKey];
            }

            return tab;
          });

          if (optionsCursor) {
            tabs.value.push({
              options: optionsCursor,
              selected: null,
            });
          }

          nextTick(() => {
            activeTab.value = tabs.value.length - 1;
          });

          return;
        }
      }

      tabs.value = [
        {
          options,
          selected: null,
        },
      ];
    };

    const onSelect = (option: CascaderOption, tabIndex: number) => {
      if (option.disabled) {
        return;
      }

      tabs.value[tabIndex].selected = option;

      if (tabs.value.length > tabIndex + 1) {
        tabs.value = tabs.value.slice(0, tabIndex + 1);
      }

      if (option[childrenKey]) {
        const nextTab = {
          options: option[childrenKey],
          selected: null,
        };

        if (tabs.value[tabIndex + 1]) {
          tabs.value[tabIndex + 1] = nextTab;
        } else {
          tabs.value.push(nextTab);
        }

        nextTick(() => {
          activeTab.value++;
        });
      }

      const selectedOptions = tabs.value
        .map((tab) => tab.selected)
        .filter(Boolean);

      emit('update:modelValue', option[valueKey]);

      const params = {
        value: option[valueKey],
        tabIndex,
        selectedOptions,
      };
      emit('change', params);

      if (!option[childrenKey]) {
        emit('finish', params);
      }
    };

    const onClose = () => emit('close');

    const onClickTab = ({ name, title }: TabsClickTabEventParams) =>
      emit('clickTab', name, title);

    const isStepsLayout = computed(() => props.tabLayout === 'steps');

    const displayStepTabs = computed(() => {
      const steps: Array<{
        tab: CascaderTab;
        tabIndex: number;
        isPending: boolean;
      }> = [];

      tabs.value.forEach((tab, tabIndex) => {
        if (tab.selected) {
          steps.push({ tab, tabIndex, isPending: false });
        }
      });

      const lastIndex = tabs.value.length - 1;
      const lastTab = tabs.value[lastIndex];

      if (lastTab && !lastTab.selected && steps.length > 0) {
        steps.push({ tab: lastTab, tabIndex: lastIndex, isPending: true });
      }

      return steps;
    });

    const getTabTitle = (tab: CascaderTab, tabIndex: number) => {
      const placeholder = props.placeholder || t('select');
      return tab.selected ? tab.selected[textKey] : placeholder;
    };

    const getStepTitle = (tab: CascaderTab, tabIndex: number) => {
      const placeholder = props.placeholder || t('select');

      if (slots['step-title']) {
        return slots['step-title']({
          tabIndex,
          selected: tab.selected,
          tab,
        });
      }

      return tab.selected ? tab.selected[textKey] : placeholder;
    };

    const onClickStep = (tabIndex: number) => {
      const tab = tabs.value[tabIndex];
      if (!tab?.selected || tabIndex === activeTab.value) {
        return;
      }

      activeTab.value = tabIndex;
      emit('clickTab', tabIndex, tab.selected[textKey]);
    };

    const renderHeader = () =>
      props.showHeader ? (
        <div class={bem('header')}>
          <h2 class={[bem('title'), 'van-ellipsis']}>
            {slots.title ? slots.title() : props.title}
          </h2>
          {props.closeable ? (
            <Icon
              name={props.closeIcon}
              class={[bem('close-icon'), HAPTICS_FEEDBACK]}
              onClick={onClose}
            />
          ) : null}
        </div>
      ) : null;

    const renderTitleExtra = () =>
      slots['title-extra'] ? (
        <div class={bem('title-extra')}>{slots['title-extra']()}</div>
      ) : null;

    const renderOption = (
      option: CascaderOption,
      selectedOption: CascaderOption | null,
      tabIndex: number,
      indexChar: string,
      usePinyinIndex: boolean,
    ) => {
      const { disabled } = option;
      const selected = !!(
        selectedOption && option[valueKey] === selectedOption[valueKey]
      );
      const color = option.color || (selected ? props.activeColor : undefined);

      const Text = slots.option ? (
        slots.option({ option, selected })
      ) : (
        <span>{option[textKey]}</span>
      );

      const SelectedIcon = selected ? (
        <Icon name="success" class={bem('selected-icon')} />
      ) : null;

      return (
        <li
          ref={selected ? setSelectedElementRefs(tabIndex) : undefined}
          role="menuitemradio"
          class={[
            bem('option', {
              selected,
              disabled,
              indexed: usePinyinIndex,
            }),
            option.className,
          ]}
          style={{ color }}
          tabindex={disabled ? undefined : selected ? 0 : -1}
          aria-checked={selected}
          aria-disabled={disabled || undefined}
          onClick={() => onSelect(option, tabIndex)}
        >
          {usePinyinIndex ? (
            <>
              {indexChar ? (
                <span class={bem('option-index')}>{indexChar}</span>
              ) : (
                <span class={bem('option-index', 'placeholder')} />
              )}
              <div class={bem('option-content')}>
                {Text}
                {SelectedIcon}
              </div>
            </>
          ) : (
            <>
              {Text}
              {SelectedIcon}
            </>
          )}
        </li>
      );
    };

    const renderOptions = (
      options: CascaderOption[],
      selectedOption: CascaderOption | null,
      tabIndex: number,
    ) => {
      const processedOptions = processOptions(options);
      const usePinyinIndex = processedOptions.some((item) => item.index);

      return (
        <ul role="menu" class={bem('options')}>
          {processedOptions.map(({ option, index }) =>
            renderOption(
              option,
              selectedOption,
              tabIndex,
              index,
              usePinyinIndex,
            ),
          )}
        </ul>
      );
    };

    const renderSteps = () => {
      if (!displayStepTabs.value.length) {
        return null;
      }

      return (
        <div class={bem('steps')}>
          {displayStepTabs.value.map(({ tab, tabIndex, isPending }, index) => {
            const isActive = tabIndex === activeTab.value;
            const isSelected = !!tab.selected;
            const title = getStepTitle(tab, tabIndex);

            return (
              <div
                key={tabIndex}
                class={bem('step', {
                  active: isActive,
                  selected: isSelected,
                  pending: isPending,
                  clickable: isSelected && !isActive,
                })}
                onClick={() => onClickStep(tabIndex)}
              >
                <div class={bem('step-indicator')}>
                  <div class={bem('step-track')}>
                    <span class={bem('step-dot')} />
                    {index < displayStepTabs.value.length - 1 ? (
                      <span class={bem('step-line')} />
                    ) : null}
                  </div>
                </div>
                <div class={bem('step-content')}>
                  <span class={bem('step-title')}>{title}</span>
                  {isSelected && !isActive ? (
                    <Icon name="arrow" class={bem('step-arrow')} />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    const renderTab = (tab: CascaderTab, tabIndex: number) => {
      const { options, selected } = tab;
      const title = getTabTitle(tab, tabIndex);

      return (
        <Tab
          title={title}
          titleClass={bem('tab', {
            unselected: !selected,
          })}
        >
          {slots['options-top']?.({ tabIndex })}
          {renderOptions(options, selected, tabIndex)}
          {slots['options-bottom']?.({ tabIndex })}
        </Tab>
      );
    };

    const renderTabs = () => (
      <>
        {isStepsLayout.value ? renderSteps() : null}
        <Tabs
          v-model:active={activeTab.value}
          shrink
          animated
          class={bem('tabs', { steps: isStepsLayout.value })}
          color={props.activeColor}
          swipeable={isStepsLayout.value ? false : props.swipeable}
          showHeader={!isStepsLayout.value}
          onClickTab={onClickTab}
        >
          {tabs.value.map(renderTab)}
        </Tabs>
      </>
    );

    const scrollIntoView = (el: HTMLElement) => {
      const scrollParent = el.parentElement;

      if (scrollParent) {
        scrollParent.scrollTop =
          el.offsetTop - (scrollParent.offsetHeight - el.offsetHeight) / 2;
      }
    };

    updateTabs();
    watch(activeTab, (value) => {
      const el = selectedElementRefs.value[value];
      if (el) scrollIntoView(el);
    });
    watch(() => props.options, updateTabs, { deep: true });
    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) {
          const values = tabs.value.map((tab) => tab.selected?.[valueKey]);
          if (values.includes(value)) {
            return;
          }
        }
        updateTabs();
      },
    );

    return () => (
      <div class={bem({ steps: isStepsLayout.value })}>
        {renderHeader()}
        {renderTitleExtra()}
        {renderTabs()}
      </div>
    );
  },
});
