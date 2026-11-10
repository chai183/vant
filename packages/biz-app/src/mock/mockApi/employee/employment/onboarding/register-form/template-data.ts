/**
 * 入职登记模板详情 mock
 * 三个已启用模板对应不同步骤组合，便于填写页按配置渲染
 */
import { REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT } from '@/services/api/employee/employment/onboarding/register-form/config';
import { registerFormFiledMetaDataList } from './form-meta';

const GUIDE_FULL =
  '欢迎办理入职。请按页面引导完成登记：先阅读本说明，再如实填写个人信息，按要求上传入职材料，最后阅读员工承诺并完成手写签名。';

const GUIDE_SIMPLE =
  '欢迎完成入职登记。请如实填写个人与教育信息，并确认员工承诺。本模板不需要上传入职材料，也不需要手写签名。';

export const entryTemplateDetailMap: Record<string, Record<string, unknown>> = {
  /** 引导页 + 表单 + 入职材料 + 承诺与签名 */
  '11502422011138621448': {
    id: '11502422011138621448',
    name: '入职登记表模板1',
    enableGuide: true,
    guideTitle: '欢迎办理入职',
    guideContent: GUIDE_FULL,
    enableForm: true,
    formContent: registerFormFiledMetaDataList,
    enableAttach: true,
    staffPromise: true,
    promiseContent: REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT,
    signature: true,
  },
  /** 仅表单内容 + 入职材料 */
  '11502422011138621449': {
    id: '11502422011138621449',
    name: '入职登记表模板2',
    enableGuide: false,
    guideTitle: '',
    guideContent: '',
    enableForm: true,
    formContent: registerFormFiledMetaDataList.slice(0, 1),
    enableAttach: true,
    staffPromise: false,
    promiseContent: '',
    signature: false,
  },
  /** 引导页 + 表单 + 承诺（无手写签名、无材料） */
  '11502422011138621450': {
    id: '11502422011138621450',
    name: '入职登记表模板3',
    enableGuide: true,
    guideTitle: '入职须知',
    guideContent: GUIDE_SIMPLE,
    enableForm: true,
    formContent: registerFormFiledMetaDataList.slice(0, 2),
    enableAttach: false,
    staffPromise: true,
    promiseContent: REGISTER_FORM_COMMITMENT_DEFAULT_CONTENT,
    signature: false,
  },
};

/** 主详情 EntryRegisterTemplateDTO，不含表单字段 */
export function getEntryTemplateDetail(id: string) {
  const source = entryTemplateDetailMap[id];
  if (!source) return null;
  return {
    id: source.id,
    name: source.name,
    enableGuide: source.enableGuide,
    guideTitle: source.guideTitle,
    guideContent: source.guideContent,
    enableAttach: source.enableAttach,
    staffPromise: source.staffPromise,
    promiseContent: source.promiseContent,
    signature: source.signature,
  };
}

/** 表单字段详情，结构对齐 detail/field */
export function getEntryTemplateFieldDetail(id: string) {
  const source = entryTemplateDetailMap[id];
  if (!source) return null;
  return source.formContent;
}
