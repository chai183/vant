import type {
  OnboardingRegisterFormDetailResult,
  OnboardingRegisterFormListItem,
  OnboardingRegisterFormPageResult,
  OnboardingRegisterFormTemplateDetail,
} from '@/types/employee/employment/onboarding/register-form';
import {
  isRegisterFormCommittedTag,
  REGISTER_FORM_APPROVAL_NOTIFY,
  REGISTER_FORM_APPROVAL_NOTIFY_TYPE,
  REGISTER_FORM_SOURCE_MAP,
  REGISTER_FORM_TEMPLATE_YES_NO,
  REGISTER_STATUS_MAP,
} from './config';

export const EMPTY_REGISTER_FORM_PAGE: OnboardingRegisterFormPageResult = {
  records: [],
  total: 0,
};

export const EMPTY_REGISTER_FORM_TEMPLATE_DETAIL: OnboardingRegisterFormTemplateDetail =
  {
    id: '',
    name: '',
    enableGuide: false,
    guideTitle: '',
    guideContent: '',
    enableForm: false,
    formContent: [],
    enableAttach: false,
    staffPromise: false,
    promiseContent: '',
    signature: false,
  };

function toTemplateFlag(value: unknown, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return true;
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }
  return Boolean(value);
}

/** 模板详情 → 填写页步骤配置 */
export function adaptRegisterFormTemplateDetail(
  body: unknown,
): OnboardingRegisterFormTemplateDetail {
  const source = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    unknown
  >;
  const nested =
    source.template && typeof source.template === 'object'
      ? (source.template as Record<string, unknown>)
      : source.registerTemplate && typeof source.registerTemplate === 'object'
        ? (source.registerTemplate as Record<string, unknown>)
        : {};
  const row = { ...nested, ...source };
  const formContent = Array.isArray(row.formContent)
    ? row.formContent
    : Array.isArray(row.formFiledMetaDataList)
      ? row.formFiledMetaDataList
      : Array.isArray(row.formFieldMetaDataList)
        ? row.formFieldMetaDataList
        : [];
  const guideContent = String(
    row.guideContent ?? row.guideText ?? row.welcomeContent ?? '',
  ).trim();

  return {
    id: String(row.id ?? row.templateId ?? ''),
    name: String(row.name ?? row.templateName ?? ''),
    enableGuide: toTemplateFlag(
      row.enableGuide ?? row.guideEnable ?? row.showGuide,
      Boolean(guideContent),
    ),
    guideTitle: String(row.guideTitle ?? row.guideName ?? '入职引导'),
    guideContent,
    enableForm:
      row.enableForm === undefined && row.showForm === undefined
        ? formContent.length > 0
        : toTemplateFlag(row.enableForm ?? row.showForm),
    formContent,
    enableAttach: toTemplateFlag(row.enableAttach),
    staffPromise: toTemplateFlag(row.staffPromise),
    promiseContent: String(row.promiseContent ?? '').trim(),
    signature: toTemplateFlag(row.signature),
  };
}

export const EMPTY_REGISTER_FORM_DETAIL: OnboardingRegisterFormDetailResult = {
  viewDetail: {},
  templateId: '',
  formContent: [],
  formData: {},
  materials: [],
  commitment: {},
  registerTemplate: {},
  formAttachmentList: [],
};

function buildRegisterFormNotifyType(notifyMethods: unknown) {
  const methods = Array.isArray(notifyMethods)
    ? notifyMethods.map((item) => String(item))
    : [];
  const hasSms = methods.includes(REGISTER_FORM_APPROVAL_NOTIFY.SMS);
  const hasEmail = methods.includes(REGISTER_FORM_APPROVAL_NOTIFY.EMAIL);

  if (hasSms && hasEmail) return REGISTER_FORM_APPROVAL_NOTIFY_TYPE.BOTH;
  if (hasEmail) return REGISTER_FORM_APPROVAL_NOTIFY_TYPE.EMAIL;
  if (hasSms) return REGISTER_FORM_APPROVAL_NOTIFY_TYPE.SMS;
  return undefined;
}

