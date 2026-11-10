import SchemaProForm from './SchemaProForm.vue';

export default SchemaProForm;
export { SchemaProForm };

export type {
  SchemaFieldTypeConfig,
  SchemaFieldItem,
  SchemaFieldGroup,
  SchemaFieldSet,
} from './types';

export {
  DEFAULT_SCHEMA_FIELD_TYPE_MAP,
  BOOLEAN_FIELD_OPTIONS,
  getSchemaFieldKey,
  parseTypeConfigJson,
  getSchemaFieldMapping,
  flattenSchemaFields,
  collectSchemaDictCodes,
  createModelFromSchema,
  buildSubmitPayload,
  flattenSubmitPayload,
  createModelFromSubmitPayload,
  mapGroupNameAsSetName,
  buildSchemaFieldColumn,
  transformSchemaToColumns,
  splitCustomFieldsOnRow,
  isLabelValue,
  unwrapLabelValue,
  toLabelValue,
  applyTypeConfigToColumn,
  resolveDateColumnsType,
  resolveTimeColumnsType,
  resolveUploadSizeBytes,
  resolveUploadSizeDisplay,
  resolveUploadAccept,
  resolveUploadMaxCount,
  buildUploadTipLines,
} from './transform-schema';

export type {
  ResolveSchemaField,
  TransformSchemaOptions,
  SchemaOption,
  SchemaProFormColumn,
} from './transform-schema';

export {
  defaultResolveSchemaField,
  createMergedResolveSchemaField,
  SCHEMA_GENDER_OPTIONS,
  SCHEMA_STAFF_TYPE_OPTIONS,
  SCHEMA_DEPARTMENT_OPTIONS,
  SCHEMA_STAFF_TYPE_LABEL_MAP,
} from './resolve-schema-field';

export {
  collectSchemaFieldRuntimeMetas,
  collectLinkedOptionDescendants,
  syncSchemaModelLinkages,
  getOptionParentFieldProp,
} from './schema-runtime';

export type { SchemaFieldRuntimeMeta } from './schema-runtime';

export { DATA_SOURCE_CONFIG } from './dataSource.config';
export type {
  SchemaDataSourceFetch,
  SchemaDataSourceFetchResult,
  SchemaDataSourceItem,
  SchemaDataSourcePageResult,
} from './dataSource.config';

export {
  registerSchemaDataSources,
  getSchemaDataSourceRegistry,
  isKnownDataSource,
  getDataSourceConfigLazy,
  getDataSourceFieldDefaults,
  getDataSourceOptions,
  isDataSourceLoading,
  clearDataSourceCache,
  loadDataSourceOptions,
  loadDataSourcePage,
  mergeDataSourceOptions,
  createDataSourceLoadOptions,
} from './dataSource';
