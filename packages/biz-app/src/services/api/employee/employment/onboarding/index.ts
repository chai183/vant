import type {
  WaitEntryConfirmResult,
  WaitEntryCreateFormFieldsParams,
  WaitEntryFormFieldSet,
} from '@/types/employee/employment/onboarding';
import apiClient from '@/services/api';
import {
  ONBOARDING_REGISTER_FORM_TEMPLATE_PAGE_URL,
  WAIT_ENTRY_CONFIRM_URL,
  WAIT_ENTRY_CREATE_FORM_FIELDS_URL,
} from './config';

interface ApiResponse<T> {
  success?: boolean;
  body?: T;
  message?: string;
  errorMsg?: string;
  errorCode?: string | null;
}

/** 确认入职空结果 */
const EMPTY_CONFIRM_RESULT: WaitEntryConfirmResult = {
  successCount: 0,
  failCount: 0,
  failList: [],
  isGoConfirmPage: false,
  controlWarnResult: null,
};

/**
 * 确认入职返参兜底（对齐 PC getWaitEntryConfirmSource）
 */
function getWaitEntryConfirmSource(body: unknown): WaitEntryConfirmResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ...EMPTY_CONFIRM_RESULT };
  }
  const raw = body as Record<string, unknown>;
  const nested = raw.data;
  const source =
    nested &&
    typeof nested === 'object' &&
    !Array.isArray(nested) &&
    (Array.isArray((nested as Record<string, unknown>).failList) ||
      (nested as Record<string, unknown>).successCount != null ||
      (nested as Record<string, unknown>).failCount != null)
      ? (nested as Record<string, unknown>)
      : raw;

  const failList = Array.isArray(source.failList)
    ? source.failList.map((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return { staffName: '', errorMessage: '', isGoConfirmPage: false };
        }
        const row = item as Record<string, unknown>;
        return {
          staffName: row.staffName == null ? '' : String(row.staffName),
          errorMessage:
            row.errorMessage == null && row.errorMsg == null
              ? ''
              : String(row.errorMessage ?? row.errorMsg),
          isGoConfirmPage: Boolean(row.isGoConfirmPage),
        };
      })
    : [];

  return {
    successCount: Number(source.successCount ?? 0) || 0,
    failCount: Number(source.failCount ?? failList.length) || 0,
    failList,
    isGoConfirmPage: Boolean(
      source.isGoConfirmPage ?? failList[0]?.isGoConfirmPage,
    ),
    controlWarnResult:
      (source.controlWarnResult as
        | Record<string, unknown>
        | null
        | undefined) ?? null,
  };
}

export type EntryTemplateListItem = {
  id: string;
  name: string;
  status?: boolean;
  statusName?: string;
};

export type EntryTemplatePageResult = {
  records: EntryTemplateListItem[];
  total: number;
};

export type EntryTemplatePageParams = {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  status?: boolean;
};

/** 适配模板分页 body（对齐 PC adaptTemplatePageBody） */
function adaptTemplatePageBody(body: unknown): EntryTemplatePageResult {
  const source =
    (body as { templateList?: unknown } | null)?.templateList ?? body ?? {};
  const page = source as {
    records?: unknown[];
    list?: unknown[];
    total?: number;
  };
  const rawRecords = Array.isArray(source)
    ? source
    : (page.records ?? page.list ?? []);
  const records = (Array.isArray(rawRecords) ? rawRecords : [])
    .map((item) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: String(row.id ?? row.templateId ?? ''),
        name: String(row.name ?? row.templateName ?? ''),
        status: row.status === true,
        statusName: row.statusName != null ? String(row.statusName) : undefined,
      };
    })
    .filter((item) => item.id);
  return {
    records,
    total: Array.isArray(source)
      ? records.length
      : Number(page.total ?? records.length),
  };
}

/**
 * 查询新增待入职 / 填写入职登记表字段配置
 * POST /entry/staff/add-entry/field/search
 * 入参：{ type: 'entry-wait' }；返参：信息集 setList（setCode → groupList → fieldList）
 */
export async function getWaitEntryCreateFormFieldsApi(
  data: WaitEntryCreateFormFieldsParams,
) {
  const response = await apiClient<ApiResponse<WaitEntryFormFieldSet[]>>({
    url: WAIT_ENTRY_CREATE_FORM_FIELDS_URL,
    method: 'post',
    data,
  });
  return {
    ...response,
    body: response.success && Array.isArray(response.body) ? response.body : [],
  } as ApiResponse<WaitEntryFormFieldSet[]>;
}

/**
 * 入职登记表模板分页查询（对齐 PC getOnboardingRegisterFormTemplatePageApi）
 * POST /entry/entry-template/page
 */
export async function getOnboardingRegisterFormTemplatePageApi(
  data: EntryTemplatePageParams = {},
) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ONBOARDING_REGISTER_FORM_TEMPLATE_PAGE_URL,
    method: 'post',
    data: {
      name: data.name,
      status: data.status,
      pageNum: data.pageNum ?? 1,
      pageSize: data.pageSize ?? 20,
    },
  });
  return {
    ...response,
    body: response.success
      ? adaptTemplatePageBody(response.body)
      : { records: [], total: 0 },
  } as ApiResponse<EntryTemplatePageResult>;
}

/**
 * 确认入职（单条 / 批量共用）
 * POST /entry-process-form/confirm
 */
export async function confirmWaitEntryApi(entryProcessFormIds: string[]) {
  const response = await apiClient<ApiResponse<WaitEntryConfirmResult>>({
    url: WAIT_ENTRY_CONFIRM_URL,
    method: 'post',
    data: { entryProcessFormIds },
  });
  if (!response.success) {
    return {
      ...response,
      body: { ...EMPTY_CONFIRM_RESULT },
    } as ApiResponse<WaitEntryConfirmResult>;
  }
  return {
    ...response,
    body: getWaitEntryConfirmSource(response.body),
  } as ApiResponse<WaitEntryConfirmResult>;
}
