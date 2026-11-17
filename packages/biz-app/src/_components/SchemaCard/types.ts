import type { SchemaFieldSet } from '@/_components/SchemaProForm/types';

export type SchemaCardOption = {
  label: string;
  value: string | number;
};

/** 卡片里一行字段。兼容 schema fieldList 和花名册 groups.fields */
export type SchemaCardField = {
  name?: string;
  fieldCode?: string;
  columnName?: string;
  label?: string;
  fieldName?: string;
  fieldType?: string;
  mapping?: string;
  fieldMapping?: string;
  options?: SchemaCardOption[];
  fieldLabel?: string;
  tip?: boolean;
  /** 标签垂直对齐，默认顶部；短字段可设 center */
  labelAlign?: 'top' | 'center';
  typeConfigJson?: unknown;
};

/** 一张分组卡片的配置 */
export type SchemaCardGroup = {
  name?: string;
  groupCode?: string;
  title?: string;
  groupName?: string;
  fields?: SchemaCardField[];
  fieldList?: SchemaCardField[];
};

export type SchemaCardSchema = SchemaFieldSet;
