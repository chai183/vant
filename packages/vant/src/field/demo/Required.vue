<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import VanForm from '../../form';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    phone: '手机号',
    comment: '意见',
    required: '必填星号',
    autoRequired: '自动展示星号',
    requiredTop: '顶部对齐必填星号',
  },
  'en-US': {
    phone: 'Phone',
    comment: 'Comment',
    required: 'Required',
    autoRequired: 'Auto Required',
    requiredTop: 'Required with Top Label',
  },
});

const phone = ref('123');
const username = ref('');
const comment = ref('');
</script>

<template>
  <demo-block :title="t('required')">
    <van-cell-group inset>
      <van-field v-model="username" required :label="t('username')" />
      <van-field v-model="phone" required :label="t('phone')" />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('requiredTop')">
    <van-cell-group inset>
      <van-field
        v-model="comment"
        required
        label-align="top"
        type="textarea"
        rows="2"
        :label="t('comment')"
        :placeholder="t('comment')"
      />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('autoRequired')">
    <van-cell-group inset>
      <van-form required="auto">
        <van-field
          v-model="username"
          :rules="[{ required: true }]"
          :label="t('username')"
        />
        <van-field
          v-model="phone"
          :rules="[{ required: false }]"
          :label="t('phone')"
        />
      </van-form>
    </van-cell-group>
  </demo-block>
</template>
