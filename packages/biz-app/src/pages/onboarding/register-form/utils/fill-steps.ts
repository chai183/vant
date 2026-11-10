/**
 * 填写入职登记表：按模板开关生成步骤
 * 顺序固定为引导页、表单内容、入职材料、承诺与签名
 */
import type { OnboardingRegisterFormTemplateDetail } from '@/types/employee/employment/onboarding/register-form';

export const FILL_STEP = {
  GUIDE: 'guide',
  FORM: 'form',
  MATERIAL: 'material',
  COMMITMENT: 'commitment',
} as const;

export type FillStepKey = (typeof FILL_STEP)[keyof typeof FILL_STEP];

export interface FillStep {
  key: FillStepKey;
  title: string;
}

const STEP_DEFS: Array<{
  key: FillStepKey;
  title: string;
  enabled: (template: OnboardingRegisterFormTemplateDetail) => boolean;
}> = [
  {
    key: FILL_STEP.GUIDE,
    title: '引导页',
    enabled: (template) => template.enableGuide,
  },
  {
    key: FILL_STEP.FORM,
    title: '表单内容',
    enabled: (template) => template.enableForm,
  },
  {
    key: FILL_STEP.MATERIAL,
    title: '入职材料',
    enabled: (template) => template.enableAttach,
  },
  {
    key: FILL_STEP.COMMITMENT,
    title: '承诺与签名',
    enabled: (template) => template.staffPromise,
  },
];

export function buildFillSteps(
  template: OnboardingRegisterFormTemplateDetail | null | undefined,
  options?: { showGuide?: boolean },
) {
  if (!template) return [] as FillStep[];
  const showGuide = options?.showGuide !== false;
  return STEP_DEFS.filter((item) => {
    if (item.key === FILL_STEP.GUIDE) return template.enableGuide && showGuide;
    return item.enabled(template);
  }).map(({ key, title }) => ({ key, title }));
}
