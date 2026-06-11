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
    smsPlaceholder: '请输入短信验证码',
    textPlaceholder: '请输入文本',
    digitPlaceholder: '请输入整数',
    phonePlaceholder: '请输入手机号',
    numberPlaceholder: '请输入数字（支持小数）',
    moneyPlaceholder: '请输入金额',
    passwordPlaceholder: '请输入密码',
    accountPlaceholder: '请输入账号',
    account: '账号',
    idcard: '身份证',
    idcardPlaceholder: '请输入身份证',
    ukey: 'UKey',
    ukeyPlaceholder: '请输入UKey',
    textarea: '文本录入',
    textareaPlaceholder: '请输入文本录入',
  },
  'en-US': {
    text: 'Text',
    digit: 'Digit',
    phone: 'Phone',
    number: 'Number',
    money: 'Money',
    moneyNoCurrency: 'Money (No Currency)',
    customType: 'Custom Type',
    smsPlaceholder: 'SMS',
    textPlaceholder: 'Text',
    digitPlaceholder: 'Digit',
    phonePlaceholder: 'Phone',
    numberPlaceholder: 'Number',
    moneyPlaceholder: 'Please enter amount',
    passwordPlaceholder: 'Password',
    accountPlaceholder: 'Account',
    account: 'Account',
    idcard: 'ID Card',
    idcardPlaceholder: 'Please enter the ID card',
    ukey: 'UKey',
    ukeyPlaceholder: 'Please enter the UKey',
    textarea: 'Textarea',
    textareaPlaceholder: 'Please enter the textarea',
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
          :placeholder="t('textPlaceholder')"
          autocomplete="off"
        />
        <van-field
          v-model="phone"
          type="tel"
          :label="t('phone')"
          :placeholder="t('phonePlaceholder')"
        />
        <van-field
          v-model="digit"
          type="digit"
          :label="t('digit')"
          :placeholder="t('digitPlaceholder')"
        />
        <van-field
          v-model="number"
          type="number"
          :label="t('number')"
          :placeholder="t('numberPlaceholder')"
        />
        <van-field
          v-model="money"
          type="money"
          :label="t('money')"
          :placeholder="t('moneyPlaceholder')"
        />
        <van-field
          v-model="moneyNoCurrency"
          type="money"
          :label="t('moneyNoCurrency')"
          :placeholder="t('moneyPlaceholder')"
          :show-money-currency="false"
        />
        <van-field
          v-model="password"
          type="password"
          :label="t('password')"
          :placeholder="t('passwordPlaceholder')"
          autocomplete="off"
        />
        <van-field
          v-model="account"
          type="account"
          :label="t('account')"
          :placeholder="t('accountPlaceholder')"
          autocomplete="off"
        />
        <van-field
          v-model="idcard"
          type="idcard"
          :label="t('idcard')"
          :placeholder="t('idcardPlaceholder')"
          autocomplete="off"
        />
        <van-field
          v-model="ukey"
          type="ukey"
          :label="t('ukey')"
          :placeholder="t('ukeyPlaceholder')"
          autocomplete="off"
        />
        <van-field
          v-model="text"
          label-align="top"
          autosize
          :label="t('text')"
          :placeholder="t('textPlaceholder')"
          autocomplete="off"
        />
      </van-form>
    </van-cell-group>
  </demo-block>
</template>
