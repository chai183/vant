import type { MockMethod } from 'vite-plugin-mock';
import type { OnboardingRegisterFormPersonInfo } from '@/types/employee/employment/onboarding/register-form';
import {
  getEntryTemplateDetail,
  getEntryTemplateFieldDetail,
} from './template-data';
import {
  REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT,
  REGISTER_FORM_MATERIAL_FALLBACK_ITEMS,
  REGISTER_FORM_UPDATE_STATUS,
  REGISTER_STATUS,
} from '@/services/api/employee/employment/onboarding/register-form/config';
import { registerFormFiledMetaDataList } from './form-meta';
import {
  appendRegisterFormRecord,
  enrichRegisterFormRow,
  filterRegisterFormList,
  onboardingRegisterFormMockList,
} from './list-data';

const MOCK_PREFIX = '/api/dthr-employee/v4';

/** 无附件材料、无员工承诺的演示登记表 id */
const NO_ATTACHMENT_COMMITMENT_FORM_IDS = new Set([
  'register-form-4',
  'register-form-5',
  'register-form-6',
  'register-form-7',
]);

/** Mock 手写签名占位图 */
const MOCK_SIGNATURE_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='80' viewBox='0 0 240 80'%3E%3Cpath d='M20 52 Q45 18 70 48 T120 42 T180 36' fill='none' stroke='%23333' stroke-width='2'/%3E%3C/svg%3E";

/** Mock 附件图片占位 */
const MOCK_MATERIAL_IMAGE_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23f2f3f5'/%3E%3Ctext x='80' y='84' text-anchor='middle' fill='%23999' font-size='14'%3E已上传%3C/text%3E%3C/svg%3E";

function unifiedSuccess<T>(body: T) {
  return {
    body,
    data: body,
    errorCode: '000000',
    errorMsg: '操作成功',
    success: true,
  };
}

function unifiedFail(errorMsg: string) {
  return {
    body: null,
    data: null,
    errorCode: 'BIZ_ERROR',
    errorMsg,
    message: errorMsg,
    success: false,
  };
}

/** Mock：批量同意时部分单据失败，便于联调反馈页 */
const APPROVE_FAIL_REASON_MAP: Record<string, string> = {
  'register-form-1': '该证件号存在花名册中，无法进行此操作。',
  'register-form-3':
    '姓名、手机号、证件号等3个必填字段未填写，无法进行此操作。',
  'register-form-4':
    '该员工已存在黑名单中，无法进行此操作；入黑名单原因：内容。',
};

function buildPageBody(records: unknown[], total: number) {
  return { records, total };
}

type RegisterFormPersonCache = Partial<OnboardingRegisterFormPersonInfo> & {
  registerTemplate?: Record<string, unknown>;
  formContent?: unknown[];
};

const personInfoCache: Record<string, RegisterFormPersonCache> = {};

