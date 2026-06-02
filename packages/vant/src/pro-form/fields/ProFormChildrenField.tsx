import { defineComponent, type PropType } from 'vue';
import FieldChildren from '../../field-children';
import type { FieldProps } from '../../field/Field';

const builtinChildrenProps = {
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
};

export default defineComponent({
  name: 'ProFormChildrenField',

  props: builtinChildrenProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    return () => (
      <FieldChildren
        {...props.fieldProps}
        {...props.componentProps}
        modelValue={props.modelValue}
        onUpdate:modelValue={(value: unknown[]) =>
          emit('update:modelValue', value)
        }
      />
    );
  },
});
