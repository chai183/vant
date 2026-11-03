<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanProForm from '..';
import type { ProFormColumn } from '../types';

const t = useTranslate({
  'zh-CN': {
    wrapperUsage: '区块与折叠分组',
    submit: '提交',
    basicInfo: '基本信息',
    companyPanel: '企业名称',
    companyName: '企业名称',
    companyPlaceholder: '请输入企业名称',
    workExperience: '工作经历',
    addWork: '新增工作经历',
    company: '公司名称',
    position: '担任职位',
    companyPh: '请输入公司名称',
    positionPh: '请输入职位',
    description: '职位描述',
    descriptionPh: '请输入职位描述',
  },
  'en-US': {
    wrapperUsage: 'Section & Collapse Group',
    submit: 'Submit',
    basicInfo: 'Basic Info',
    companyPanel: 'Company',
    companyName: 'Company Name',
    companyPlaceholder: 'Enter company name',
    workExperience: 'Work Experience',
    addWork: 'Add work experience',
    company: 'Company',
    position: 'Position',
    companyPh: 'Enter company',
    positionPh: 'Enter position',
    description: 'Description',
    descriptionPh: 'Enter description',
  },
});

const model = ref({
  name: '',
  workExperiences: [
    { companyName: '', position: '', description: '' },
    { companyName: '', position: '', description: '' },
  ],
});

/**
 * - title + content（子级仍含 content）→ 区块
 * - title + content（字段）→ 静态折叠
 * - title + name + addText / min / max + content（透传 → 多个折叠分组）→ 可增删
 *   外层 title 置顶；每条标题+删除；条内 Collapse；底部添加
 */
const columns = computed<ProFormColumn[]>(() => [
  {
    title: t('basicInfo'),
    content: [
      {
        content: [
          {
            title: t('companyPanel'),
            name: 'name-panel',
            content: [
              {
                name: 'name',
                label: t('companyName'),
                component: 'field',
                fieldProps: {
                  placeholder: t('companyPlaceholder'),
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: t('workExperience'),
    name: 'workExperiences',
    addText: t('addWork'),
    min: 0,
    max: 5,
    defaultItem: {
      companyName: '',
      position: '',
      description: '',
    },
    content: [
      {
        content: [
          {
            title: t('company'),
            name: 'company-panel',
            content: [
              {
                name: 'companyName',
                label: t('company'),
                component: 'field',
                fieldProps: {
                  placeholder: t('companyPh'),
                },
              },
              {
                name: 'position',
                label: t('position'),
                component: 'field',
                fieldProps: {
                  placeholder: t('positionPh'),
                },
              },
            ],
          },
          {
            title: t('description'),
            name: 'description-panel',
            content: [
              {
                name: 'description',
                label: t('description'),
                component: 'field',
                fieldProps: {
                  type: 'textarea',
                  rows: 2,
                  placeholder: t('descriptionPh'),
                },
              },
            ],
          },
        ],
      },
    ],
  },
]);

const onSubmit = (values: Record<string, unknown>) => {
  console.log('pro-form wrapper submit', values);
};
</script>

<template>
  <demo-block :title="t('wrapperUsage')">
    <van-pro-form
      v-model="model"
      :columns="columns"
      :submit-text="t('submit')"
      @submit="onSubmit"
    />
  </demo-block>
</template>
