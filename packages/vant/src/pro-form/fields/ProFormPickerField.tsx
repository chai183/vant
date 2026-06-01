import { ref, defineComponent } from 'vue';
import { Field } from '../../field';
import { Popup } from '../../popup';
import Picker from '../../picker';
import type {
  PickerColumn,
  PickerConfirmEventParams,
  PickerOption,
} from '../../picker';
import type { Numeric } from '../../utils';
import { builtinFieldProps, defaultPopupProps, useFormFieldDisabled } from './shared';

export default defineComponent({
  name: 'ProFormPickerField',

  props: builtinFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const pickerValue = ref<Numeric[]>([]);
    const { guardOpen } = useFormFieldDisabled(() => props.fieldProps);

    const onConfirm = ({
      selectedValues,
      selectedOptions,
    }: PickerConfirmEventParams) => {
      emit('update:modelValue', selectedOptions[0]?.text || '');
      pickerValue.value = selectedValues;
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
      const { columns, ...pickerProps } = props.componentProps;
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
            <Picker
              {...pickerProps}
              columns={
                columns as (PickerColumn | PickerOption)[] | undefined
              }
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
