import { ref, defineComponent, type PropType } from 'vue';
import { Field } from '../../field';
import { Popup } from '../../popup';
import { CheckboxGroup } from '../../checkbox-group';
import {
  defaultPopupProps,
  useFormFieldState,
  getFormFieldOptions,
  resolveOptionLabels,
} from './shared';
import type { FieldProps } from '../../field/Field';

const proFormCheckboxFieldProps = {
  modelValue: {
    type: Array as PropType<unknown[]>,
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

export default defineComponent({
  name: 'ProFormCheckboxField',

  props: proFormCheckboxFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const { guardOpen, isDisabled, isReadonly } = useFormFieldState(
      () => props.fieldProps,
    );

    const getModelValue = () =>
      Array.isArray(props.modelValue) ? props.modelValue : [];

    const onChange = (value: unknown[]) => {
      if (isDisabled() || isReadonly()) {
        return;
      }
      emit('update:modelValue', value);
    };

    const open = () => {
      guardOpen(() => {
        show.value = true;
      });
    };

    return () => {
      const { options: _options, ...checkboxProps } = props.componentProps;
      const { placeholder, ...restFieldProps } = props.fieldProps;
      const options = getFormFieldOptions(props.componentProps);
      const locked = isDisabled() || isReadonly();
      const modelValue = getModelValue();
      const displayValue = resolveOptionLabels(options, modelValue);
      const isList = !!checkboxProps.isList;

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
              <CheckboxGroup
                {...checkboxProps}
                disabled={locked}
                modelValue={modelValue}
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
