/**
 * SchemaProForm dataSource 运行时（对齐 PC ProForm/dataSource.js）
 * - 同页缓存、并发去重
 * - 与 column.options 合并
 * - isList 弹层：loadOptions 支持 page / pageSize / keyword 上拉分页
 */
import { reactive } from 'vue';
import {
  DATA_SOURCE_CONFIG,
  type SchemaDataSourceFetchResult,
  type SchemaDataSourceItem,
  type SchemaDataSourcePageResult,
} from './dataSource.config';
import type { SchemaOption } from './apply-type-config';

let registry: Record<string, SchemaDataSourceItem> = {
  ...DATA_SOURCE_CONFIG,
};

/** 合并 / 覆盖注册表（业务可扩展） */
export function registerSchemaDataSources(
  extra: Record<string, SchemaDataSourceItem> = {},
) {
  registry = {
    ...registry,
    ...extra,
  };
}

export function getSchemaDataSourceRegistry() {
  return registry;
}

export function isKnownDataSource(name?: string | null) {
  return Boolean(name && registry[name]?.fetch);
}

export function getDataSourceConfigLazy(name?: string | null) {
  if (!name || !registry[name]) return undefined;
  const {lazy} = registry[name];
  if (lazy === true || lazy === false) return lazy;
  return undefined;
}

export function getDataSourceFieldDefaults(name?: string | null) {
  if (!name || !registry[name]) return {};
  return { ...(registry[name].fieldDefaults || {}) };
}

function getDataSourceFetch(name: string) {
  return registry[name]?.fetch;
}

function getDataSourceCacheKey(name: string, params?: Record<string, unknown>) {
  if (!name) return '';
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return name;
  }
  // 分页缓存按 keyword 分桶，不含 pageNum（同关键词累加）
  const keys = Object.keys(params)
    .filter((key) => key !== 'pageNum' && key !== 'page' && key !== 'pageSize')
    .sort();
  if (!keys.length) return name;
  const suffix = keys
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  return `${name}?${suffix}`;
}

const optionsCache = reactive<Record<string, SchemaOption[]>>({});
const loadingState = reactive<Record<string, boolean>>({});
const inflightRequests: Record<string, Promise<boolean> | undefined> = {};
const pageMeta = reactive<
  Record<string, { total?: number; finished?: boolean; pageNum: number }>
>({});
let cacheGeneration = 0;

export function getDataSourceOptions(
  name?: string | null,
  params?: Record<string, unknown>,
) {
  if (!name) return [];
  const key = getDataSourceCacheKey(name, params);
  return optionsCache[key] ?? [];
}

export function isDataSourceLoading(
  name?: string | null,
  params?: Record<string, unknown>,
) {
  if (!name) return false;
  const key = getDataSourceCacheKey(name, params);
  return Boolean(key && loadingState[key]);
}

export function clearDataSourceCache() {
  cacheGeneration += 1;
  Object.keys(optionsCache).forEach((key) => {
    delete optionsCache[key];
  });
  Object.keys(loadingState).forEach((key) => {
    delete loadingState[key];
  });
  Object.keys(pageMeta).forEach((key) => {
    delete pageMeta[key];
  });
}

function normalizeFetchResult(
  data: SchemaDataSourceFetchResult,
  pageSize: number,
): SchemaDataSourcePageResult {
  if (Array.isArray(data)) {
    return { list: data, total: data.length, finished: true };
  }
  const list = Array.isArray(data?.list) ? data.list : [];
  return {
    list,
    total: data?.total,
    finished:
      data?.finished ??
      (data?.total == null ? list.length < pageSize : undefined),
  };
}

function mergeOptions(prev: SchemaOption[], next: SchemaOption[]) {
  if (!prev.length) return next.slice();
  const seen = new Set(prev.map((item) => String(item.value)));
  const merged = prev.slice();
  next.forEach((item) => {
    const key = String(item.value);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  });
  return merged;
}