function buildDetail(id: string) {
  const source = onboardingRegisterFormMockList.find(
    (item) => String(item.id) === String(id),
  );
  if (!source) return null;

  const row = enrichRegisterFormRow(source);
  const cached = personInfoCache[id] || {};
  const committed = String(row.tag ?? '').trim() === '1';

  const isLiteForm = NO_ATTACHMENT_COMMITMENT_FORM_IDS.has(String(id || ''));
  const formData = cached.formData || {
    'basic-info': [
      {
        name: row.name || '',
        idCardType: 'id_card',
        phone: row.phone || '',
        enrollDate: row.enrollDate || '',
        birthday: '1990-01-01',
        'e-1': row.name || '',
        'e-2': '',
        'e-4': 'UNDER_GRADUATE',
      },
    ],
    education: [
      {
        'edu-1': '宁波大学',
        'edu-2': 'UNDER_GRADUATE',
        'edu-3': '会计学',
      },
    ],
    work: [
      {
        'work-1': '某某科技有限公司',
        'work-2': '会计',
      },
    ],
  };

  const defaultMaterials = isLiteForm
    ? []
    : [
        {
          materialId: 'mat-001',
          fileList: [
            {
              fileId: 'file-mat-001',
              fileName: '学历证书.jpg',
              url: MOCK_MATERIAL_IMAGE_URL,
            },
          ],
        },
        {
          materialId: 'mat-002',
          fileList: [
            {
              fileId: 'file-mat-002',
              fileName: '学位证书.jpg',
              url: MOCK_MATERIAL_IMAGE_URL,
            },
          ],
        },
      ];
  const materials =
    cached.materials !== undefined ? cached.materials : defaultMaterials;
  const formAttachmentList = materials.map((item) => {
    const meta = REGISTER_FORM_MATERIAL_FALLBACK_ITEMS.find(
      (m) => m.id === item.materialId,
    );
    return {
      attachmentItemId: item.materialId,
      name: meta?.name || '附件材料',
      memo: meta?.description || '',
      type: meta?.type || 'IMAGE',
      fileList: (item.fileList || []).map((file) => ({
        fileId: file.fileId,
        fileName: file.fileName,
        fileUrl: file.url,
      })),
    };
  });

  return {
    id: row.id,
    name: row.name,
    orgId: row.departmentId,
    orgName: row.departmentName,
    orgFullPathName: row.departmentName,
    tag: row.tag,
    positionId: row.positionId,
    positionName: row.positionName,
    staffType: row.staffType,
    staffTypeName: row.staffTypeName,
    hireDate: row.enrollDate,
    phone: row.phone,
    personalEmail: row.email || '',
    idCardNo: row.identityCard,
    registerStatus: row.registerStatus,
    source: row.source,
    processFormId: row.processFormId,
    entryProcessFormId: row.entryProcessFormId,
    templateId: row.templateId || 'register-form-template-1',
    submitTime: row.submitTime,
    formFiledMetaDataList:
      Array.isArray(cached.formContent) && cached.formContent.length
        ? cached.formContent
        : registerFormFiledMetaDataList,
    formData,
    formAttachmentList,
    registerTemplate: cached.registerTemplate || {
      id: row.templateId || 'register-form-template-1',
      enableAttach: !isLiteForm,
      staffPromise: !isLiteForm,
      promiseContent: REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT,
      signature: committed,
    },
    signId: cached.commitment?.signId || (committed ? 'sign-file-001' : ''),
    signUrl: cached.commitment?.signUrl
      ? String(cached.commitment.signUrl)
      : committed
        ? MOCK_SIGNATURE_URL
        : '',
    signatureSigned: cached.commitment
      ? Boolean(cached.commitment.signed)
      : committed,
  };
}

function pageResponse({ body }: { body: Record<string, unknown> }) {
  const pageNum = Number(body.pageNum) || 1;
  const pageSize = Number(body.pageSize) || 10;
  const filtered = filterRegisterFormList(
    body.listType as string | number,
    body,
  );
  const start = (pageNum - 1) * pageSize;
  const records = filtered
    .slice(start, start + pageSize)
    .map(enrichRegisterFormRow);
  return unifiedSuccess(buildPageBody(records, filtered.length));
}

function deleteResponse({ body }: { body: Record<string, unknown> }) {
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
  ids.forEach((id) => {
    const idx = onboardingRegisterFormMockList.findIndex(
      (item) => String(item.id) === id,
    );
    if (idx >= 0) onboardingRegisterFormMockList.splice(idx, 1);
  });
  return unifiedSuccess({ successCount: ids.length });
}

function detailResponse({ body }: { body: Record<string, unknown> }) {
  const id = String(body?.id || '');
  const detail = buildDetail(id);
  if (!detail) {
    return {
      body: null,
      data: null,
      errorCode: '404',
      errorMsg: '入职登记表不存在',
      success: false,
    };
  }
  return unifiedSuccess(detail);
}

function templateDetailResponse({ url }: { url: string }) {
  const matched = String(url || '')
    .split('?')[0]
    .match(/\/entry\/entry-template\/detail\/([^/]+)$/);
  const templateId = decodeURIComponent(matched?.[1] ?? '');
  const detail = getEntryTemplateDetail(templateId);
  if (!detail) {
    return unifiedFail('模板不存在');
  }
  return unifiedSuccess(detail);
}

