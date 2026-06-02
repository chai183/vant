import { defineComponent } from 'vue';
import FieldMoney from '../../field-money';
import { builtinFieldProps } from './shared';

export default defineComponent({
  name: 'ProFormMoneyField',

  props: builtinFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    return () => {
      const { label, placeholder, ...restFieldProps } = props.fieldProps;

      return (
        <FieldMoney
          {...restFieldProps}
          {...props.componentProps}
          label={label != null ? String(label) : undefined}
          placeholder={placeholder}
          modelValue={props.modelValue}
          onUpdate:modelValue={(value: string | number) =>
            emit('update:modelValue', value)
          }
        >
          {{ ...props.fieldSlots }}
        </FieldMoney>
      );
    };
  },
});
