import { defineComponent, inject, type PropType } from 'vue';
import { createNamespace, FORM_KEY, getModelValuePair } from '../../utils';
import { Field } from '../../field';
import RangeInput from '../../range-input';
import type { FieldProps } from '../../field/Field';
import type { ProFormFieldSlots } from '../resolveFieldSlots';
import { createNestedItemRender } from '../renderColumnShared';
import type { ProFormRangeInputItem } from '../types';
const [, bem] = createNamespace('range-input');

const proFormRangeInputFieldProps = {
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => ['', ''],
  },
  fieldProps: {
    type: Object as PropType<Partial<FieldProps>>,
    default: () => ({}),
  },
  componentProps: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
  fieldSlots: {
    type: Object as PropType<ProFormFieldSlots>,
    default: () => ({}),
  },
};

export default defineComponent({
  name: 'ProFormRangeInputField',

  props: proFormRangeInputFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const form = inject(FORM_KEY, null);

    const resolveRangeItem = (item: unknown) => {
      if (item == null) {
        return undefined;
      }
      return createNestedItemRender(item as ProFormRangeInputItem, {
        formDisabled: form?.props.disabled,
        formReadonly: form?.props.readonly,
      });
    };

    return () => {
      const { start, end, ...rangeInputProps } = props.componentProps;
      const { labelAlign = 'top', ...restFieldProps } = props.fieldProps;
      const modelValue = getModelValuePair(props.modelValue);

      return (
        <Field
          {...restFieldProps}
          labelAlign={labelAlign}
          class={bem('field')}
        >
          {{
            input: () => (
              <RangeInput
                {...rangeInputProps}
                start={resolveRangeItem(start)}
                end={resolveRangeItem(end)}
                modelValue={modelValue}
                onUpdate:modelValue={(value: string[]) =>
                  emit('update:modelValue', value)
                }
              />
            ),
            ...props.fieldSlots,
          }}
        </Field>
      );
    };
  },
});
