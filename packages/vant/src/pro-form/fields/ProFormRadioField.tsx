import { ref, defineComponent } from 'vue';
import { omit } from '../../utils';
import { Field } from '../../field';
import { Popup } from '../../popup';
import { RadioGroup } from '../../radio-group';
import {
  builtinFieldProps,
  defaultPopupProps,
  resolveFieldPopupProps,
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
      const label = props.fieldProps.label;
      const options = getFormFieldOptions(props.componentProps);
      const { popupHeaderProps, restComponentProps } = resolveFieldPopupProps(
        props.componentProps,
        {
          fallbackTitle:
            label !== undefined && label !== null ? String(label) : undefined,
          closeable: true,
        },
      );
      const radioProps = omit(restComponentProps, ['options']);
      const locked = isDisabled() || isReadonly();
      const displayValue = props.modelValue
        ? resolveOptionLabel(options, props.modelValue)
        : '';

      return (
        <>
          <Field
            {...props.fieldProps}
            modelValue={displayValue}
            readonly
            is-link
            onClickInput={open}
          >
            {{ ...props.fieldSlots }}
          </Field>
          <Popup
            {...defaultPopupProps}
            {...popupHeaderProps}
            show={show.value}
            onUpdate:show={(v: boolean) => {
              show.value = v;
            }}
          >
            <div
              class={[
                'van-pro-form-field-popup-body',
                radioProps.isList && 'van-pro-form-field-popup-body--list',
              ]}
            >
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
