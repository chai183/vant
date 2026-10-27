<template>
  <div />
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const path = Array.isArray(route.params.path)
  ? route.params.path.join('/')
  : route.params.path;

router.replace({ path: `/${path}`, query: route.query });
</script>
