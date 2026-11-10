/**
 * 信息集常见字段默认覆盖（对齐 PC resolve-schema-field 精简版）
 * 性别 / 员工类型 / 部门：无字典 options 时兜底
 * 业务页可通过 prop resolveSchemaField 再覆盖
 */
import type { ProFormColumn, ProFormOption } from 'vant';
import type { SchemaFieldItem } from './types';
import type { ResolveSchemaField } from './transform-schema';

/** 性别兜底 */
export const SCHEMA_GENDER_OPTIONS: ProFormOption[] = [
  { label: '男', value: '1' },
  { label: '女', value: '2' },
];

/** 员工类型兜底（无字典时） */
export const SCHEMA_STAFF_TYPE_OPTIONS: ProFormOption[] = [
  { label: '全职', value: 'fulltime' },
  { label: '兼职', value: 'parttime' },
  { label: '实习', value: 'intern' },
  { label: '外派', value: 'expat' },
];

/** 部门兜底（无组织树 / 字典时） */
export const SCHEMA_DEPARTMENT_OPTIONS: ProFormOption[] = [
  { label: '内容文字均折行自适应', value: 'dept-1' },
  { label: '科技研发中心', value: 'dept-2' },
  { label: '人力资源部', value: 'dept-3' },
  { label: '风险管理部', value: 'dept-4' },
  { label: '内容运营中心', value: 'dept-5' },
];

export const SCHEMA_STAFF_TYPE_LABEL_MAP: Record<string, string> = {
  fulltime: '全职',
  parttime: '兼职',
  intern: '实习',
  expat: '外派',
};

/** 默认字段覆盖：无 options 时补性别 / 员工类型 / 部门 */
export const defaultResolveSchemaField: ResolveSchemaField = (
  field: SchemaFieldItem,
  column: ProFormColumn,
) => {
  if (field?.columnName === 'gender' || field?.columnName === 'sex') {
    if (!column.options?.length) {
      return {
        component: 'radioGroup',
        options: SCHEMA_GENDER_OPTIONS,
        fieldProps: {
          ...column.fieldProps,
          labelAlign: 'top',
        },
        componentProps: {
          direction: 'horizontal',
          options: SCHEMA_GENDER_OPTIONS,
        },
      };
    }
  }

  if (field?.columnName === 'staffType') {
    if (!column.options?.length) {
      return {
        component: 'radioPicker',
        options: SCHEMA_STAFF_TYPE_OPTIONS,
      };
    }
  }

  if (field?.columnName === 'orgId') {
    if (!column.options?.length) {
      return {
        component: 'radioPicker',
        options: SCHEMA_DEPARTMENT_OPTIONS,
      };
    }
  }

  return undefined;
};

/**
 * 合并默认覆盖与业务侧钩子：先跑 default，再跑 custom（custom 优先）
 */
export function createMergedResolveSchemaField(
  custom?: ResolveSchemaField,
): ResolveSchemaField {
  return (field, column) => {
    const base = defaultResolveSchemaField(field, column);
    const baseColumn = base
      ? ({
          ...column,
          ...base,
          fieldProps: { ...column.fieldProps, ...base.fieldProps },
          componentProps: {
            ...column.componentProps,
            ...base.componentProps,
          },
        } as ProFormColumn)
      : column;
    if (!custom) {
      return base;
    }
    const patched = custom(field, baseColumn);
    if (!patched) {
      return base;
    }
    if (!base) {
      return patched;
    }
    return {
      ...base,
      ...patched,
      fieldProps: {
        ...base.fieldProps,
        ...patched.fieldProps,
      },
      componentProps: {
        ...base.componentProps,
        ...patched.componentProps,
      },
    };
  };
}
