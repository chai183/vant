import {
  ref,
  watch,
  computed,
  defineComponent,
  h,
  type PropType,
  type ExtractPropTypes,
  type VNode,
  type Component,
} from 'vue';

// Utils
import { extend, truthProp, makeStringProp, createNamespace } from '../utils';

// Composables
import { useExpose } from '../composables/use-expose';

// Components
import { Form, formProps } from '../form';
import { Field } from '../field';
import { CellGroup } from '../cell-group';
import { Button } from '../button';

// Types
import type { FormExpose, FormInstance } from '../form/types';
import { renderBuiltinInput } from './renderBuiltinInput';
import { renderBuiltinField } from './renderBuiltinField';
import { getDefaultValueByComponent } from './getDefaultValue';
import { mergeRenderBindProps } from './mergeRenderBindProps';
import {
  resolveFormDisabled,
  resolveFormReadonly,
} from './resolveFormState';
import type {
  ProFormColumn,
  ProFormComponentMap,
  ProFormComponentRender,
  ProFormRenderContext,
} from './types';

const [name, bem] = createNamespace('pro-form');

const BUILTIN_INPUT_COMPONENTS = new Set([
  'switch',
  'checkbox',
  'checkboxGroup',
  'radio',
  'stepper',
  'rate',
  'slider',
  'uploader',
]);

const BUILTIN_FIELD_COMPONENTS = new Set([
  'picker',
  'radioPicker',
  'checkboxPicker',
  'datePicker',
  'area',
  'areaStepCascader',
  'calendar',
  'fieldMoney',
  'fieldChildren',
  'rangeInput',
  'uploaderFile',
]);

export const proFormProps = extend({}, formProps, {
  columns: {
    type: Array as PropType<ProFormColumn[]>,
    default: () => [],
  },
  modelValue: {
    type: Object as PropType<Record<string, unknown>>,
    default: undefined,
  },
  /** 扩展控件：key 为 column.component */
  components: {
    type: Object as PropType<ProFormComponentMap>,
    default: () => ({}),
  },
  inset: truthProp,
  showSubmit: truthProp,
  submitText: makeStringProp('提交'),
});

export type ProFormProps = ExtractPropTypes<typeof proFormProps>;

function buildDefaultModel(columns: ProFormColumn[]) {
  return columns.reduce<Record<string, unknown>>((model, column) => {
    if (!column.name) {
      return model;
    }
    model[column.name] =
      column.defaultValue ??
      getDefaultValueByComponent(column.component ?? '');
    return model;
  }, {});
}

function isColumnHidden(
  column: ProFormColumn,
  model: Record<string, unknown>,
) {
  const { hidden } = column;
  if (typeof hidden === 'function') {
    return hidden(model);
  }
  return !!hidden;
}

function isBuiltinInputComponent(component: string) {
  return BUILTIN_INPUT_COMPONENTS.has(component);
}

function isBuiltinFieldComponent(component: string) {
  return BUILTIN_FIELD_COMPONENTS.has(component);
}

