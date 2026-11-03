import { ref, type Ref } from 'vue';
import type { ProFormOption } from '../types';

export type LoadOptionsQuery = {
  page: number;
  pageSize: number;
  keyword?: string;
};

export type LoadOptionsResult =
  | ProFormOption[]
  | {
      list?: ProFormOption[];
      records?: ProFormOption[];
      total?: number;
      finished?: boolean;
    };

export type LoadOptionsFn = (
  query?: LoadOptionsQuery,
) => LoadOptionsResult | Promise<LoadOptionsResult | void | undefined>;

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function resolvePageSize(raw: unknown) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PAGE_SIZE;
}

function normalizeResult(
  result: LoadOptionsResult | void | undefined,
  pageSize: number,
): { list: ProFormOption[]; total?: number; finished?: boolean } {
  if (Array.isArray(result)) {
    return {
      list: result,
      total: result.length,
      finished: true,
    };
  }
  if (!result || typeof result !== 'object') {
    return { list: [], finished: true };
  }
  const list = Array.isArray(result.list)
    ? result.list
    : Array.isArray(result.records)
      ? result.records
      : [];
  return {
    list,
    total: result.total,
    finished:
      result.finished ??
      (result.total == null ? list.length < pageSize : undefined),
  };
}

function mergeOptions(prev: ProFormOption[], next: ProFormOption[]) {
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

export type UseRemoteListOptionsParams = {
  resolveLoadOptions: () => LoadOptionsFn | undefined;
  getPageSize: () => unknown;
};

export function useRemoteListOptions({
  resolveLoadOptions,
  getPageSize,
}: UseRemoteListOptionsParams) {
  const remoteOptions = ref<ProFormOption[]>([]) as Ref<ProFormOption[]>;
  const listLoading = ref(false);
  const finished = ref(false);
  const listError = ref(false);
  const keyword = ref('');
  const page = ref(0);
  /** 搜索变更时递增，强制 List 重新挂载并拉取第一页 */
  const listEpoch = ref(0);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let requestId = 0;

  const resetState = () => {
    page.value = 0;
    finished.value = false;
    listError.value = false;
    listLoading.value = false;
    remoteOptions.value = [];
  };

  const fetchPage = async (nextPage: number) => {
    const loadOptions = resolveLoadOptions();
    if (!loadOptions) {
      finished.value = true;
      listLoading.value = false;
      return;
    }

    const pageSize = resolvePageSize(getPageSize());
    const currentId = ++requestId;
    listLoading.value = true;
    listError.value = false;

    try {
      const raw = await loadOptions({
        page: nextPage,
        pageSize,
        keyword: keyword.value || undefined,
      });
      if (currentId !== requestId) return;

      const normalized = normalizeResult(raw, pageSize);
      remoteOptions.value =
        nextPage <= 1
          ? normalized.list
          : mergeOptions(remoteOptions.value, normalized.list);
      page.value = nextPage;

      if (normalized.finished != null) {
        finished.value = normalized.finished;
      } else if (normalized.total != null) {
        finished.value = remoteOptions.value.length >= normalized.total;
      } else {
        finished.value = normalized.list.length < pageSize;
      }
    } catch {
      if (currentId !== requestId) return;
      listError.value = true;
    } finally {
      if (currentId === requestId) {
        listLoading.value = false;
      }
    }
  };

  /** List 会先把 loading 置 true 再触发 load，此处勿再判断 loading */
  const onLoad = () => {
    if (finished.value) return;
    fetchPage(page.value + 1);
  };

  const onSearch = (value: string) => {
    keyword.value = value;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      requestId += 1;
      resetState();
      listEpoch.value += 1;
    }, SEARCH_DEBOUNCE_MS);
  };

  return {
    remoteOptions,
    listLoading,
    finished,
    listError,
    keyword,
    listEpoch,
    onLoad,
    onSearch,
  };
}