export function buildRegisterFormEditRequest(
  data: Record<string, unknown> = {},
) {
  const payload: Record<string, unknown> = {
    id: data.id,
    formUpdateStatus: data.formUpdateStatus,
    formData: data.formData,
    attachmentList: data.attachmentList,
  };

  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && !value.length)
    ) {
      delete payload[key];
    }
  });

  return payload;
}

export function buildRegisterFormApprovalRequest(
  data: Record<string, unknown> = {},
) {
  const payload: Record<string, unknown> = {
    id: data.id,
    notifyType: buildRegisterFormNotifyType(data.notifyMethods),
    remark: data.comment ?? data.remark ?? '',
  };

  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (value === undefined || value === '') {
      delete payload[key];
    }
  });

  return payload;
}

function toStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return [String(value)];
}

function normalizeSortType(sortType: unknown) {
  const normalized = String(sortType || '')
    .trim()
    .toLowerCase();
  if (normalized === 'desc') return 'DESC';
  return 'ASC';
}

/** 前端列表查询入参 → 后端 EntryRegistrationFormPageRequestDTO */
export function buildRegisterFormPageRequest(
  data: Record<string, unknown> = {},
) {
  const registerStatusList = toStringList(
    data.registerStatusList ?? data.registerStatus,
  );
  const approveStatusList = toStringList(
    data.approveStatusList ?? data.approveStatus,
  );
  const sortSource = Array.isArray(data.sortConditions)
    ? data.sortConditions
    : Array.isArray(data.orderCondition)
      ? data.orderCondition
      : [];
  const sourceValue =
    data.source === 0 || data.source ? Number(data.source) : undefined;
  const source =
    sourceValue != null && !Number.isNaN(sourceValue) ? sourceValue : undefined;

  const payload: Record<string, unknown> = {
    listType: data.listType,
    name: data.name ?? data.staffName,
    orgIds: toStringList(data.orgIds ?? data.departmentId),
    entryStatus: data.entryStatus,
    positionIds: toStringList(data.positionIds ?? data.positionId),
    staffTypes: toStringList(data.staffTypes ?? data.staffType),
    startDate: data.startDate ?? data.enrollDateStart,
    endDate: data.endDate ?? data.enrollDateEnd,
    phone: data.phone,
    idCardNo: data.idCardNo ?? data.identityCard,
    registerStatusList,
    approveStatusList,
    submitStartDate: data.submitStartDate ?? data.submitTimeStart,
    submitEndDate: data.submitEndDate ?? data.submitTimeEnd,
    tag: data.tag,
    source,
    remark: data.remark,
    serialNo: data.serialNo,
    sortConditions: sortSource
      .map((item: Record<string, unknown>) => ({
        sortField: item.sortField,
        sortType: normalizeSortType(item.sortType),
      }))
      .filter((item) => item.sortField),
    pageNum: data.pageNum,
    pageSize: data.pageSize,
  };

  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && !value.length)
    ) {
      delete payload[key];
    }
  });

  return payload;
}

function adaptRegisterFormTag(item: Record<string, unknown>) {
  const rawTag = item.tag;
  if (isRegisterFormCommittedTag(rawTag)) {
    return { tag: rawTag, tagName: '已承诺' };
  }
  return { tag: rawTag ?? '', tagName: '' };
}

function adaptRegisterFormSource(item: Record<string, unknown>) {
  const {source} = item;
  const sourceKey = source == null || source === '' ? '' : String(source);
  return {
    source,
    sourceName:
      REGISTER_FORM_SOURCE_MAP[sourceKey] ||
      item.sourceName ||
      item.sourceLabel ||
      sourceKey,
  };
}

