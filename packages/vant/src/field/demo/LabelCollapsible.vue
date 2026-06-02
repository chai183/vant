<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    title: 'Label 收起展开',
    label: '标题',
    placeholder: '请输入内容',
    labelComment: '收起后仍保留标签备注',
    labelAction: '添加',
    withAction: '与 label-action 组合',
  },
  'en-US': {
    title: 'Label Collapse',
    label: 'Title',
    placeholder: 'Text',
    labelComment: 'Label note remains when collapsed',
    labelAction: 'Add',
    withAction: 'With label-action',
  },
});

const value1 = ref('示例内容');
const value2 = ref('');
const expanded = ref(true);
</script>

<template>
  <demo-block :title="t('title')">
    <van-cell-group inset>
      <van-field
        v-model="value1"
        v-model:label-expanded="expanded"
        :label="t('label')"
        :placeholder="t('placeholder')"
        label-align="top"
        label-collapsible
      />
      <van-field
        v-model="value2"
        :label="t('withAction')"
        :placeholder="t('placeholder')"
        :label-comment="t('labelComment')"
        :label-action-text="t('labelAction')"
        label-align="top"
        label-collapsible
      />
    </van-cell-group>
  </demo-block>
</template>