function templateFieldResponse({ url }: { url: string }) {
  const matched = String(url || '')
    .split('?')[0]
    .match(/\/entry\/entry-template\/detail\/field\/([^/]+)$/);
  const templateId = decodeURIComponent(matched?.[1] ?? '');
  const fieldList = getEntryTemplateFieldDetail(templateId);
  if (!fieldList) {
    return unifiedFail('模板不存在');
  }
  return unifiedSuccess(fieldList);
}

function materialResponse({ url }: { url: string }) {
  const matched = String(url || '')
    .split('?')[0]
    .match(/\/attachment-setting\/getById\/([^/]+)$/);
  const templateId = decodeURIComponent(matched?.[1] ?? '');
  if (!templateId) {
    return {
      body: null,
      data: null,
      errorCode: '404',
      errorMsg: '模板不存在',
      success: false,
    };
  }

  const items = REGISTER_FORM_MATERIAL_FALLBACK_ITEMS.map((item, index) => ({
    id: '',
    fileAttachmentId: item.id,
    templateId,
    name: item.name,
    memo: item.description,
    type: item.type,
    isShow: index < 3,
    isRequired: index === 0,
  }));
  return unifiedSuccess(items);
}

function editResponse({ body }: { body: Record<string, unknown> }) {
  const id = String(body?.id || '');
  if (!id) {
    return {
      body: null,
      data: null,
      errorCode: '500001',
      errorMsg: '缺少登记表 id',
      success: false,
    };
  }

  const attachmentList = Array.isArray(body?.attachmentList)
    ? body.attachmentList
    : undefined;
  const materials = attachmentList
    ? attachmentList.map((item) => {
        const source = (item && typeof item === 'object' ? item : {}) as Record<
          string,
          unknown
        >;
        const fileList = Array.isArray(source.fileList) ? source.fileList : [];
        return {
          materialId: String(
            source.attachmentItemId ?? source.materialId ?? '',
          ),
          fileList: fileList.map((file) => {
            const fileSource = (
              file && typeof file === 'object' ? file : {}
            ) as Record<string, unknown>;
            return {
              fileId: String(fileSource.fileId ?? ''),
              fileName: String(fileSource.fileName ?? ''),
              url: String(fileSource.fileUrl ?? fileSource.url ?? ''),
            };
          }),
        };
      })
    : undefined;

  personInfoCache[id] = {
    ...(personInfoCache[id] || {}),
    formData:
      (body?.formData as OnboardingRegisterFormPersonInfo['formData']) ??
      personInfoCache[id]?.formData,
    materials: materials ?? personInfoCache[id]?.materials,
  };

  const target = onboardingRegisterFormMockList.find(
    (item) => String(item.id) === id,
  );
  const formData = body?.formData as
    | Record<string, Array<Record<string, unknown>>>
    | undefined;
  const basic = formData?.basic_info?.[0] || formData?.['basic-info']?.[0];
  if (target && basic) {
    if (basic.name != null) target.name = String(basic.name);
    if (basic.phone != null) target.phone = String(basic.phone);
    if (basic.enrollDate != null || basic.hireDate != null) {
      target.enrollDate = String(basic.enrollDate || basic.hireDate);
    }
    const orgName = basic.orgName ?? basic.departmentName;
    if (orgName != null) target.departmentName = String(orgName);
    if (basic.staffType != null) target.staffType = String(basic.staffType);
    if (basic.staffTypeName != null) {
      target.staffTypeName = String(basic.staffTypeName);
    }
  }

  return unifiedSuccess(true);
}

function returnResponse({ body }: { body: Record<string, unknown> }) {
  const id = String(body.id || '');
  const target = onboardingRegisterFormMockList.find(
    (item) => String(item.id) === id,
  );
  if (target) target.registerStatus = REGISTER_STATUS.RECHECK;
  return unifiedSuccess({ id, registerStatus: REGISTER_STATUS.RECHECK });
}