export default defineComponent({
  name,

  props: proFormProps,

  emits: ['submit', 'failed', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const formRef = ref<FormInstance>();
    const innerModel = ref<Record<string, unknown>>({});

    const syncInnerFromColumns = () => {
      const defaults = buildDefaultModel(props.columns);
      const current = props.modelValue ?? innerModel.value;
      innerModel.value = { ...defaults, ...current };
    };

    watch(
      () => props.columns,
      () => syncInnerFromColumns(),
      { deep: true, immediate: true },
    );

    watch(
      () => props.modelValue,
      (value) => {
        if (value) {
          innerModel.value = { ...innerModel.value, ...value };
        }
      },
      { deep: true },
    );

    const model = computed(() => props.modelValue ?? innerModel.value);

    const setFieldValue = (name: string, value: unknown) => {
      const next = { ...model.value, [name]: value };
      innerModel.value = next;
      emit('update:modelValue', next);
    };

    const mergeFormValues = (values: Record<string, unknown> = {}) => ({
      ...values,
      ...model.value,
    });

    const resolveCustomRender = (
      column: ProFormColumn,
    ): ProFormComponentRender | Component | undefined => {
      const custom = column.component
        ? props.components[column.component]
        : undefined;
      if (custom) {
        return custom;
      }
      return undefined;
    };

    const createRenderContext = (column: ProFormColumn): ProFormRenderContext => {
      const value = model.value[column.name];
      const setValue = (next: unknown) => setFieldValue(column.name, next);
      const disabled = resolveFormDisabled(
        props.disabled,
        column.fieldProps,
        column.componentProps,
      );
      const readonly = resolveFormReadonly(
        props.readonly,
        column.fieldProps,
        column.componentProps,
      );

      return {
        column,
        model: model.value,
        value,
        disabled,
        readonly,
        setValue,
        bindProps: (extra) => ({
          ...column.componentProps,
          ...extra,
          column,
          model: model.value,
          modelValue: value,
          disabled: resolveFormDisabled(
            props.disabled,
            column.fieldProps,
            { ...column.componentProps, ...extra },
          ),
          readonly: resolveFormReadonly(
            props.readonly,
            column.fieldProps,
            { ...column.componentProps, ...extra },
          ),
          'onUpdate:modelValue': setValue,
        }),
      };
    };

    const renderCustomNode = (
      render: ProFormComponentRender | Component,
      ctx: ProFormRenderContext,
    ): VNode | VNode[] | null => {
      if (typeof render === 'function') {
        const node = (render as ProFormComponentRender)(ctx);
        return mergeRenderBindProps(node, ctx) as VNode | VNode[] | null;
      }
      return h(render as Component, ctx.bindProps());
    };

    const renderFieldInput = (column: ProFormColumn) => {
      const ctx = createRenderContext(column);

      const slotName = column.slot ?? column.name;
      const inputSlot = slots[`input-${slotName}`];
      if (inputSlot) {
        return inputSlot(ctx);
      }

      const customRender = resolveCustomRender(column);
      if (customRender) {
        return renderCustomNode(customRender, ctx);
      }

      if (column.component && isBuiltinInputComponent(column.component)) {
        return renderBuiltinInput(ctx);
      }

      return null;
    };

    const renderColumnWithField = (
      column: ProFormColumn,
      input: () => VNode | VNode[] | null,
      options?: { bindModelValue?: boolean },
    ) => {
      const fieldProps = {
        name: column.name,
        label: column.label,
        ...column.fieldProps,
      };
      const value = model.value[column.name];
      const bindModel =
        options?.bindModelValue &&
        (typeof value === 'string' ||
          typeof value === 'number' ||
          Array.isArray(value));

      return (
        <Field
          {...fieldProps}
          {...(bindModel
            ? {
                modelValue: value as string | number | unknown[],
                'onUpdate:modelValue': (v: unknown) =>
                  setFieldValue(column.name, v),
              }
            : {})}
        >
          {{
            input,
          }}
        </Field>
      );
    };

    const renderColumn = (column: ProFormColumn) => {
      if (isColumnHidden(column, model.value)) {
        return null;
      }

      const slotName = column.slot ?? column.name;
      const fieldSlot = slots[`field-${slotName}`];
      if (fieldSlot) {
        return fieldSlot({
          column,
          model: model.value,
          value: model.value[column.name],
          setValue: (value: unknown) => setFieldValue(column.name, value),
        });
      }

      if (column.render) {
        const ctx = createRenderContext(column);
        return renderColumnWithField(
          column,
          () => renderCustomNode(column.render!, ctx),
          { bindModelValue: true },
        );
      }

      const fieldProps = {
        name: column.name,
        label: column.label,
        ...column.fieldProps,
      };

      if (column.component && isBuiltinFieldComponent(column.component)) {
        return renderBuiltinField({
          column,
          value: model.value[column.name],
          setValue: (value) => setFieldValue(column.name, value),
          fieldProps,
          formDisabled: props.disabled,
          formReadonly: props.readonly,
        });
      }

      if (!column.component || column.component === 'field') {
        return (
          <Field
            {...fieldProps}
            modelValue={model.value[column.name] as string}
            onUpdate:modelValue={(value: unknown) =>
              setFieldValue(column.name, value)
            }
          />
        );
      }

      return renderColumnWithField(column, () => renderFieldInput(column));
    };

    const onSubmit = (values: Record<string, unknown>) => {
      // Field 展示 label 时 formValue 可能与 model 不一致，以 model（option value）为准
      emit('submit', mergeFormValues(values));
    };

    const onFailed = (errorInfo: {
      values: Record<string, unknown>;
      errors: unknown[];
    }) => {
      emit('failed', {
        ...errorInfo,
        values: mergeFormValues(errorInfo.values),
      });
    };

    useExpose<FormExpose>({
      submit: () => formRef.value?.submit(),
      validate: (name) =>
        formRef.value?.validate(name) ?? Promise.resolve(),
      getValues: () => mergeFormValues(formRef.value?.getValues() ?? {}),
      scrollToField: (name, options) =>
        formRef.value?.scrollToField(name, options),
      resetValidation: (name) => formRef.value?.resetValidation(name),
      getValidationStatus: () =>
        formRef.value?.getValidationStatus() ?? {},
    });

    return () => {
      const formBind = extend({}, props) as Record<string, unknown>;
      delete formBind.columns;
      delete formBind.modelValue;
      delete formBind.components;
      delete formBind.inset;
      delete formBind.showSubmit;
      delete formBind.submitText;

      return (
        <div class={bem()}>
          <Form
            ref={formRef}
            {...formBind}
            onSubmit={onSubmit}
            onFailed={onFailed}
          >
            <CellGroup inset={props.inset}>
              {props.columns.map((column) => renderColumn(column))}
              {slots.default?.()}
            </CellGroup>
            {(props.showSubmit || slots.submit || slots.footer) && (
              <div class={bem('footer')}>
                {slots.footer?.()}
                {slots.submit
                  ? slots.submit()
                  : props.showSubmit && (
                      <Button
                        round
                        block
                        type="primary"
                        nativeType="submit"
                        disabled={props.disabled}
                      >
                        {props.submitText}
                      </Button>
                    )}
              </div>
            )}
          </Form>
        </div>
      );
    };
  },
});
