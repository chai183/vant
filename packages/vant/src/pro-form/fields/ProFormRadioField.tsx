import { ref, defineComponent } from 'vue';
import { Field } from '../../field';
import { Popup } from '../../popup';
import { RadioGroup } from '../../radio-group';
import {
  builtinFieldProps,
  defaultPopupProps,
  useFormFieldState,
  getFormFieldOptions,
  resolveOptionLabel,
} from './shared';

export default defineComponent({
  name: 'ProFormRadioField',

  props: builtinFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const { guardOpen, isDisabled, isReadonly } = useFormFieldState(
      () => props.fieldProps,
    );

    const onChange = (value: string | number) => {
      if (isDisabled() || isReadonly()) {
        return;
      }
      emit('update:modelValue', value);
      show.value = false;
    };

    const open = () => {
      guardOpen(() => {
        show.value = true;
      });
    };

    return () => {
      const { options: _options, ...radioProps } = props.componentProps;
      const { placeholder, ...restFieldProps } = props.fieldProps;
      const options = getFormFieldOptions(props.componentProps);
      const locked = isDisabled() || isReadonly();
      const displayValue = props.modelValue
        ? resolveOptionLabel(options, props.modelValue)
        : '';
      const isList = !!radioProps.isList;

      return (
        <>
          <Field
            {...restFieldProps}
            modelValue={displayValue}
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
            <div style={{ padding: isList ? 0 : '16px 12px' }}>
              <RadioGroup
                {...radioProps}
                disabled={locked}
                modelValue={props.modelValue}
                options={options}
                onUpdate:modelValue={onChange}
              />
            </div>
          </Popup>
        </>
      );
    };
  },
});
