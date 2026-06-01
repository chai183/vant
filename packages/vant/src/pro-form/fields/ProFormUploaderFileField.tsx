import { defineComponent, type PropType } from 'vue';
import { useCustomFieldValue } from '@vant/use';
import { createNamespace } from '../../utils';
import { Field } from '../../field';
import UploaderFile from '../../uploader-file';
import type { FieldProps } from '../../field/Field';
import type { UploaderFileListItem } from '../../uploader/types';

const [, bem] = createNamespace('pro-form-uploader-file');

const proFormUploaderFileFieldProps = {
  modelValue: {
    type: Array as PropType<UploaderFileListItem[]>,
    default: () => [],
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
  name: 'ProFormUploaderFileInputBridge',

  props: {
    modelValue: {
      type: Array as PropType<UploaderFileListItem[]>,
      required: true,
    },
  },

  setup(props, { slots }) {
    useCustomFieldValue(() => props.modelValue);
    return () => slots.default?.();
  },
});

export default defineComponent({
  name: 'ProFormUploaderFileField',

  props: proFormUploaderFileFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit, slots }) {
    return () => {
      const { labelAlign = 'top', ...restFieldProps } = props.fieldProps;
      const modelValue = Array.isArray(props.modelValue)
        ? props.modelValue
        : [];

      return (
        <Field
          {...restFieldProps}
          labelAlign={labelAlign}
          class={bem()}
        >
          {{
            input: () => (
              <FieldInputBridge modelValue={modelValue}>
                <UploaderFile
                  {...props.componentProps}
                  modelValue={modelValue}
                  onUpdate:modelValue={(value: UploaderFileListItem[]) =>
                    emit('update:modelValue', value)
                  }
                >
                  {slots}
                </UploaderFile>
              </FieldInputBridge>
            ),
          }}
        </Field>
      );
    };
  },
});
