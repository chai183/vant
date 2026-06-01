<script setup lang="ts">
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanFieldMoney from '..';

const t = useTranslate({
  'zh-CN': {
    basicUsage: '基础用法',
    errorMessage: '错误提示',
    inputComment: '底部说明',
    slotComment: '底部说明（插槽）',
    label: '转账金额',
    placeholder: '请输入转账金额',
    uppercase: '金额大写',
    amountError: '金额超出可转余额',
    inputCommentText: '单笔转账不超过 50000 元',
    slotCommentText: '插槽：可放费率、到账时间等说明',
    labelTooltip: '转账金额提示',
  },
  'en-US': {
    basicUsage: 'Basic Usage',
    errorMessage: 'Error Message',
    inputComment: 'Input Comment',
    slotComment: 'Input Comment (Slot)',
    label: 'Transfer Amount',
    placeholder: 'Please enter the transfer amount',
    uppercase: 'Amount in words (CN)',
    amountError: 'Amount exceeds available balance',
    inputCommentText: 'Single transfer limit: 50000',
    slotCommentText: 'Slot: fee, arrival time, etc.',
    labelTooltip: 'Transfer amount hint',
  },
});

const value = ref('');
const valueError = ref('999999');
const valueComment = ref('');
const valueSlotComment = ref('');
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-cell-group inset>
      <van-field-money
        v-model="value"
        :label="t('label')"
        :label-tooltip="t('labelTooltip')"
        :placeholder="t('placeholder')"
      />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('errorMessage')">
    <van-cell-group inset>
      <van-field-money
        v-model="valueError"
        :label="t('label')"
        :placeholder="t('placeholder')"
        :error-message="t('amountError')"
      />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('inputComment')">
    <van-cell-group inset>
      <van-field-money
        v-model="valueComment"
        :label="t('label')"
        :placeholder="t('placeholder')"
        :input-comment="t('inputCommentText')"
      />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('slotComment')">
    <van-cell-group inset>
      <van-field-money
        v-model="valueSlotComment"
        :label="t('label')"
        :placeholder="t('placeholder')"
      >
        <template #input-comment>
          <span style="color: var(--van-text-color-2)">{{
            t('slotCommentText')
          }}</span>
        </template>
      </van-field-money>
    </van-cell-group>
  </demo-block>
</template>
