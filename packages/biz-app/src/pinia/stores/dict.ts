/**
 * 字典 store（对齐 PC stores/dict，精简为一层场景）
 * - getDict(dictCode)：拉首层项并缓存
 * - getDictBatch：按 schema 批量预取
 */
import type { DictItem, DictItemVO } from '@/types/common/dict';
import { getDictItemsApi } from '@/services/api/common/dict';

type DictStatusInput = number | null | undefined;

function normalizeStatus(status?: DictStatusInput): number | undefined {
  if (status === undefined || status === null || `${status}` === '') {
    return undefined;
  }
  const num = Number(status);
  return Number.isFinite(num) ? num : undefined;
}

/** 缓存 key：dictCode[::parentValue]::status=… */
function buildCacheKey(
  dictCode: string,
  parentValue?: string,
  status?: DictStatusInput,
) {
  const base = parentValue ? `${dictCode}::${parentValue}` : dictCode;
  const normalized = normalizeStatus(status);
  const statusKey = normalized === undefined ? 'default' : String(normalized);
  return `${base}::status=${statusKey}`;
}

function toBoolFlag(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }
  return undefined;
}

/** 后端 VO → 前端选项 */
function mapDictItem(item: DictItemVO): DictItem {
  const status = item.status == null ? 1 : Number(item.status);
  return {
    label: item.itemLabel,
    value: String(item.itemValue ?? ''),
    parentValue: item.parentValue ?? undefined,
    leafFlag: toBoolFlag(item.leafFlag),
    level: item.level,
    status,
    disabled: status === 0,
  };
}

export const useDictStore = defineStore('dict', () => {
  const cache = ref<Record<string, DictItem[]>>({});
  const pendingMap = new Map<string, Promise<DictItem[]>>();

  function getCachedDict(
    dictCode: string,
    parentValue?: string,
    status?: DictStatusInput,
  ) {
    return cache.value[buildCacheKey(dictCode, parentValue, status)];
  }

  function hasDictCache(
    dictCode: string,
    parentValue?: string,
    status?: DictStatusInput,
  ) {
    return Object.hasOwn(
      cache.value,
      buildCacheKey(dictCode, parentValue, status),
    );
  }

  /**
   * 获取字典项（有缓存直接返回）
   * 一层场景：不传 parentValue
   */
  async function getDict(
    dictCode: string,
    parentValue?: string,
    status?: DictStatusInput,
  ) {
    const code = String(dictCode || '').trim();
    if (!code) return [];

    const normalizedStatus = normalizeStatus(status);
    const cacheKey = buildCacheKey(code, parentValue, normalizedStatus);
    if (hasDictCache(code, parentValue, normalizedStatus)) {
      return cache.value[cacheKey];
    }

    const pendingRequest = pendingMap.get(cacheKey);
    if (pendingRequest) return pendingRequest;

    const request = getDictItemsApi(code, parentValue, normalizedStatus)
      .then((res) => {
        const list = res?.body ?? res?.data ?? [];
        cache.value[cacheKey] = (Array.isArray(list) ? list : []).map(
          mapDictItem,
        );
        return cache.value[cacheKey];
      })
      .catch(() => {
        // 失败不写缓存，下次可重试
        return [] as DictItem[];
      })
      .finally(() => {
        pendingMap.delete(cacheKey);
      });

    pendingMap.set(cacheKey, request);
    return request;
  }

  /** 批量拉取首层字典项 */
  async function getDictBatch(dictCodes: string[]) {
    const uniqueCodes = [...new Set(dictCodes.filter(Boolean))];
    const result: Record<string, DictItem[]> = {};
    await Promise.all(
      uniqueCodes.map(async (dictCode) => {
        result[dictCode] = await getDict(dictCode);
      }),
    );
    return result;
  }

  function clearDictCache(dictCode?: string) {
    if (dictCode) {
      const prefix = `${dictCode}::`;
      Object.keys(cache.value).forEach((key) => {
        if (key === dictCode || key.startsWith(prefix)) {
          delete cache.value[key];
          pendingMap.delete(key);
        }
      });
      return;
    }
    cache.value = {};
    pendingMap.clear();
  }

  return {
    cache,
    getDict,
    getDictBatch,
    getCachedDict,
    hasDictCache,
    clearDictCache,
  };
});
