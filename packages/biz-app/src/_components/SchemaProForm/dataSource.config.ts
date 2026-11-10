/**
 * SchemaProForm dataSource 注册表（对齐 PC 写法，先只落常用示例）
 * 业务追加：registerSchemaDataSources({ xxx: { fetch, fieldDefaults, lazy } })
 *
 * 约定：radioPicker / checkboxPicker 在 isList=true 时，弹层打开走 loadOptions
 * fetch 统一支持上拉分页：params 含 pageNum / pageSize / keyword，返回 { list, total }
 */
import type { SchemaOption } from './apply-type-config';

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
};

function assertSuccess(
  res: { success?: boolean; message?: string; errorMsg?: string },
  name: string,
) {
  if (res?.success === false) {
    throw new Error(
      res.message || res.errorMsg || `dataSource "${name}" 请求失败`,
    );
  }
}

async function postJson<T>(url: string, data?: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
  return (await res.json()) as {
    success?: boolean;
    body?: T;
    message?: string;
    errorMsg?: string;
  };
}

function resolvePageParams(params?: Record<string, unknown>) {
  const pageNum = Math.max(1, Number(params?.pageNum) || 1);
  const pageSize = Math.max(1, Number(params?.pageSize) || 20);
  const keyword =
    params?.keyword != null && String(params.keyword).trim()
      ? String(params.keyword).trim()
      : undefined;
  return { pageNum, pageSize, keyword };
}

/** 内置示例（其余数据源由业务 registerSchemaDataSources 扩展） */
export const DATA_SOURCE_CONFIG: Record<string, SchemaDataSourceItem> = {
  /** 职位：单选列表 radioPicker + isList + 上拉分页 */
  position: {
    fieldDefaults: {
      isList: true,
      showSearch: true,
      pageSize: 20,
    },
    lazy: true,
    fetch: async (params) => {
      const page = resolvePageParams(params);
      const res = await postJson<{
        records?: Array<{ id?: string | number; positionName?: string }>;
        total?: number;
      }>('/api/dthr-employee/v4/schema-data-source/position/options', page);
      assertSuccess(res, 'position');
      const {body} = res;
      const records = Array.isArray(body)
        ? body
        : Array.isArray(body?.records)
          ? body.records
          : [];
      return {
        list: records
          .filter((item) => item?.id != null)
          .map((item) => ({
            label: item.positionName || '--',
            value: String(item.id),
          })),
        total: Array.isArray(body) ? records.length : Number(body?.total) || 0,
      };
    },
  },

  /** 技能标签：多选列表 checkboxPicker + isList + 上拉分页 */
  skillTags: {
    fieldDefaults: {
      isList: true,
      showSearch: true,
      pageSize: 20,
      /** SchemaProForm：标记为多选 → checkboxPicker */
      multiple: true,
    },
    lazy: true,
    fetch: async (params) => {
      const page = resolvePageParams(params);
      const res = await postJson<{
        records?: Array<{ label: string; value: string }>;
        total?: number;
      }>('/api/dthr-employee/v4/schema-data-source/skill-tags/options', page);
      assertSuccess(res, 'skillTags');
      const {body} = res;
      const records = Array.isArray(body)
        ? body
        : Array.isArray(body?.records)
          ? body.records
          : [];
      return {
        list: records,
        total: Array.isArray(body) ? records.length : Number(body?.total) || 0,
      };
    },
  },
};
