import { ref, defineComponent } from 'vue';
import { Field } from '../../field';
import { Popup } from '../../popup';
import DatePicker from '../../date-picker';
import type { PickerConfirmEventParams } from '../../picker';
import { builtinFieldProps, defaultPopupProps, useFormFieldDisabled } from './shared';

export default defineComponent({
  name: 'ProFormDatePickerField',

  props: builtinFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const pickerValue = ref<string[]>([]);
    const { guardOpen } = useFormFieldDisabled(() => props.fieldProps);

    const onConfirm = ({ selectedValues }: PickerConfirmEventParams) => {
      emit('update:modelValue', selectedValues.join('/'));
      pickerValue.value = selectedValues as string[];
      show.value = false;
    };

    const onCancel = () => {
      show.value = false;
    };

    const open = () => {
      guardOpen(() => {
        show.value = true;
      });
    };

    return () => {
      const { placeholder, ...restFieldProps } = props.fieldProps;

      return (
        <>
          <Field
            {...restFieldProps}
            modelValue={props.modelValue}
            readonly
            is-link
            placeholder={placeholder}
            onClickInput={open}
          />
          <Popup
            {...defaultPopupProps}
            show={show.value}
            onUpdate:show={(v: boolean) => {
              show.value = v;
            }}
          >
            <DatePicker
              {...props.componentProps}
              modelValue={pickerValue.value}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
          </Popup>
        </>
      );
    };
  },
});
