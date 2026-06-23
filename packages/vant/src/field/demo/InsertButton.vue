<script setup lang="ts">
import VanField from '..';
import VanButton from '../../button';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    sms: '短信验证码',
    sendSMS: '发送验证码',
    insertButton: '插入按钮',
  },
  'en-US': {
    sms: 'SMS',
    sendSMS: 'Send SMS',
    insertButton: 'Insert Button',
  },
});

const sms = ref('');
</script>

<template>
  <demo-block :title="t('insertButton')">
    <van-cell-group inset>
      <van-field
        v-model="sms"
        center
        clearable
        :label="t('sms')"
      >
        <template #button>
          <van-button size="small" type="primary">
            {{ t('sendSMS') }}
          </van-button>
        </template>
      </van-field>
    </van-cell-group>
  </demo-block>
</template>
