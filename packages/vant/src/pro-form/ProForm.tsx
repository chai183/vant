import {
  ref,
  watch,
  computed,
  defineComponent,
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
import {
  mergeFieldSlots,
  resolveColumnFieldSlots,
  resolveFieldSlots,
} from './resolveFieldSlots';
import {
  buildRenderContext,
  isBuiltinFieldComponent,
  isBuiltinInputComponent,
  renderCustomNode,
} from './renderColumnShared';
import type {
  ProFormColumn,
  ProFormComponentMap,
  ProFormComponentRender,
  ProFormRenderContext,
} from './types';

const [name, bem] = createNamespace('pro-form');

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
  inset: {
    type: Boolean,
    default: false,
  },
  showSubmit: truthProp,
  submitText: makeStringProp('提交'),
});

export type ProFormProps = ExtractPropTypes<typeof proFormProps>;

/** 根据 columns 配置生成初始 model，未指定 defaultValue 时按 component 类型取内置默认值 */
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

/** hidden 支持布尔值或函数，函数形式可基于当前 model 做联动显隐 */
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

export default defineComponent({
  name,

  props: proFormProps,

  emits: ['submit', 'failed', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const formRef = ref<FormInstance>();
    // 非受控模式下的内部 model；受控时与 props.modelValue 合并使用
    const innerModel = ref<Record<string, unknown>>({});

    /** columns 变化时合并默认值与当前值，保证新增字段有初始值且已有值不丢失 */
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

    // 受控优先：传入 modelValue 时以外部为准，否则使用 innerModel
    const model = computed(() => props.modelValue ?? innerModel.value);

    /** 统一字段更新入口，同步 innerModel 并向外 emit update:modelValue */
    const setFieldValue = (name: string, value: unknown) => {
      const next = { ...model.value, [name]: value };
      innerModel.value = next;
      emit('update:modelValue', next);
    };

    /**
     * Form 提交时 getValues 可能返回展示用 label 而非 option value，
     * 以 ProForm 维护的 model 为准覆盖同名字段
     */
    const mergeFormValues = (values: Record<string, unknown> = {}) => ({
      ...values,
      ...model.value,
    });

    /** 从 props.components 中按 column.component 查找全局注册的自定义渲染器 */
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

    const createRenderContext = (column: ProFormColumn): ProFormRenderContext =>
      buildRenderContext(column, {
        model: model.value,
        value: model.value[column.name],
        setValue: (next) => setFieldValue(column.name, next),
        formDisabled: props.disabled,
        formReadonly: props.readonly,
      });

    /**
     * 渲染 Field 的 input 插槽内容，优先级：
     * input-${slot} 插槽 > components 注册 > 内置 input 控件
     */
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

    const getColumnFieldSlots = (column: ProFormColumn) => {
      const ctx = createRenderContext(column);
      const slotName = column.slot ?? column.name;
      return mergeFieldSlots(
        resolveColumnFieldSlots(column, ctx),
        resolveFieldSlots(slots, slotName),
      );
    };

    /**
     * 用 Field 包裹自定义 input 内容。
     * bindModelValue：部分 render 返回的控件需要 Field 层也绑定 v-model（如文本类）
     */
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
      // 仅对 string / number / array 类型在 Field 层绑定 modelValue
      const bindModel =
        options?.bindModelValue &&
        (typeof value === 'string' ||
          typeof value === 'number' ||
          Array.isArray(value));
      const fieldSlots = getColumnFieldSlots(column);

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
            ...fieldSlots,
          }}
        </Field>
      );
    };

    /**
     * 单列渲染分发，优先级：
     * hidden 跳过 > field-${slot} 整项插槽 > column.render >
     * 内置 field 控件 > 原生 field 输入 > Field + input 插槽（内置 input / 自定义）
     */
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
          fieldSlots: getColumnFieldSlots(column),
          formDisabled: props.disabled,
          formReadonly: props.readonly,
        });
      }

      if (!column.component || column.component === 'field') {
        const fieldSlots = getColumnFieldSlots(column);
        return (
          <Field
            {...fieldProps}
            modelValue={model.value[column.name] as string}
            onUpdate:modelValue={(value: unknown) =>
              setFieldValue(column.name, value)
            }
          >
            {{
              ...fieldSlots,
            }}
          </Field>
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
      // 剥离 ProForm 专有 props，其余透传给底层 Form（rules、validateTrigger 等）
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
