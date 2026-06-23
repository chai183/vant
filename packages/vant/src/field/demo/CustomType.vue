<script setup lang="ts">
import VanField from '..';
import VanForm from '../../form';
import VanCellGroup from '../../cell-group';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    text: '文本',
    digit: '整数',
    phone: '手机号',
    number: '数字',
    money: '金额',
    moneyNoCurrency: '金额（无货币符号）',
    customType: '自定义类型',
    password: '密码',
    account: '账号',
    idcard: '身份证',
    ukey: 'UKey',
    textarea: '文本录入',
  },
  'en-US': {
    text: 'Text',
    digit: 'Digit',
    phone: 'Phone',
    number: 'Number',
    money: 'Money',
    moneyNoCurrency: 'Money (No Currency)',
    customType: 'Custom Type',
    password: 'Password',
    account: 'Account',
    idcard: 'ID Card',
    ukey: 'UKey',
    textarea: 'Textarea',
  },
});

const text = ref('');
const phone = ref('');
const digit = ref('');
const number = ref('');
const money = ref('');
const moneyNoCurrency = ref('');
const password = ref('');
const account = ref('');
const idcard = ref('');
const ukey = ref('');
</script>

<template>
  <demo-block :title="t('customType')">
    <van-cell-group inset>
      <van-form>
        <van-field
          v-model="text"
          :label="t('text')"
          autocomplete="off"
        />
        <van-field
          v-model="phone"
          type="tel"
          :label="t('phone')"
        />
        <van-field
          v-model="digit"
          type="digit"
          :label="t('digit')"
        />
        <van-field
          v-model="number"
          type="number"
          :label="t('number')"
        />
        <van-field
          v-model="money"
          type="money"
          :label="t('money')"
        />
        <van-field
          v-model="moneyNoCurrency"
          type="money"
          :label="t('moneyNoCurrency')"
          :show-money-currency="false"
        />
        <van-field
          v-model="password"
          type="password"
          :label="t('password')"
          autocomplete="off"
        />
        <van-field
          v-model="account"
          type="account"
          :label="t('account')"
          autocomplete="off"
        />
        <van-field
          v-model="idcard"
          type="idcard"
          :label="t('idcard')"
          autocomplete="off"
        />
        <van-field
          v-model="ukey"
          type="ukey"
          :label="t('ukey')"
          autocomplete="off"
        />
        <van-field
          v-model="text"
          label-align="top"
          autosize
          :label="t('text')"
          autocomplete="off"
        />
      </van-form>
    </van-cell-group>
  </demo-block>
</template>
