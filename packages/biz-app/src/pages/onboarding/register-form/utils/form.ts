/**
 * 入职登记表 Form 共用工具（详情 / 编辑 / 填写）
 */
import { SCHEMA_STAFF_TYPE_LABEL_MAP } from '@/_components/SchemaProForm';
import type { OnboardingRegisterFormViewDetail } from '@/types/employee/employment/onboarding/register-form';

export function pickString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
    const inner = (value as { value?: unknown }).value;
    return inner == null ? '' : String(inner);
  }
  return String(value);
}

/** 信息卡平铺字段 → model 补全 */
export function viewDetailAsExtra(
  view?: OnboardingRegisterFormViewDetail | null,
) {
  if (!view) return {};
  return {
    name: view.name,
    phone: view.phone,
    staffType: view.staffType,
    staffTypeName: view.staffTypeName,
    orgName: view.departmentName,
    positionName: view.positionName,
    enrollDate: view.enrollDate,
    idCardNo: view.identityCard,
    personalEmail: view.email,
  };
}

/** 从 model 抽列表 / 提交摘要字段 */
export function pickSummaryFromModel(model: Record<string, unknown>) {
  const staffType = pickString(model.staffType);
  return {
    name: pickString(model.name).trim(),
    phone: pickString(model.phone).trim(),
    staffType,
    staffTypeName:
      pickString(model.staffTypeName) ||
      SCHEMA_STAFF_TYPE_LABEL_MAP[staffType] ||
      staffType,
    departmentId: pickString(model.orgId),
    departmentName: pickString(model.orgName),
    enrollDate: pickString(model.enrollDate || model.hireDate),
    committed: true,
  };
}
