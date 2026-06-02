import { computed, defineComponent, type ExtractPropTypes } from 'vue';

// Utils
import {
  numericProp,
  truthProp,
  makeArrayProp,
  makeStringProp,
  createNamespace,
  type Numeric,
} from '../utils';

// Components
import Cascader from '../cascader';

// Types
import type { CascaderOption } from '../cascader';
import { useCascaderAreaData } from '@vant/area-data';

const [name, bem, t] = createNamespace('area-step-cascader');

const defaultAreaOptions = useCascaderAreaData();

export const areaStepCascaderProps = {
  modelValue: numericProp,
  title: makeStringProp(''),
  options: makeArrayProp<CascaderOption>(),
  showHeader: truthProp,
};

export type AreaStepCascaderProps = ExtractPropTypes<
  typeof areaStepCascaderProps
>;

export default defineComponent({
  name,

  props: areaStepCascaderProps,

  emits: ['close', 'finish', 'update:modelValue'],

  setup(props, { slots, emit }) {
    const levelKeys = ['selectProvince', 'selectCity', 'selectDistrict'] as const;

    const levelTexts = computed(() =>
      levelKeys.map((key) => t(key)),
    );

    const getAreaLevelText = (tabIndex: number) =>
      levelTexts.value[tabIndex] ??
      levelTexts.value[levelTexts.value.length - 1];

    const getOptionText = (option: CascaderOption) =>
      option.text ?? (option.name as string | undefined);

    const cascaderOptions = computed(() =>
      props.options.length ? props.options : defaultAreaOptions,
    );

    const cascaderTitle = computed(() => props.title || t('selectArea'));

    const onUpdateModelValue = (value: Numeric) => {
      emit('update:modelValue', value);
    };

    return () => (
      <Cascader
        class={bem()}
        modelValue={props.modelValue}
        title={cascaderTitle.value}
        options={cascaderOptions.value}
        showHeader={props.showHeader}
        tabLayout="steps"
        onUpdate:modelValue={onUpdateModelValue}
        onClose={() => emit('close')}
        onFinish={(payload) => emit('finish', payload)}
      >
        {{
          'title-extra': slots['title-extra'],
          'step-title': ({
            tabIndex,
            selected,
          }: {
            tabIndex: number;
            selected: CascaderOption | null;
          }) =>
            selected ? getOptionText(selected) : getAreaLevelText(tabIndex),
          'options-top': ({ tabIndex }: { tabIndex: number }) => (
            <div class={bem('level')}>{getAreaLevelText(tabIndex)}</div>
          ),
        }}
      </Cascader>
    );
  },
});
