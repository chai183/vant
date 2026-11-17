/**
 * SchemaProForm dataSource 注册表（固定数据源与 PC 注册表对齐）
 * 业务追加：registerSchemaDataSources({ xxx: { fetch, fieldDefaults, lazy } })
 *
 * 约定：radioPicker / checkboxPicker 在 isList=true 时，弹层打开走 loadOptions
 * fetch 统一支持上拉分页：params 含 pageNum / pageSize / keyword，返回 { list, total }
 */
import type { SchemaOption } from './apply-type-config';
import { getSchemaDataSourceApi } from '@/services/api/common/schemaProForm';
import { toSchemaDataSourceOptions } from '@/services/api/common/schemaProForm/entity';

export type SchemaDataSourcePageResult = {
  list: SchemaOption[];
  total?: number;
  finished?: boolean;
};

export type SchemaDataSourceFetchResult =
  | SchemaOption[]
  | SchemaDataSourcePageResult;

export type SchemaDataSourceFetch = (
  params?: Record<string, unknown>,
) => Promise<SchemaDataSourceFetchResult>;

export type SchemaDataSourceItem = {
  fetch: SchemaDataSourceFetch;
  fieldDefaults?: Record<string, unknown>;
  /** 默认 true：isList 弹层打开再请求 */
  lazy?: boolean;
  /** false 表示 PC 全量接口，复用缓存并在本地搜索，不发送伪分页参数。 */
  paginated?: boolean;
};

/** 已核实的固定数据源；选择弹层打开时才请求。 */
const sources = [
  'department',
  'position',
  'position-enable',
  'job',
  'jobCategory',
  'grade',
  'grade-cascade',
  'legalEntity',
  'corporation',
  'workLocation',
  'socialSecurityPlan',
  'providentFundPlan',
  'socialSecurityOrg',
  'providentFundOrg',
  'orgUser',
];

export const DATA_SOURCE_CONFIG: Record<string, SchemaDataSourceItem> =
  Object.fromEntries(
    sources.map((source) => [
      source,
      {
        fieldDefaults: { isList: true, showSearch: true },
        lazy: true,
        paginated: false,
        fetch: async (params?: Record<string, unknown>) => {
          if (source === 'grade-cascade' && (!params?.id || !params?.type))
            return [];
          const requestSource =
            source === 'position-enable'
              ? 'position'
              : [
                    'corporation',
                    'socialSecurityOrg',
                    'providentFundOrg',
                  ].includes(source)
                ? 'legalEntity'
                : ['socialSecurityPlan', 'providentFundPlan'].includes(source)
                  ? 'benefit'
                  : source;
          // 全量分支只接收显式业务参数，不注入选择弹层的分页和搜索参数。
          const body = await getSchemaDataSourceApi(requestSource, params);
          return toSchemaDataSourceOptions(body, source);
        },
      },
    ]),
  );

/** 保留原有技能多选开发示例，不用于档案固定字段。 */
DATA_SOURCE_CONFIG.skillTags = {
  fieldDefaults: {
    isList: true,
    showSearch: true,
    pageSize: 20,
    multiple: true,
  },
  lazy: true,
  fetch: async (params) => {
    const body = await getSchemaDataSourceApi('skillTags', params);
    const page = body as { records?: SchemaOption[]; total?: number };
    return {
      list: Array.isArray(page?.records) ? page.records : [],
      total: page?.total,
    };
  },
};
