<template>
  <van-config-provider :theme="vantTheme" :theme-vars="themeVars">
    <router-view />
  </van-config-provider>
</template>

<script lang="ts" setup>
import { useLocale } from '@/_composables/_useLocale';
import { useTheme } from '@/_composables/_useTheme';

const { themeVars, vantTheme, initTheme } = useTheme();
const { initLocale } = useLocale();

initTheme();
initLocale();
</script>
