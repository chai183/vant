import type { RouteRecordRaw } from 'vue-router';

const onboardingRoutes: RouteRecordRaw[] = [
  {
    path: '/onboarding/register-form',
    component: () => import('@/pages/onboarding/register-form/index.vue'),
    name: 'OnboardingRegisterForm',
    meta: {
      title: '入职登记表管理',
    },
  },
  {
    path: '/onboarding/register-form/detail/:id',
    component: () => import('@/pages/onboarding/register-form/detail.vue'),
    name: 'OnboardingRegisterFormDetail',
    meta: {
      title: '入职登记表详情',
    },
  },
  {
    path: '/onboarding/register-form/edit/:id',
    component: () => import('@/pages/onboarding/register-form/edit.vue'),
    name: 'OnboardingRegisterFormEdit',
    meta: {
      title: '编辑入职登记表',
    },
  },
  {
    path: '/onboarding/register-form/fill/:templateId?',
    component: () => import('@/pages/onboarding/register-form/fill.vue'),
    name: 'OnboardingRegisterFormFill',
    meta: {
      title: '填写入职登记表',
    },
  },
  {
    path: '/onboarding/register-form/qr',
    component: () => import('@/pages/onboarding/register-form/qr.vue'),
    name: 'OnboardingRegisterFormQr',
    meta: {
      title: '扫码填写入职登记表',
    },
  },
  {
    path: '/onboarding/register-form/batch-feedback',
    component: () =>
      import('@/pages/onboarding/register-form/batch-feedback.vue'),
    name: 'OnboardingRegisterFormBatchFeedback',
    meta: {
      title: '批量操作反馈',
    },
  },
  {
    path: '/onboarding/schema-field-types',
    component: () => import('@/pages/onboarding/schema-field-types/index.vue'),
    name: 'OnboardingSchemaFieldTypes',
    meta: {
      title: '字段类型配置全场景',
    },
  },
];

export default onboardingRoutes;
