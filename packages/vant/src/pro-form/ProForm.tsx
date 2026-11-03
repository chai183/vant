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
import {
  extend,
  truthProp,
  makeStringProp,
  createNamespace,
  type Numeric,
} from '../utils';

// Composables
import { useExpose } from '../composables/use-expose';

// Components
import { Form, formProps } from '../form';
import { Field } from '../field';
import { CellGroup } from '../cell-group';
import { Button } from '../button';
import { Collapse } from '../collapse';
import { CollapseItem } from '../collapse-item';
import { showConfirmDialog } from '../dialog/function-call';

// Types
import type { FormExpose, FormInstance } from '../form/types';
import { renderBuiltinInput } from './renderBuiltinInput';
import { renderBuiltinField } from './renderBuiltinField';
import { getDefaultValueByComponent } from './getDefaultValue';
import {
  mergeFieldSlots,
  mergePopupSlots,
  resolveColumnFieldSlots,
  resolveColumnPopupSlots,
  resolveFieldSlots,
  resolvePopupSlots,
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
import {
  createCollapseGroupDefaultItem,
  getProFormGroupName,
  getProFormStructureTitle,
  isProFormStructureColumn,
  resolveProFormStructureKind,
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

/** 字段渲染作用域：根表单或可增删分组的某一项 */
type RenderScope = {
  getModel: () => Record<string, unknown>;
  setScopeValue: (fieldName: string, value: unknown) => void;
  namePrefix?: string;
};

/** 递归收集字段默认值（结构节点递归；collapse-group 初始化数组） */
function buildDefaultModel(columns: ProFormColumn[]): Record<string, unknown> {
  return columns.reduce<Record<string, unknown>>((model, column) => {
    const kind = resolveProFormStructureKind(column);
    if (kind === 'collapse-group' && column.name) {
      const min = Math.max(0, Number(column.min) || 0);
      const list =
        column.defaultValue != null
          ? (column.defaultValue as unknown[])
          : Array.from({ length: min }, () =>
              createCollapseGroupDefaultItem(column),
            );
      model[column.name] = list;
      return model;
    }
    if (isProFormStructureColumn(column)) {
      return {
        ...model,
        ...buildDefaultModel(column.content || []),
      };
    }
    if (!column.name) {
      return model;
    }
    model[column.name] =
      column.defaultValue ?? getDefaultValueByComponent(column.component ?? '');
    return model;
  }, {});
}

/** 收集静态折叠分组 name，默认全部展开 */
function collectGroupNames(
  columns: ProFormColumn[],
  names: Numeric[] = [],
  path = '',
): Numeric[] {
  columns.forEach((column, index) => {
    const kind = resolveProFormStructureKind(column);
    if (kind === 'group') {
      names.push(getProFormGroupName(column, `${path}group-${index}`));
    }
    if (column.content?.length && kind !== 'collapse-group') {
      collectGroupNames(column.content, names, `${path}${index}-`);
    }
  });
  return names;
}

/** 收集某前缀下的静态折叠分组 name（用于可增删项内部） */
function collectScopedGroupNames(
  columns: ProFormColumn[],
  namePrefix: string,
  names: Numeric[] = [],
  path = '',
): Numeric[] {
  columns.forEach((column, index) => {
    const kind = resolveProFormStructureKind(column);
    if (kind === 'group') {
      const rawName = getProFormGroupName(column, `${path}group-${index}`);
      names.push(`${namePrefix}.${rawName}`);
    }
    if (column.content?.length && kind !== 'collapse-group') {
      collectScopedGroupNames(
        column.content,
        namePrefix,
        names,
        `${path}${index}-`,
      );
    }
  });
  return names;
}

/** 收集可增删分组各项内部静态折叠的 name（外层条目不折叠） */
function collectCollapseGroupItemNames(
  columns: ProFormColumn[],
  formModel: Record<string, unknown>,
  names: Numeric[] = [],
): Numeric[] {
  columns.forEach((column) => {
    const kind = resolveProFormStructureKind(column);
    if (kind === 'collapse-group' && column.name) {
      const list = formModel[column.name];
      if (Array.isArray(list)) {
        list.forEach((_, index) => {
          collectScopedGroupNames(
            column.content || [],
            `${column.name}.${index}`,
            names,
          );
        });
      }
      return;
    }
    if (column.content?.length) {
      collectCollapseGroupItemNames(column.content, formModel, names);
    }
  });
  return names;
}

/** 当前 columns 是否包含结构节点 */
function hasStructureColumn(columns: ProFormColumn[]) {
  return columns.some((column) => isProFormStructureColumn(column));
}

/** hidden 支持布尔值或函数，函数形式可基于当前 model 做联动显隐 */
function isColumnHidden(column: ProFormColumn, model: Record<string, unknown>) {
  const { hidden } = column;
  if (typeof hidden === 'function') {
    return hidden(model);
  }
  return !!hidden;
}

function resolveFieldName(column: ProFormColumn, scope: RenderScope) {
  const fieldName = column.name ?? '';
  if (!fieldName) {
    return '';
  }
  return scope.namePrefix ? `${scope.namePrefix}.${fieldName}` : fieldName;
}

/**
 * 写入已有 model 并保持引用不变。
 * 父级若是 const reactive()，v-model 无法重新赋值；只 emit 新对象时增删分组不会生效。
 */
function writeModelField(
  model: Record<string, unknown>,
  fieldName: string,
  value: unknown,
) {
  model[fieldName] = value;
}

export default defineComponent({
  name,

  props: proFormProps,

  emits: ['submit', 'failed', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const formRef = ref<FormInstance>();
    // 非受控模式下的内部 model；受控时与 props.modelValue 合并使用
    const innerModel = ref<Record<string, unknown>>({});
    /** 折叠分组展开项，默认全部展开 */
    const activeNames = ref<Numeric[]>([]);

    /** columns 变化时合并默认值与当前值，保证新增字段有初始值且已有值不丢失 */
    const syncInnerFromColumns = () => {
      const defaults = buildDefaultModel(props.columns);
      const current = props.modelValue ?? innerModel.value;
      innerModel.value = { ...defaults, ...current };
      activeNames.value = collectGroupNames(props.columns);
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

    /** 仅对「首次出现」的可增删项默认展开，不覆盖用户已收起的项 */
    const knownCollapseItemNames = ref(new Set<Numeric>());
    watch(
      model,
      () => {
        const itemNames = collectCollapseGroupItemNames(
          props.columns,
          model.value,
        );
        const missing = itemNames.filter(
          (itemName) => !knownCollapseItemNames.value.has(itemName),
        );
        knownCollapseItemNames.value = new Set(itemNames);
        if (missing.length) {
          activeNames.value = [...activeNames.value, ...missing];
        }
      },
      { deep: true, immediate: true },
    );

    /** 统一字段更新入口。受控时写回原对象，见 writeModelField */
    const setFieldValue = (fieldName: string, value: unknown) => {
      if (props.modelValue) {
        writeModelField(props.modelValue, fieldName, value);
        emit('update:modelValue', props.modelValue);
        return;
      }
      const next = { ...innerModel.value, [fieldName]: value };
      innerModel.value = next;
      emit('update:modelValue', next);
    };

    const rootScope: RenderScope = {
      getModel: () => model.value,
      setScopeValue: setFieldValue,
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

    const createRenderContext = (
      column: ProFormColumn,
      scope: RenderScope,
    ): ProFormRenderContext => {
      const scopeModel = scope.getModel();
      return buildRenderContext(column, {
        model: scopeModel,
        value: column.name != null ? scopeModel[column.name] : undefined,
        setValue: (next) => {
          if (column.name != null) {
            scope.setScopeValue(column.name, next);
          }
        },
        formDisabled: props.disabled,
        formReadonly: props.readonly,
      });
    };

    /**
     * 渲染 Field 的 input 插槽内容，优先级：
     * input-${slot} 插槽 > components 注册 > 内置 input 控件
     */
    const renderFieldInput = (column: ProFormColumn, scope: RenderScope) => {
      const ctx = createRenderContext(column, scope);

      const slotName = column.slot ?? column.name;
      const inputSlot = slotName ? slots[`input-${slotName}`] : undefined;
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

    const getColumnFieldSlots = (column: ProFormColumn, scope: RenderScope) => {
      const ctx = createRenderContext(column, scope);
      const slotName = column.slot ?? column.name ?? '';
      return mergeFieldSlots(
        resolveColumnFieldSlots(column, ctx),
        resolveFieldSlots(slots, slotName),
      );
    };

    const getColumnPopupSlots = (column: ProFormColumn, scope: RenderScope) => {
      const ctx = createRenderContext(column, scope);
      const slotName = column.slot ?? column.name ?? '';
      return mergePopupSlots(
        resolveColumnPopupSlots(column, ctx),
        resolvePopupSlots(slots, slotName),
      );
    };

    /**
     * 用 Field 包裹自定义 input 内容。
     * bindModelValue：部分 render 返回的控件需要 Field 层也绑定 v-model（如文本类）
     */
    const renderColumnWithField = (
      column: ProFormColumn,
      scope: RenderScope,
      input: () => VNode | VNode[] | null,
      options?: { bindModelValue?: boolean },
    ) => {
      const fieldName = resolveFieldName(column, scope);
      const scopeModel = scope.getModel();
      const value = column.name != null ? scopeModel[column.name] : undefined;
      const fieldProps = {
        name: fieldName,
        label: column.label,
        ...column.fieldProps,
      };
      // 仅对 string / number / array 类型在 Field 层绑定 modelValue
      const bindModel =
        options?.bindModelValue &&
        (typeof value === 'string' ||
          typeof value === 'number' ||
          Array.isArray(value));
      const fieldSlots = getColumnFieldSlots(column, scope);

      return (
        <Field
          {...fieldProps}
          {...(bindModel
            ? {
                modelValue: value as string | number | unknown[],
                'onUpdate:modelValue': (v: unknown) => {
                  if (column.name != null) {
                    scope.setScopeValue(column.name, v);
                  }
                },
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
     * 渲染普通表单项，优先级：
     * field-${slot} 整项插槽 > column.render >
     * 内置 field 控件 > 原生 field 输入 > Field + input 插槽（内置 input / 自定义）
     */
    const renderFieldColumn = (column: ProFormColumn, scope: RenderScope) => {
      const scopeModel = scope.getModel();
      const localName = column.name ?? '';
      const fieldName = resolveFieldName(column, scope);
      const slotName = column.slot ?? localName;
      const fieldSlot = slotName ? slots[`field-${slotName}`] : undefined;
      if (fieldSlot) {
        return fieldSlot({
          column,
          model: scopeModel,
          value: localName ? scopeModel[localName] : undefined,
          setValue: (value: unknown) => {
            if (localName) {
              scope.setScopeValue(localName, value);
            }
          },
        });
      }

      if (column.render) {
        const ctx = createRenderContext(column, scope);
        return renderColumnWithField(
          column,
          scope,
          () => renderCustomNode(column.render!, ctx),
          { bindModelValue: true },
        );
      }

      const fieldProps = {
        name: fieldName,
        label: column.label,
        ...column.fieldProps,
      };

      if (column.component && isBuiltinFieldComponent(column.component)) {
        return renderBuiltinField({
          column: column as ProFormColumn & { name: string },
          value: localName ? scopeModel[localName] : undefined,
          setValue: (value) => {
            if (localName) {
              scope.setScopeValue(localName, value);
            }
          },
          fieldProps,
          fieldSlots: getColumnFieldSlots(column, scope),
          popupSlots: getColumnPopupSlots(column, scope),
          formDisabled: props.disabled,
          formReadonly: props.readonly,
        });
      }

      if (!column.component || column.component === 'field') {
        const fieldSlots = getColumnFieldSlots(column, scope);
        return (
          <Field
            {...fieldProps}
            modelValue={(localName ? scopeModel[localName] : '') as string}
            onUpdate:modelValue={(value: unknown) => {
              if (localName) {
                scope.setScopeValue(localName, value);
              }
            }}
          >
            {{
              ...fieldSlots,
            }}
          </Field>
        );
      }

      return renderColumnWithField(column, scope, () =>
        renderFieldInput(column, scope),
      );
    };

    /** 将同级多个静态 group 包进一个 Collapse，默认展开 */
    const renderGroupCollapse = (
      groups: ProFormColumn[],
      keyPrefix: string,
      scope: RenderScope,
    ) => (
      <Collapse
        key={`${keyPrefix}-collapse`}
        class={bem('group')}
        border={false}
        modelValue={activeNames.value}
        onUpdate:modelValue={(value: Numeric | Numeric[]) => {
          activeNames.value = Array.isArray(value) ? value : [value];
        }}
      >
        {groups.map((group, index) => {
          const rawName = getProFormGroupName(group, `${keyPrefix}-${index}`);
          const groupName = scope.namePrefix
            ? `${scope.namePrefix}.${rawName}`
            : rawName;
          const title = getProFormStructureTitle(group);
          const expanded = activeNames.value.includes(groupName);
          return (
            <CollapseItem name={groupName} title={title} isLink>
              {{
                value: () => (expanded ? '收起' : '展开'),
                default: () => (
                  <CellGroup inset={props.inset} border={false}>
                    {renderColumnList(
                      group.content || [],
                      `${keyPrefix}-${index}`,
                      scope,
                    )}
                  </CellGroup>
                ),
              }}
            </CollapseItem>
          );
        })}
      </Collapse>
    );

    /**
     * 可增删分组（对齐花名册结构）：
     * - 外层 title 固定置顶
     * - 每条：标题 + 删除（不折叠）
     * - 条内 content 用静态 Collapse 分组
     * - 底部添加；新增 = 按 content 字段模板追加一项
     */
    const renderCollapseGroup = (
      column: ProFormColumn,
      keyPrefix: string,
    ): VNode | null => {
      const listName = column.name;
      if (!listName) {
        return null;
      }

      const rawList = model.value[listName];
      const list = Array.isArray(rawList)
        ? (rawList as Record<string, unknown>[])
        : [];
      const min = Math.max(0, Number(column.min) || 0);
      const max = column.max == null ? Infinity : Number(column.max);
      const canAdd = list.length < max;
      const canRemove = list.length > min;
      const titlePrefix =
        getProFormStructureTitle(column) || column.label || '';
      const addText =
        column.addText || (titlePrefix ? `添加${titlePrefix}` : '添加');

      const updateList = (next: Record<string, unknown>[]) => {
        setFieldValue(listName, next);
      };

      const addItem = () => {
        if (!canAdd) {
          return;
        }
        updateList([...list, createCollapseGroupDefaultItem(column)]);
      };

      const removeItem = (index: number) => {
        if (!canRemove) {
          return;
        }
        const label = titlePrefix || '该项';
        showConfirmDialog({
          title: `删除${label}`,
          message: `是否删除该条${label}？删除后将不可恢复`,
          confirmButtonText: '删除',
          confirmButtonColor: 'var(--van-danger-color)',
        })
          .then(() => {
            updateList(list.filter((_, i) => i !== index));
          })
          .catch(() => undefined);
      };

      return (
        <div key={keyPrefix} class={bem('collapse-group')}>
          {titlePrefix ? (
            <div class={bem('section-title')}>{titlePrefix}</div>
          ) : null}
          {list.map((item, index) => {
            const itemTitleText =
              typeof column.itemTitle === 'function'
                ? column.itemTitle(item, index)
                : `${titlePrefix}${index + 1}`;
            const itemScope: RenderScope = {
              getModel: () => {
                const current = model.value[listName];
                const arr = Array.isArray(current)
                  ? (current as Record<string, unknown>[])
                  : [];
                return arr[index] ?? item;
              },
              setScopeValue: (fieldName, value) => {
                const current = model.value[listName];
                const arr = Array.isArray(current)
                  ? [...(current as Record<string, unknown>[])]
                  : [];
                arr[index] = {
                  ...(arr[index] || {}),
                  [fieldName]: value,
                };
                updateList(arr);
              },
              namePrefix: `${listName}.${index}`,
            };

            return (
              <div
                key={`${keyPrefix}-${index}`}
                class={bem('collapse-group-item')}
              >
                <div class={bem('collapse-group-item-title')}>
                  <span class={bem('collapse-group-item-title-text')}>
                    {itemTitleText}
                  </span>
                  {canRemove ? (
                    <button
                      type="button"
                      class={bem('collapse-group-delete')}
                      disabled={props.disabled}
                      onClick={() => removeItem(index)}
                    >
                      删除
                    </button>
                  ) : null}
                </div>
                {renderColumnList(
                  column.content || [],
                  `${keyPrefix}-${index}`,
                  itemScope,
                )}
              </div>
            );
          })}
          {canAdd ? (
            <div class={bem('collapse-group-add')}>
              <Button
                plain
                textButton
                type="primary"
                icon="plus"
                disabled={props.disabled}
                onClick={addItem}
              >
                {addText}
              </Button>
            </div>
          ) : null}
        </div>
      );
    };

    /**
     * 渲染 column 列表：连续静态 group 合并进同一 Collapse；
     * section / collapse-group / 透传层 / 字段按序输出
     */
    const renderColumnList = (
      columns: ProFormColumn[],
      keyPrefix = 'root',
      scope: RenderScope = rootScope,
    ): (VNode | VNode[] | null)[] => {
      const nodes: (VNode | VNode[] | null)[] = [];
      let groupBuffer: ProFormColumn[] = [];

      const flushGroups = () => {
        if (!groupBuffer.length) {
          return;
        }
        nodes.push(
          renderGroupCollapse(
            groupBuffer,
            `${keyPrefix}-g${nodes.length}`,
            scope,
          ),
        );
        groupBuffer = [];
      };

      columns.forEach((column, index) => {
        if (isColumnHidden(column, scope.getModel())) {
          return;
        }

        const kind = resolveProFormStructureKind(column);
        if (kind === 'group') {
          groupBuffer.push(column);
          return;
        }

        flushGroups();
        nodes.push(renderColumn(column, `${keyPrefix}-${index}`, scope));
      });

      flushGroups();
      return nodes;
    };

    /**
     * 单列渲染分发（按 content / title / addText 推断，无需 type）
     */
    const renderColumn = (
      column: ProFormColumn,
      keyPrefix = 'col',
      scope: RenderScope = rootScope,
    ): VNode | VNode[] | null => {
      if (isColumnHidden(column, scope.getModel())) {
        return null;
      }

      const kind = resolveProFormStructureKind(column);

      if (kind === 'section') {
        const title = getProFormStructureTitle(column);
        return (
          <div key={keyPrefix} class={bem('section')}>
            {title ? <div class={bem('section-title')}>{title}</div> : null}
            {renderColumnList(column.content || [], keyPrefix, scope)}
          </div>
        );
      }

      if (kind === 'passthrough') {
        return (
          <div key={keyPrefix} class={bem('passthrough')}>
            {renderColumnList(column.content || [], keyPrefix, scope)}
          </div>
        );
      }

      if (kind === 'collapse-group') {
        return renderCollapseGroup(column, keyPrefix);
      }

      if (kind === 'group') {
        return renderGroupCollapse([column], keyPrefix, scope);
      }

      return renderFieldColumn(column, scope);
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
      validate: (fieldName) =>
        formRef.value?.validate(fieldName) ?? Promise.resolve(),
      getValues: () => mergeFormValues(formRef.value?.getValues() ?? {}),
      scrollToField: (fieldName, options) =>
        formRef.value?.scrollToField(fieldName, options),
      resetValidation: (fieldName) => formRef.value?.resetValidation(fieldName),
      getValidationStatus: () => formRef.value?.getValidationStatus() ?? {},
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

      const columns = props.columns;
      const useStructureLayout = hasStructureColumn(columns);
      const columnNodes = renderColumnList(columns);

      return (
        <div class={bem()}>
          <Form
            ref={formRef}
            {...formBind}
            onSubmit={onSubmit}
            onFailed={onFailed}
          >
            {useStructureLayout ? (
              <>
                {columnNodes}
                {slots.default?.()}
              </>
            ) : (
              <CellGroup inset={props.inset}>
                {columnNodes}
                {slots.default?.()}
              </CellGroup>
            )}
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
