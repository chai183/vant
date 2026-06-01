import { ref, defineComponent } from 'vue';
import { Field } from '../../field';
import { Popup } from '../../popup';
import Area from '../../area';
import type { AreaList } from '../../area/types';
import type { PickerConfirmEventParams } from '../../picker';
import { builtinFieldProps, defaultPopupProps, useFormFieldDisabled } from './shared';

export default defineComponent({
  name: 'ProFormAreaField',

  props: builtinFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const areaCode = ref('');
    const { guardOpen } = useFormFieldDisabled(() => props.fieldProps);

    const onConfirm = ({
      selectedValues,
      selectedOptions,
    }: PickerConfirmEventParams) => {
      emit(
        'update:modelValue',
        selectedOptions.map((item) => item!.text).join('/'),
      );
      areaCode.value = selectedValues.length
        ? (selectedValues[selectedValues.length - 1] as string)
        : '';
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
      const { areaList, ...areaProps } = props.componentProps;
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
            <Area
              {...areaProps}
              areaList={areaList as AreaList | undefined}
              modelValue={areaCode.value}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
          </Popup>
        </>
      );
    };
  },
});
