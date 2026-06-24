<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    phone: '手机号',
    errorInfo: '错误提示',
    phoneError: '手机号格式错误',
  },
  'en-US': {
    phone: 'Phone',
    errorInfo: 'Error Info',
    phoneError: 'Invalid phone',
  },
});

const phone = ref('123');
const username = ref('');
</script>

<template>
  <demo-block :title="t('errorInfo')">
    <van-cell-group inset>
      <van-field v-model="username" error :label="t('username')" />
      <van-field
        v-model="phone"
        :label="t('phone')"
        :error-message="t('phoneError')"
      />
    </van-cell-group>
  </demo-block>
</template>
