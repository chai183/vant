<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    message: '留言',
    placeholder: '请输入留言',
    showWordLimit: '显示字数统计',
    hideMaxlengthToast: '关闭上限提示',
  },
  'en-US': {
    message: 'Message',
    placeholder: 'Message',
    showWordLimit: 'Show Word Limit',
    hideMaxlengthToast: 'Disable Maxlength Toast',
  },
});

const value = ref('');
const valueWithoutToast = ref('');
</script>

<template>
  <demo-block :title="t('showWordLimit')">
    <van-cell-group inset>
      <van-field
        v-model="value"
        autosize
        show-word-limit
        rows="2"
        type="textarea"
        maxlength="5"
        :label="t('message')"
        :placeholder="t('placeholder')"
      />
      <van-field
        v-model="valueWithoutToast"
        autosize
        show-word-limit
        rows="2"
        type="textarea"
        maxlength="5"
        :show-maxlength-toast="false"
        :label="t('hideMaxlengthToast')"
        :placeholder="t('placeholder')"
      />
    </van-cell-group>
  </demo-block>
</template>
