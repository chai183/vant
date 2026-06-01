import type { Component, VNode } from 'vue';
import type { FieldProps } from '../field/Field';
import type { FieldRule } from '../field/types';

export type ProFormBuiltinComponent =
  | 'switch'
  | 'checkbox'
  | 'checkboxGroup'
  | 'radio'
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

export type ProFormColumn = {
  /** 表单项 name，与 Form 提交字段一致 */
  name: string;
  /** Field 左侧标签 */
  label?: string;
  /**
   * 内置控件类型，或在 `components` / 插槽中注册的自定义类型
   * `field` 为原生 Field 输入（type、rules 等通过 fieldProps 配置）
   * 使用 `render` 时可省略
   */
  component?: ProFormBuiltinComponent | (string & {});
  /** 初始值；未传时按 component 使用内置默认值 */
  defaultValue?: unknown;
  /** 透传给 Field（rules、placeholder、type 等） */
  fieldProps?: Partial<FieldProps>;
  /** 透传给具体控件（Switch、Stepper 等） */
  componentProps?: Record<string, unknown>;
  /** radio / checkboxGroup / radioPicker / checkboxPicker 的选项；存 value，展示 label */
  options?: ProFormOption[];
  /** 为 true 时不渲染 */
  hidden?: boolean | ((model: Record<string, unknown>) => boolean);
  /** 自定义插槽名，等价于 `#field-${slot}` / `#input-${slot}` 中的 slot 名 */
  slot?: string;
  /**
   * 自定义渲染表单项内容，优先级高于 component / components 注册
   * - 传 Vue 组件：自动绑定 modelValue，componentProps 透传为 props
   * - 传渲染函数：返回组件 VNode 时自动绑定（支持 `() => <MyField />`）
   * - 需要额外 props 时可写 `ctx.bindProps({ ... })` 或配置 componentProps
   */
  render?: ProFormComponentRender | Component;
};

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
