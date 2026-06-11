import { defineComponent, type PropType } from 'vue';
import { createNamespace, getModelValuePair } from '../../utils';
import { Field } from '../../field';
import RangeInput from '../../range-input';
import type { FieldProps } from '../../field/Field';
import type { ProFormFieldSlots } from '../resolveFieldSlots';
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
    return () => {
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
                {...props.componentProps}
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
