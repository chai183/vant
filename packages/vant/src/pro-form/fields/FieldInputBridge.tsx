import { defineComponent, type PropType } from 'vue';
import { useCustomFieldValue } from '@vant/use';

/** 须在 Field #input 内挂载，以便 useCustomFieldValue 注入父级 Field */
export const FieldInputBridge = defineComponent({
  name: 'ProFormFieldInputBridge',

  props: {
    modelValue: {
      type: Array as PropType<unknown[]>,
      required: true,
    },
  },

  setup(props, { slots }) {
    useCustomFieldValue(() => props.modelValue);
    return () => slots.default?.();
  },
});