/**
 * 按 dataSource 名加载选项（已缓存全量或加载中则跳过）
 * 失败不写缓存，下次可重试
 */
export async function loadDataSourceOptions(
  name?: string | null,
  params?: Record<string, unknown>,
) {
  if (!name) return false;
  const fetch = getDataSourceFetch(name);
  const key = getDataSourceCacheKey(name, params);
  if (!fetch || !key) return false;
  if (key in optionsCache && pageMeta[key]?.finished) return true;
  if (inflightRequests[key]) return inflightRequests[key];

  loadingState[key] = true;
  const generation = cacheGeneration;
  inflightRequests[key] = (async () => {
    try {
      const pageSize = Math.max(1, Number(params?.pageSize) || 20);
      const data = await fetch(params);
      if (generation !== cacheGeneration) return false;
      const normalized = normalizeFetchResult(data, pageSize);
      optionsCache[key] = Array.isArray(normalized.list) ? normalized.list : [];
      pageMeta[key] = {
        total: normalized.total,
        finished: normalized.finished ?? true,
        pageNum: Number(params?.pageNum) || 1,
      };
      return true;
    } catch {
      return false;
    } finally {
      delete loadingState[key];
      delete inflightRequests[key];
    }
  })();
  return inflightRequests[key];
}

/**
 * 分页加载（上拉）：pageNum=1 重置，后续页追加
 */
export async function loadDataSourcePage(
  name: string,
  params: {
    pageNum: number;
    pageSize: number;
    keyword?: string;
  } & Record<string, unknown>,
): Promise<SchemaDataSourcePageResult> {
  const fetch = getDataSourceFetch(name);
  if (!fetch) {
    return { list: [], finished: true, total: 0 };
  }

  const pageNum = Math.max(1, Number(params.pageNum) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 20);
  const key = getDataSourceCacheKey(name, params);
  const generation = cacheGeneration;

  const data = await fetch({
    ...params,
    pageNum,
    pageSize,
  });
  if (generation !== cacheGeneration) {
    return { list: [], finished: true };
  }

  const normalized = normalizeFetchResult(data, pageSize);
  const prev = pageNum <= 1 ? [] : (optionsCache[key] ?? []);
  const merged =
    pageNum <= 1 ? normalized.list : mergeOptions(prev, normalized.list);
  optionsCache[key] = merged;

  let {finished} = normalized;
  if (finished == null && normalized.total != null) {
    finished = merged.length >= normalized.total;
  }
  if (finished == null) {
    finished = normalized.list.length < pageSize;
  }

  pageMeta[key] = {
    total: normalized.total,
    finished,
    pageNum,
  };

  return {
    list: normalized.list,
    total: normalized.total,
    finished,
  };
}

/** 有业务 options 时以 options 为准；否则用 dataSource */
export function mergeDataSourceOptions(
  columnOptions?: SchemaOption[] | null,
  dataSourceOptions?: SchemaOption[] | null,
) {
  const fromColumn = Array.isArray(columnOptions) ? columnOptions : [];
  const fromSource = Array.isArray(dataSourceOptions) ? dataSourceOptions : [];
  if (fromColumn.length > 0) return fromColumn;
  return fromSource.length ? fromSource : fromColumn;
}

/**
 * 生成 isList picker 的 loadOptions（弹层上拉分页）
 */
export function createDataSourceLoadOptions(
  name: string,
  params?:
    | Record<string, unknown>
    | (() => Record<string, unknown> | undefined),
) {
  return async (query?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) => {
    const resolved =
      typeof params === 'function' ? params() || undefined : params;
    const pageNum = Math.max(1, Number(query?.page) || 1);
    const pageSize = Math.max(1, Number(query?.pageSize) || 20);
    const keyword = query?.keyword;
    return loadDataSourcePage(name, {
      ...(resolved || {}),
      pageNum,
      pageSize,
      keyword,
    });
  };
}
