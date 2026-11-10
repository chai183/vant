/**
 * 信息集 schema 类型（对齐 add-entry/field/search、花名册等后端结构）
 * setList → groupList → fieldList
 */

/** 字段类型配置（typeConfigJson） */
export interface SchemaFieldTypeConfig {
  fieldMapping?: string;
  dictId?: string;
  dictCode?: string;
  level?: number;
  valueLength?: number | string;
  defaultValue?: unknown;
  booleanDefault?: unknown;
  minimumValue?: number | string;
  maximumValue?: number | string;
  decimalPlaces?: number | string;
  dateFormat?: string;
  uploadCount?: number | string;
  maxSize?: number | string;
  sizeUnit?: string;
  formats?: string[];
  allowedFormats?: string[];
  imageSizeLimit?: number | string;
  fileSizeLimit?: number | string;
  uploadUnit?: string;
  parentFieldId?: string;
  parentFieldCode?: string;
  parentColumnName?: string;
  [key: string]: unknown;
}

/** 信息集字段项 */
export interface SchemaFieldItem {
  id?: string | null;
  infoFieldId?: string;
  setCode?: string;
  setName?: string;
  groupCode?: string;
  groupName?: string;
  columnName: string;
  fieldName: string;
  fieldType: string;
  systemFlag?: number;
  /** 入职/信息集配置可见；false 不渲染 */
  isEntryConfig?: boolean;
  isEntryformRequired?: boolean;
  entryDisplay?: boolean;
  required?: boolean;
  entryImportDisplay?: boolean;
  entryImportRequired?: boolean;
  approveDisplay?: boolean;
  approveRequired?: boolean;
  dataSource?: string;
  defaultValue?: unknown;
  placeholder?: string;
  disabled?: boolean;
  displayOnly?: boolean;
  options?: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  typeConfigJson?: SchemaFieldTypeConfig | string | null;
}

/** 信息集分组 */
export interface SchemaFieldGroup {
  groupCode: string;
  groupName: string;
  fieldList: SchemaFieldItem[];
  min?: number;
  max?: number;
}

/** 信息集 */
export interface SchemaFieldSet {
  setCode: string;
  setName: string;
  /** 是否单条数据：1 是 / 0 否（多行可增删） */
  singleDataFlag?: number;
  /** flat：按 groupCode 各自数组（如直属领导） */
  layout?: string;
  collapseMin?: number;
  collapseMax?: number;
  groupList: SchemaFieldGroup[];
}