function rejectResponse({ body }: { body: Record<string, unknown> }) {
  const id = String(body.id || '');
  const target = onboardingRegisterFormMockList.find(
    (item) => String(item.id) === id,
  );
  if (target) target.registerStatus = REGISTER_STATUS.REJECTED;
  return unifiedSuccess({ id, registerStatus: REGISTER_STATUS.REJECTED });
}

function approveResponse({ body }: { body: Record<string, unknown> }) {
  const id = String(body.id || '');
  const failReason = APPROVE_FAIL_REASON_MAP[id];
  if (failReason) {
    return unifiedFail(failReason);
  }
  const target = onboardingRegisterFormMockList.find(
    (item) => String(item.id) === id,
  );
  if (target) target.registerStatus = REGISTER_STATUS.PASSED;
  return unifiedSuccess({ id, registerStatus: REGISTER_STATUS.PASSED });
}

function fillResponse({ body }: { body: Record<string, unknown> }) {
  const committed = Boolean(body.committed);
  const isDraft =
    Number(body.formUpdateStatus) === REGISTER_FORM_UPDATE_STATUS.DRAFT;
  const formData = body.formData as
    | Record<string, Array<Record<string, unknown>>>
    | undefined;
  const basic = formData?.basic_info?.[0] || {};
  const name = String(body.name || basic.name || '');
  const phone = String(body.phone || basic.phone || '');
  const staffType = String(body.staffType || basic.staffType || 'fulltime');
  const staffTypeName = String(
    body.staffTypeName || basic.staffTypeName || '全职',
  );
  const departmentId = String(body.departmentId || basic.orgId || 'dept-1');
  const departmentName = String(body.departmentName || basic.orgName || '');
  const enrollDate = String(
    body.enrollDate || basic.enrollDate || basic.hireDate || '',
  );
  const templateId = String(body.templateId || '');
  const row = appendRegisterFormRecord({
    name,
    phone,
    staffType,
    staffTypeName,
    departmentId,
    departmentName,
    enrollDate,
    templateId,
    tag: committed ? 1 : '',
    // 草稿落「待提交」，正式提交落「审批中」
    registerStatus: isDraft
      ? REGISTER_STATUS.WAIT_COMMIT
      : REGISTER_STATUS.CONFIRM,
  });
  const materials = Array.isArray(body.materials)
    ? (body.materials as OnboardingRegisterFormPersonInfo['materials'])
    : undefined;
  const commitment =
    body.commitment && typeof body.commitment === 'object'
      ? (body.commitment as OnboardingRegisterFormPersonInfo['commitment'])
      : undefined;
  personInfoCache[String(row.id)] = {
    formData,
    materials,
    commitment,
    formContent: Array.isArray(body.formContent) ? body.formContent : undefined,
    registerTemplate:
      body.registerTemplate && typeof body.registerTemplate === 'object'
        ? (body.registerTemplate as Record<string, unknown>)
        : undefined,
  };
  return unifiedSuccess(row);
}

const mocks: MockMethod[] = [
  {
    url: `${MOCK_PREFIX}/entry-registration-form/page`,
    method: 'post',
    response: pageResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry-registration-form/delete-batch`,
    method: 'post',
    response: deleteResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry-registration-form/detail`,
    method: 'post',
    response: detailResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry-registration-form/edit`,
    method: 'post',
    response: editResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry-registration-form/recheck`,
    method: 'post',
    response: returnResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry-registration-form/rejected`,
    method: 'post',
    response: rejectResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry-registration-form/passed`,
    method: 'post',
    response: approveResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry-registration-form/fill`,
    method: 'post',
    response: fillResponse,
  },
  {
    url: new RegExp(`${MOCK_PREFIX}/entry/entry-template/detail/field/[^/]+$`),
    method: 'post',
    response: templateFieldResponse,
  },
  {
    url: new RegExp(`${MOCK_PREFIX}/entry/entry-template/detail/[^/]+$`),
    method: 'post',
    response: templateDetailResponse,
  },
  {
    url: new RegExp(
      `${MOCK_PREFIX}/entry/entry-template/attachment-setting/getById/[^/]+$`,
    ),
    method: 'get',
    response: materialResponse,
  },
];

export default mocks;