/** 后端列表行 → 页面 OnboardingRegisterFormListItem */
export function adaptRegisterFormPageRecord(
  item: Record<string, unknown> = {},
): OnboardingRegisterFormListItem {
  const registerStatus = String(
    item.registerStatus || item.approveStatus || '',
  );
  const statusMeta = REGISTER_STATUS_MAP[registerStatus];
  const tagInfo = adaptRegisterFormTag(item);
  const sourceInfo = adaptRegisterFormSource(item);

  return {
    ...item,
    id: String(item.id ?? ''),
    processFormId: String(
      item.processFormId ??
        item.entryProcessFormId ??
        item.entryProcessId ??
        '',
    ),
    entryProcessFormId: String(
      item.processFormId ??
        item.entryProcessFormId ??
        item.entryProcessId ??
        '',
    ),
    templateId: item.templateId as string | undefined,
    name: item.name as string | undefined,
    phone: item.phone as string | undefined,
    identityCard: (item.identityCard ?? item.idCardNo) as string | undefined,
    staffType: item.staffType as string | undefined,
    staffTypeName: item.staffTypeName as string | undefined,
    enrollDate: (item.enrollDate ?? item.hireDate) as string | undefined,
    departmentId: (item.departmentId ?? item.orgId) as string | undefined,
    departmentName: (item.departmentName ??
      item.orgName ??
      item.orgFullPathName) as string | undefined,
    positionId: item.positionId as string | undefined,
    positionName: item.positionName as string | undefined,
    tag: tagInfo.tag as number | string,
    tagName: tagInfo.tagName,
    submitTime: item.submitTime as string | undefined,
    finishTime: item.finishTime as string | undefined,
    source: sourceInfo.source as number | string | undefined,
    sourceName: sourceInfo.sourceName as string,
    registerStatus,
    registerStatusName: statusMeta?.label || registerStatus,
    approveStatus: item.approveStatus as string | undefined,
    entryStatus: item.entryStatus as string | number | undefined,
    serialNo: item.serialNo as string | undefined,
    remark: item.remark as string | undefined,
    email: (item.email ?? item.personalEmail) as string | undefined,
    gender: item.gender as string | undefined,
    birthDate: item.birthDate as string | undefined,
    idCardType: item.idCardType as string | undefined,
  };
}

export function adaptRegisterFormPageBody(
  body: unknown,
): OnboardingRegisterFormPageResult {
  const source = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    unknown
  >;
  const page = (
    source.registerFormList && typeof source.registerFormList === 'object'
      ? source.registerFormList
      : source
  ) as Record<string, unknown>;
  const recordList = Array.isArray(page.records) ? page.records : [];
  const records = recordList.map((item) =>
    adaptRegisterFormPageRecord(item as Record<string, unknown>),
  );

  return {
    records,
    total: Number(page.total) || 0,
  };
}

