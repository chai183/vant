import type {
  OnboardingRegisterFormApproveParams,
  OnboardingRegisterFormDetailResult,
  OnboardingRegisterFormEditParams,
  OnboardingRegisterFormFillParams,
  OnboardingRegisterFormPageParams,
  OnboardingRegisterFormPageResult,
  OnboardingRegisterFormRejectParams,
  OnboardingRegisterFormReturnParams,
  OnboardingRegisterFormTemplateDetail,
} from '@/types/employee/employment/onboarding/register-form';
import apiClient from '@/services/api';
import {
  ONBOARDING_REGISTER_FORM_APPROVE_URL,
  ONBOARDING_REGISTER_FORM_DELETE_URL,
  ONBOARDING_REGISTER_FORM_EDIT_URL,
  ONBOARDING_REGISTER_FORM_PAGE_URL,
  ONBOARDING_REGISTER_FORM_REJECT_URL,
  ONBOARDING_REGISTER_FORM_RETURN_URL,
  ONBOARDING_REGISTER_FORM_TEMPLATE_DETAIL_URL,
  ONBOARDING_REGISTER_FORM_TEMPLATE_FORM_CONTENT_URL,
  ONBOARDING_REGISTER_FORM_TEMPLATE_MATERIAL_URL,
  ONBOARDING_REGISTER_FORM_VIEW_DETAIL_URL,
} from './config';
import {
  adaptRegisterFormDetailBody,
  adaptRegisterFormPageBody,
  adaptRegisterFormTemplateDetail,
  adaptRegisterFormTemplateMaterialBody,
  buildRegisterFormApprovalRequest,
  buildRegisterFormEditRequest,
  buildRegisterFormPageRequest,
  EMPTY_REGISTER_FORM_DETAIL,
  EMPTY_REGISTER_FORM_PAGE,
  EMPTY_REGISTER_FORM_TEMPLATE_DETAIL,
} from './entity';

interface ApiResponse<T> {
  success?: boolean;
  body?: T;
  message?: string;
  errorMsg?: string;
  errorCode?: string | null;
}

/** 任职管理 - 入职登记表分页查询 */
export async function getOnboardingRegisterFormPageApi(
  data: OnboardingRegisterFormPageParams,
) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ONBOARDING_REGISTER_FORM_PAGE_URL,
    method: 'post',
    data: buildRegisterFormPageRequest(
      data as unknown as Record<string, unknown>,
    ),
  });
  return {
    ...response,
    body: response.success
      ? adaptRegisterFormPageBody(response.body)
      : EMPTY_REGISTER_FORM_PAGE,
  } as ApiResponse<OnboardingRegisterFormPageResult>;
}

/** 任职管理 - 删除入职登记表（单条 / 批量共用） */
export function deleteOnboardingRegisterFormApi(ids: string[]) {
  return apiClient({
    url: ONBOARDING_REGISTER_FORM_DELETE_URL,
    method: 'post',
    data: { ids },
  });
}

/** 任职管理 - 入职登记表查看页详情（入参仅 id） */
export async function getOnboardingRegisterFormViewDetailApi(data: {
  id: string;
}) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: ONBOARDING_REGISTER_FORM_VIEW_DETAIL_URL,
    method: 'post',
    data: { id: data.id },
  });
  return {
    ...response,
    body: response.success
      ? adaptRegisterFormDetailBody(response.body)
      : EMPTY_REGISTER_FORM_DETAIL,
  } as ApiResponse<OnboardingRegisterFormDetailResult>;
}

/** 任职管理 - 编辑入职登记表 */
export function editOnboardingRegisterFormApi(
  data: OnboardingRegisterFormEditParams,
) {
  return apiClient({
    url: ONBOARDING_REGISTER_FORM_EDIT_URL,
    method: 'post',
    data: buildRegisterFormEditRequest(
      data as unknown as Record<string, unknown>,
    ),
  });
}

