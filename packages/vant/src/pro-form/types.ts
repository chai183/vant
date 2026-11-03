import type { Component, VNode } from 'vue';
import type { FieldProps } from '../field/Field';
import type {
  ProFormFieldSlotName,
  ProFormPopupSlotName,
} from './resolveFieldSlots';

export type ProFormBuiltinComponent =
  | 'switch'
  | 'checkbox'
  | 'checkboxGroup'
  | 'radio'
  | 'radioGroup'
  | 'stepper'
  | 'rate'
  | 'slider'
  | 'uploader'
  | 'picker'
  | 'radioPicker'
  | 'checkboxPicker'
  | 'datePicker'
  | 'area'
  | 'areaStepCascader'
  | 'calendar'
  | 'fieldMoney'
  | 'fieldChildren'
  | 'rangeInput'
  | 'uploaderFile'
  | 'field';

export type ProFormOption = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

/** 嵌套表单项：渲染函数或 column 配置（name 可省略） */
export type ProFormNestedColumnItem =
  | (() => VNode | VNode[] | null)
  | (Partial<Omit<ProFormColumn, 'name'>> & { name?: string });

/** rangeInput 起止项：渲染函数或表单项 column 配置（name 可省略） */
export type ProFormRangeInputItem = ProFormNestedColumnItem;

/** fieldChildren 行模板：渲染函数或表单项 column 配置（name 可省略） */
export type ProFormFieldChildrenRowItem = ProFormNestedColumnItem;

/** 结构节点推断结果（按 content / title / addText 等自动识别，无需写 type） */
export type ProFormStructureKind =
  | 'section'
  | 'group'
  | 'collapse-group'
  | 'passthrough';

export type ProFormColumn = {
  /**
   * 表单项 name，与 Form 提交字段一致。
   * 静态折叠分组可用作面板唯一键；可增删分组对应 model 数组字段名
   */
  name?: string;
  /** Field 左侧标签 */
  label?: string;
  /** 结构节点标题（区块 / 折叠分组）；可增删分组为「标题+序号」前缀 */
  title?: string;
  /**
   * 子节点。有 content 且无 component/render/slot 时视为结构节点：
   * - 配置了 addText / min / max / defaultItem → collapse-group（可增删分组；新增按 content 字段模板）
   * - 子级仍含 content → section（区块标题）
   * - 有 title、子级为字段 → group（静态折叠）
   * - 无标题 → passthrough（透传层）
   */
  content?: ProFormColumn[];
  /** 可增删分组：底部添加按钮文案 */
  addText?: string;
  /** 可增删分组：最少条数，默认 0 */
  min?: number;
  /** 可增删分组：最多条数；不传不限制 */
  max?: number;
  /** 可增删分组：新增项初始值 */
  defaultItem?: Record<string, unknown>;
  /** 可增删分组：自定义每项标题 `(item, index) => string` */
  itemTitle?: (item: Record<string, unknown>, index: number) => string;
  /**
   * 内置控件类型，或在 `components` / 插槽中注册的自定义类型
   * `field` 为原生 Field 输入（type、rules 等通过 fieldProps 配置）
   * 使用 `render` 时可省略
   */
  component?: ProFormBuiltinComponent | (string & Record<string, never>);
  /** 初始值；未传时按 component 使用内置默认值 */
  defaultValue?: unknown;
  /** 透传给 Field（rules、placeholder、type 等） */
  fieldProps?: Partial<FieldProps>;
  /** 透传给具体控件（Switch、Stepper 等） */
  componentProps?: Record<string, unknown>;
  /** radioGroup / checkboxGroup / radioPicker / checkboxPicker 的选项；存 value，展示 label */
  options?: ProFormOption[];
  /** 为 true 时不渲染 */
  hidden?: boolean | ((model: Record<string, unknown>) => boolean);
  /** 自定义插槽名，等价于 `#field-${slot}` / `#input-${slot}` 中的 slot 名 */
  slot?: string;
  /** 透传 Field 插槽，如 label-comment、input-comment 等 */
  fieldSlots?: Partial<
    Record<
      ProFormFieldSlotName,
      | string
      | Component
      | ((ctx: ProFormRenderContext) => VNode | VNode[] | null)
    >
  >;
  /** 弹层类控件底部插槽，如 checkboxPicker / radioPicker 的 popup-bottom */
  popupSlots?: Partial<
    Record<
      ProFormPopupSlotName,
      | string
      | Component
      | ((ctx: ProFormRenderContext) => VNode | VNode[] | null)
    >
  >;
  /**
   * 自定义渲染表单项内容，优先级高于 component / components 注册
   * - 传 Vue 组件：自动绑定 modelValue，componentProps 透传为 props
   * - 传渲染函数：返回组件 VNode 时自动绑定（支持 `() => <MyField />`）
   * - 需要额外 props 时可写 `ctx.bindProps({ ... })` 或配置 componentProps
   */
  render?: ProFormComponentRender | Component;
};

