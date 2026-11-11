<template>
  <SchemaCard
    :loading="loading"
    :groups="groups"
    :model-value="formData"
    :records="mode === 'multi' ? records : []"
    :record-title="tabName"
  />
</template>

<script lang="ts" setup>
import SchemaCard from '@/_components/SchemaCard';
import type {
  RosterDetailFormData,
  RosterDetailGroup,
  RosterDetailRecord,
} from '@/types/employee/roster';

withDefaults(
  defineProps<{
    loading?: boolean;
    mode?: 'single' | 'multi';
    tabName?: string;
    groups?: RosterDetailGroup[];
    formData?: RosterDetailFormData;
    records?: RosterDetailRecord[];
  }>(),
  {
    loading: false,
    mode: 'single',
    tabName: '',
    groups: () => [],
    formData: () => ({}),
    records: () => [],
  },
);
</script>
