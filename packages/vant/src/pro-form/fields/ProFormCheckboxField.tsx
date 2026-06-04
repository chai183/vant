import { ref, defineComponent, type PropType } from 'vue';
import { omit } from '../../utils';
import { Field } from '../../field';
import { Popup } from '../../popup';
import { CheckboxGroup } from '../../checkbox-group';
import {
  defaultPopupProps,
  resolveFieldPopupProps,
  useFormFieldState,
  getFormFieldOptions,
  resolveOptionLabels,
  builtinFieldProps,
} from './shared';
import type { FieldProps } from '../../field/Field';

const proFormCheckboxFieldProps = {
  ...builtinFieldProps,
  modelValue: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },
  fieldProps: {
    type: Object as PropType<Partial<FieldProps>>,
    default: () => ({}),
  },
};

export default defineComponent({
  name: 'ProFormCheckboxField',

  props: proFormCheckboxFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const show = ref(false);
    const draft = ref<unknown[]>([]);
    const { guardOpen, isDisabled, isReadonly } = useFormFieldState(
      () => props.fieldProps,
    );

    const getModelValue = () =>
      Array.isArray(props.modelValue) ? props.modelValue : [];

    const syncDraftFromModel = () => {
      draft.value = [...getModelValue()];
    };

    const onDraftChange = (value: unknown[]) => {
      if (isDisabled() || isReadonly()) {
        return;
      }
      draft.value = value;
    };

    const onConfirm = () => {
      if (isDisabled() || isReadonly()) {
        return;
      }
      emit('update:modelValue', [...draft.value]);
    };

    const open = () => {
      guardOpen(() => {
        syncDraftFromModel();
        show.value = true;
      });
    };

    return () => {
      const label = props.fieldProps.label;
      const options = getFormFieldOptions(props.componentProps);
      const modelValue = getModelValue();
      const { popupHeaderProps, restComponentProps } = resolveFieldPopupProps(
        props.componentProps,
        {
          fallbackTitle:
            label !== undefined && label !== null ? String(label) : undefined,
          confirmable: true,
        },
      );
      const checkboxProps = omit(restComponentProps, ['options']);
      const locked = isDisabled() || isReadonly();
      const displayValue = resolveOptionLabels(options, modelValue);

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
            onConfirm={onConfirm}
          >
            <div
              class={[
                'van-pro-form-field-popup-body',
                checkboxProps.isList && 'van-pro-form-field-popup-body--list',
              ]}
            >
              <CheckboxGroup
                {...checkboxProps}
                disabled={locked}
                modelValue={draft.value}
                options={options}
                onUpdate:modelValue={onDraftChange}
              />
            </div>
          </Popup>
        </>
      );
    };
  },
});