/** 是否为结构节点（含仅 content 的透传层） */
export function isProFormStructureColumn(column: ProFormColumn): boolean {
  return (
    Array.isArray(column.content) &&
    !column.component &&
    !column.render &&
    !column.slot
  );
}

/** 结构节点展示标题 */
export function getProFormStructureTitle(column: ProFormColumn): string {
  return column.title ?? '';
}

/** group 折叠面板 name */
export function getProFormGroupName(
  column: ProFormColumn,
  fallback: string | number,
): string | number {
  return column.name ?? fallback;
}

/** 是否为可增删折叠分组（配置了增删相关字段） */
export function isProFormCollapseGroupColumn(column: ProFormColumn): boolean {
  if (!isProFormStructureColumn(column) || !column.name) {
    return false;
  }
  return (
    column.addText != null ||
    column.defaultItem != null ||
    column.min != null ||
    column.max != null
  );
}

/**
 * 按配置推断结构类型（写死容器，无需 type）：
 * - 配置了 addText / min / max / defaultItem → collapse-group（优先，可嵌套在 section 内）
 * - 子节点仍含 content → section
 * - 有 title → group
 * - 否则 → passthrough
 */
export function resolveProFormStructureKind(
  column: ProFormColumn,
): ProFormStructureKind | null {
  if (!isProFormStructureColumn(column)) {
    return null;
  }
  // 可增删优先：与区块同级嵌套时，靠 addText/min/max/defaultItem 识别
  if (isProFormCollapseGroupColumn(column)) {
    return 'collapse-group';
  }
  const title = getProFormStructureTitle(column);
  const children = column.content || [];
  const childHasContent = children.some((child) =>
    Array.isArray(child.content),
  );

  if (childHasContent) {
    return 'section';
  }
  if (title) {
    return 'group';
  }
  return 'passthrough';
}

/** 递归收集 content 内字段，生成可增删分组新增项（对齐 digital-workforce） */
function walkCollapseGroupFields(
  columns: ProFormColumn[] | undefined,
  item: Record<string, unknown>,
) {
  (columns || []).forEach((node) => {
    if (isProFormStructureColumn(node)) {
      walkCollapseGroupFields(node.content, item);
      return;
    }
    if (!node.name) {
      return;
    }
    item[node.name] =
      node.defaultValue ??
      (node.component === 'uploader' || node.component === 'uploaderFile'
        ? []
        : '');
  });
}

/** 按 content 模板生成可增删分组的默认项（新增 = 复制一份 content 字段） */
export function createCollapseGroupDefaultItem(
  column: ProFormColumn,
): Record<string, unknown> {
  if (column.defaultItem && typeof column.defaultItem === 'object') {
    return { ...column.defaultItem };
  }
  const item: Record<string, unknown> = {};
  walkCollapseGroupFields(column.content, item);
  return item;
}

export type ProFormRenderContext = {
  column: ProFormColumn;
  model: Record<string, unknown>;
  /** 当前字段值，等价于 modelValue */
  value: unknown;
  /** 合并 Form / fieldProps / componentProps 后的禁用态 */
  disabled?: boolean;
  /** 合并 Form / fieldProps / componentProps 后的只读态 */
  readonly?: boolean;
  setValue: (value: unknown) => void;
  /**
   * 合并 componentProps 并自动绑定 modelValue / onUpdate:modelValue
   * @example h(MyField, bindProps({ placeholder: '请选择' }))
   */
  bindProps: (props?: Record<string, unknown>) => Record<string, unknown>;
};

export type ProFormComponentRender = (
  ctx: ProFormRenderContext,
) => VNode | VNode[] | null;

export type ProFormComponentMap = Record<
  string,
  Component | ProFormComponentRender
>;

export type ProFormThemeVars = {
  proFormFooterPadding?: string;
};