function extractTemplateFieldList(body: unknown) {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  const source = body as { data?: unknown; list?: unknown };
  if (Array.isArray(source.data)) return source.data;
  if (Array.isArray(source.list)) return source.list;
  return [];
}

/**
 * 查询入职登记模板详情。
 * 与 PC 一致：主详情 POST /entry-template/detail/{id}，
 * 表单字段 POST /entry-template/detail/field/{id}。
 */
export async function getOnboardingRegisterFormTemplateDetailApi(data: {
  id: string;
}) {
  const [detailResponse, fieldResponse] = await Promise.all([
    apiClient<ApiResponse<unknown>>({
      url: `${ONBOARDING_REGISTER_FORM_TEMPLATE_DETAIL_URL}/${data.id}`,
      method: 'post',
    }),
    apiClient<ApiResponse<unknown>>({
      url: `${ONBOARDING_REGISTER_FORM_TEMPLATE_FORM_CONTENT_URL}/${data.id}`,
      method: 'post',
    }),
  ]);

  if (!detailResponse.success || fieldResponse.success === false) {
    const failed = detailResponse.success ? fieldResponse : detailResponse;
    return {
      ...failed,
      success: false,
      body: { ...EMPTY_REGISTER_FORM_TEMPLATE_DETAIL },
    } as ApiResponse<OnboardingRegisterFormTemplateDetail>;
  }

  const detailBody =
    detailResponse.body && typeof detailResponse.body === 'object'
      ? (detailResponse.body as Record<string, unknown>)
      : {};

  return {
    ...detailResponse,
    body: adaptRegisterFormTemplateDetail({
      ...detailBody,
      formContent: extractTemplateFieldList(fieldResponse.body),
    }),
  } as ApiResponse<OnboardingRegisterFormTemplateDetail>;
}

/** 查询模板入职材料（附件材料 Tab 配置） */
export async function getOnboardingRegisterFormTemplateMaterialApi(data: {
  id: string;
}) {
  const response = await apiClient<ApiResponse<unknown>>({
    url: `${ONBOARDING_REGISTER_FORM_TEMPLATE_MATERIAL_URL}/${data.id}`,
    method: 'get',
  });
  return {
    ...response,
    body: {
      items: response.success
        ? adaptRegisterFormTemplateMaterialBody(response.body)
        : [],
    },
  } as ApiResponse<{ items: Array<Record<string, unknown>> }>;
}

/** 任职管理 - 退回入职登记表 */
export function returnOnboardingRegisterFormApi(
  data: OnboardingRegisterFormReturnParams,
) {
  return apiClient({
    url: ONBOARDING_REGISTER_FORM_RETURN_URL,
    method: 'post',
    data: buildRegisterFormApprovalRequest(
      data as unknown as Record<string, unknown>,
    ),
  });
}

/** 任职管理 - 拒绝入职登记表 */
export function rejectOnboardingRegisterFormApi(
  data: OnboardingRegisterFormRejectParams,
) {
  return apiClient({
    url: ONBOARDING_REGISTER_FORM_REJECT_URL,
    method: 'post',
    data: buildRegisterFormApprovalRequest(
      data as unknown as Record<string, unknown>,
    ),
  });
}

/** 任职管理 - 同意入职登记表 */
export function approveOnboardingRegisterFormApi(
  data: OnboardingRegisterFormApproveParams,
) {
  return apiClient({
    url: ONBOARDING_REGISTER_FORM_APPROVE_URL,
    method: 'post',
    data: buildRegisterFormApprovalRequest(
      data as unknown as Record<string, unknown>,
    ),
  });
}

/** 移动端填写入职登记表（Mock 本地落库） */
export function fillOnboardingRegisterFormApi(
  data: OnboardingRegisterFormFillParams,
) {
  return apiClient({
    url: `${ONBOARDING_REGISTER_FORM_PAGE_URL.replace('/page', '/fill')}`,
    method: 'post',
    data,
  });
}
