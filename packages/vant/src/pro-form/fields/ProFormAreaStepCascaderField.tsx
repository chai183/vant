import { ref, defineComponent } from 'vue';
import { Field } from '../../field';
import { Popup } from '../../popup';
import AreaStepCascader from '../../area-step-cascader/AreaStepCascader';
import type { CascaderOption } from '../../cascader';
import type { Numeric } from '../../utils';
import { builtinFieldProps, defaultPopupProps, useFormFieldDisabled } from './shared';

export default defineComponent({
  name: 'ProFormAreaStepCascaderField',

  props: builtinFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const cascaderValue = ref<Numeric>('');
    const { guardOpen } = useFormFieldDisabled(() => props.fieldProps);

    const onFinish = ({
      selectedOptions,
    }: {
      value: Numeric;
      selectedOptions: CascaderOption[];
    }) => {
      emit(
        'update:modelValue',
        selectedOptions.map((item) => item.text).join('/'),
      );
      show.value = false;
    };

    const onClose = () => {
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
            <AreaStepCascader
              {...props.componentProps}
              modelValue={cascaderValue.value}
              onUpdate:modelValue={(v: Numeric) => {
                cascaderValue.value = v;
              }}
              onClose={onClose}
              onFinish={onFinish}
            />
          </Popup>
        </>
      );
    };
  },
});
