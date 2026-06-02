import { defineComponent, type PropType } from 'vue';
import { createNamespace } from '../../utils';
import { Field } from '../../field';
import UploaderFile from '../../uploader-file';
import type { FieldProps } from '../../field/Field';
import { builtinFieldProps } from './shared';
import { FieldInputBridge } from './FieldInputBridge';
import type { UploaderFileListItem } from '../../uploader/types';

const [, bem] = createNamespace('pro-form-uploader-file');

const proFormUploaderFileFieldProps = {
  ...builtinFieldProps,
  modelValue: {
    type: Array as PropType<UploaderFileListItem[]>,
    default: () => [],
  },
  fieldProps: {
    type: Object as PropType<Partial<FieldProps>>,
    default: () => ({}),
  },
};

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
            ...props.fieldSlots,
          }}
        </Field>
      );
    };
  },
});