function adaptRegisterFormAttachmentList(list: unknown[] = []) {
  return list.map((item) => {
    const source = (item && typeof item === 'object' ? item : {}) as Record<
      string,
      unknown
    >;
    const fileList = Array.isArray(source.fileList) ? source.fileList : [];
    return {
      materialId: String(source.attachmentItemId ?? source.materialId ?? ''),
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
  });
}

function adaptRegisterFormCommitment(source: Record<string, unknown> = {}) {
  return {
    signed: Boolean(source.signatureSigned ?? source.signed ?? source.tag),
    signedAt: String(source.signedAt ?? source.submitTime ?? ''),
    signId: String(source.signId ?? ''),
    signUrl: String(source.signUrl ?? source.signatureUrl ?? ''),
  };
}

/** EntryTemplateAttachmentSettingVO[] → 页面材料项 */
export function adaptRegisterFormTemplateMaterialBody(body: unknown) {
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object'
      ? Array.isArray((body as { items?: unknown[] }).items)
        ? (body as { items: unknown[] }).items
        : Array.isArray((body as { data?: unknown[] }).data)
          ? (body as { data: unknown[] }).data
          : []
      : [];

  return list.map((item) => {
    const source = (item && typeof item === 'object' ? item : {}) as Record<
      string,
      unknown
    >;
    const hasAttachmentVOField =
      source.isShow !== undefined ||
      source.isRequired !== undefined ||
      source.memo !== undefined;

    const visible = hasAttachmentVOField
      ? Boolean(source.isShow)
      : Number(source.visible) === REGISTER_FORM_TEMPLATE_YES_NO.YES;
    const required = hasAttachmentVOField
      ? Boolean(source.isRequired)
      : Number(source.required) === REGISTER_FORM_TEMPLATE_YES_NO.YES ||
        Boolean(source.required);

    return {
      id: String(source.fileAttachmentId ?? source.id ?? ''),
      fileAttachmentId: String(source.fileAttachmentId ?? source.id ?? ''),
      name: String(source.name ?? ''),
      memo: String(source.memo ?? source.description ?? ''),
      description: String(source.description ?? source.memo ?? ''),
      type: String(source.type ?? 'IMAGE'),
      visible: visible
        ? REGISTER_FORM_TEMPLATE_YES_NO.YES
        : REGISTER_FORM_TEMPLATE_YES_NO.NO,
      required: required
        ? REGISTER_FORM_TEMPLATE_YES_NO.YES
        : REGISTER_FORM_TEMPLATE_YES_NO.NO,
      showStaffFlag: true,
    };
  });
}

function adaptRegisterFormStatus(item: Record<string, unknown>) {
  const registerStatus = String(item.registerStatus ?? '');
  const statusMeta = REGISTER_STATUS_MAP[registerStatus];
  return {
    registerStatus,
    registerStatusName: statusMeta?.label || registerStatus,
  };
}

function buildRegisterFormCoreDetail(source: Record<string, unknown> = {}) {
  const registerTemplate = (
    source.registerTemplate && typeof source.registerTemplate === 'object'
      ? source.registerTemplate
      : {}
  ) as Record<string, unknown>;
  const templateId = String(source.templateId || registerTemplate.id || '');
  const tagInfo = adaptRegisterFormTag(source);
  const statusInfo = adaptRegisterFormStatus(source);
  const metaList = Array.isArray(source.formFiledMetaDataList)
    ? source.formFiledMetaDataList
    : Array.isArray(source.formFieldMetaDataList)
      ? source.formFieldMetaDataList
      : [];
  const formData =
    source.formData && typeof source.formData === 'object'
      ? source.formData
      : {};

  const viewDetail = {
    id: source.id as string | undefined,
    entryProcessFormId: (source.entryProcessFormId ?? source.processFormId) as
      | string
      | undefined,
    templateId,
    name: source.name as string | undefined,
    avatar: (source.avatar as string | undefined) ?? '',
    tag: tagInfo.tag as number | string,
    tagName: tagInfo.tagName,
    identityCard: (source.idCardNo ?? source.identityCard) as
      | string
      | undefined,
    phone: source.phone as string | undefined,
    email: (source.personalEmail ?? source.email) as string | undefined,
    registerStatus: statusInfo.registerStatus,
    registerStatusName: statusInfo.registerStatusName,
    departmentName: (source.orgName ??
      source.orgFullPathName ??
      source.departmentName) as string | undefined,
    positionName: source.positionName as string | undefined,
    staffType: source.staffType as string | undefined,
    staffTypeName: source.staffTypeName as string | undefined,
    enrollDate: (source.hireDate ?? source.enrollDate) as string | undefined,
  };

  return {
    viewDetail,
    templateId,
    formContent: metaList,
    formData: formData as OnboardingRegisterFormDetailResult['formData'],
  };
}

export function adaptRegisterFormDetailBody(
  body: unknown,
): OnboardingRegisterFormDetailResult {
  const source = (body && typeof body === 'object' ? body : {}) as Record<
    string,
    unknown
  >;
  if (!source.id) {
    return EMPTY_REGISTER_FORM_DETAIL;
  }

  const registerTemplate = (
    source.registerTemplate && typeof source.registerTemplate === 'object'
      ? source.registerTemplate
      : {}
  ) as Record<string, unknown>;
  const formAttachmentList = Array.isArray(source.formAttachmentList)
    ? source.formAttachmentList
    : [];
  const core = buildRegisterFormCoreDetail(source);

  return {
    ...core,
    materials: adaptRegisterFormAttachmentList(formAttachmentList),
    commitment: adaptRegisterFormCommitment(source),
    registerTemplate,
    formAttachmentList,
  };
}
