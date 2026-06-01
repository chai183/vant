<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    title: '说明与底部',
    label: '文本',
    placeholder: '请输入文本',
    inputComment: '这是一段辅助说明',
    labelComment: '标签下方的备注说明',
    slotLabelComment: '插槽：标签备注可自定义样式',
    slotComment: '插槽：可放链接或强调样式',
    bottomSlot:
      'bottom 插槽：整行展示在标签与输入框下方，适合协议勾选、风险提示等',
  },
  'en-US': {
    title: 'Comment & bottom',
    label: 'Label',
    placeholder: 'Text',
    inputComment: 'Helper text',
    labelComment: 'Note below the label',
    slotLabelComment: 'Slot: custom label note',
    slotComment: 'Slot: links or emphasized text',
    bottomSlot:
      'The bottom slot spans the full row below the label and input — useful for agreements, risk notes, etc.',
  },
});

const value1 = ref('');
const value2 = ref('');
const value3 = ref('');
const value4 = ref('');
const value5 = ref('');
</script>

<template>
  <demo-block :title="t('title')">
    <van-cell-group inset>
      <van-field
        v-model="value4"
        :label="t('label')"
        :placeholder="t('placeholder')"
        :label-comment="t('labelComment')"
      />
      <van-field
        v-model="value5"
        :label="t('label')"
        :placeholder="t('placeholder')"
      >
        <template #label-comment>
          <span>{{ t('slotLabelComment') }}</span>
        </template>
      </van-field>
      <van-field
        v-model="value1"
        :label="t('label')"
        :placeholder="t('placeholder')"
        :input-comment="t('inputComment')"
      />
      <van-field
        v-model="value2"
        :label="t('label')"
        :placeholder="t('placeholder')"
      >
        <template #input-comment>
          <span>{{ t('slotComment') }}</span>
        </template>
      </van-field>
      <van-field
        v-model="value3"
        :label="t('label')"
        :placeholder="t('placeholder')"
      >
        <template #bottom>
          <span style="color: var(--van-text-color-2)">{{ t('bottomSlot') }}</span>
        </template>
      </van-field>
    </van-cell-group>
  </demo-block>
</template>
