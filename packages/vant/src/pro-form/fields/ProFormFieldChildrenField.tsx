import { ref, defineComponent, inject, type PropType } from 'vue';
import { createNamespace, FORM_KEY } from '../../utils';
import { Field } from '../../field';
import FieldChildren from '../../field-children';
import type { FieldProps } from '../../field/Field';
import type { FieldChildrenInstance } from '../../field-children/types';
import type { ProFormFieldSlots } from '../resolveFieldSlots';
import { createNestedItemRender } from '../renderColumnShared';
import type { ProFormFieldChildrenRowItem } from '../types';
import { useFormFieldState } from './shared';

const [, bem] = createNamespace('pro-form-field-children');

const proFormFieldChildrenFieldProps = {
  modelValue: {
    type: Array as PropType<unknown[]>,
    default: () => [''],
  },
  fieldProps: {
    type: Object as PropType<Partial<FieldProps>>,
    default: () => ({}),
  },
  componentProps: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },
  fieldSlots: {
    type: Object as PropType<ProFormFieldSlots>,
    default: () => ({}),
  },
};

export default defineComponent({
  name: 'ProFormFieldChildrenField',

  props: proFormFieldChildrenFieldProps,

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const form = inject(FORM_KEY, null);
    const fieldChildrenRef = ref<FieldChildrenInstance>();
    const { isLocked } = useFormFieldState(() => props.fieldProps);

    const resolveRow = (item: unknown) => {
      if (item == null) {
        return undefined;
      }
      return createNestedItemRender(item as ProFormFieldChildrenRowItem, {
        formDisabled: form?.props.disabled,
        formReadonly: form?.props.readonly,
      });
    };

    return () => {
      const {
        addText = '添加',
        showAdd = true,
        row,
        ...fieldChildrenProps
      } = props.componentProps;
      const { labelAlign = 'top', ...restFieldProps } = props.fieldProps;
      const modelValue = Array.isArray(props.modelValue)
        ? props.modelValue
        : [''];

      return (
        <Field
          {...restFieldProps}
          labelAlign={labelAlign}
          class={bem()}
        >
          {{
            'label-action':
              showAdd &&
              (() => (
                <button
                  type="button"
                  class={['van-field__label-action', bem('add')]}
                  disabled={
                    isLocked() || !fieldChildrenRef.value?.canAdd()
                  }
                  onClick={() => fieldChildrenRef.value?.add()}
                >
                  {addText}
                </button>
              )),
            input: () => (
              <FieldChildren
                ref={fieldChildrenRef}
                {...fieldChildrenProps}
                row={resolveRow(row)}
                modelValue={modelValue}
                onUpdate:modelValue={(value: unknown[]) =>
                  emit('update:modelValue', value)
                }
              />
            ),
            ...props.fieldSlots,
          }}
        </Field>
      );
    };
  },
});
