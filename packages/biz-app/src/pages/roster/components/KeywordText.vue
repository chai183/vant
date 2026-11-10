<template>
  <template v-for="(part, index) in parts" :key="index">
    <span v-if="part.hit" class="roster-keyword">{{ part.text }}</span>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { splitKeyword } from '../utils/org';

const props = defineProps<{
  text?: string;
  keyword?: string;
}>();

const parts = computed(() => splitKeyword(props.text, props.keyword));
</script>

<style scoped lang="less">
.roster-keyword {
  color: #ff8125;
}
</style>
