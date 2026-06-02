import { ref, defineComponent, type PropType } from 'vue';
import { createNamespace } from '../../utils';
import { Field } from '../../field';
import FieldChildren from '../../field-children';
import type { FieldProps } from '../../field/Field';
import type { FieldChildrenInstance } from '../../field-children/types';
import type { ProFormFieldSlots } from '../resolveFieldSlots';
import { FieldInputBridge } from './FieldInputBridge';
import { useFormFieldState } from './shared';

const [, bem] = createNamespace('pro-form-field-children');

const proFormFieldChildrenFieldProps = {
  modelValue: {
    type: Array as PropType<unknown[]>,
    default: () => [''],
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
  name: 'ProFormFieldChildrenField',

  props: proFormFieldChildrenFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const fieldChildrenRef = ref<FieldChildrenInstance>();
    const { isLocked } = useFormFieldState(() => props.fieldProps);

    return () => {
      const { addText = '添加', showAdd = true, ...fieldChildrenProps } =
        props.componentProps;
      const { labelAlign = 'top', ...restFieldProps } = props.fieldProps;
      const modelValue = Array.isArray(props.modelValue)
        ? props.modelValue
        : [''];

      return (
        <Field
          {...restFieldProps}
          labelAlign={labelAlign}
          class={bem()}
        >
          {{
            'label-action':
              showAdd &&
              (() => (
                <button
                  type="button"
                  class={['van-field__label-action', bem('add')]}
                  disabled={
                    isLocked() || !fieldChildrenRef.value?.canAdd()
                  }
                  onClick={() => fieldChildrenRef.value?.add()}
                >
                  {addText}
                </button>
              )),
            input: () => (
              <FieldInputBridge modelValue={modelValue}>
                <FieldChildren
                  ref={fieldChildrenRef}
                  {...fieldChildrenProps}
                  modelValue={modelValue}
                  onUpdate:modelValue={(value: unknown[]) =>
                    emit('update:modelValue', value)
                  }
                />
              </FieldInputBridge>
            ),
            ...props.fieldSlots,
          }}
        </Field>
      );
    };
  },
});
