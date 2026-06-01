import { defineComponent, type PropType } from 'vue';
import { useCustomFieldValue } from '@vant/use';
import { createNamespace, getModelValuePair } from '../../utils';
import { Field } from '../../field';
import RangeInput from '../../range-input';
import type { FieldProps } from '../../field/Field';

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
};

/** 须在 Field #input 内挂载，以便 useCustomFieldValue 注入父级 Field */
const FieldInputBridge = defineComponent({
  name: 'FieldInputBridge',

  props: {
    modelValue: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },

  setup(props, { slots }) {
    useCustomFieldValue(() => props.modelValue);
    return () => slots.default?.();
  },
});

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
              <FieldInputBridge modelValue={modelValue}>
                <RangeInput
                  {...props.componentProps}
                  modelValue={modelValue}
                  onUpdate:modelValue={(value: string[]) =>
                    emit('update:modelValue', value)
                  }
                />
              </FieldInputBridge>
            ),
          }}
        </Field>
      );
    };
  },
});
