<template>
  <!-- /*----信息集 DATETIME：PickerGroup 同时选日期+时间----*/ -->
  <div
    class="schema-datetime-picker-field"
    :class="{ 'schema-datetime-picker-field-disabled': locked }"
    @click="open"
  >
    <span
      class="schema-datetime-picker-text"
      :class="{ 'schema-datetime-picker-placeholder': !displayValue }"
    >
      {{ displayValue || placeholder }}
    </span>
  </div>
  <van-popup v-model:show="show" position="bottom" round teleport="body">
    <van-picker-group
      title="选择日期时间"
      :tabs="['选择日期', '选择时间']"
      @confirm="onConfirm"
      @cancel="show = false"
    >
      <van-date-picker v-model="dateValue" :columns-type="dateColumnsType" />
      <van-time-picker v-model="timeValue" :columns-type="timeColumnsType" />
    </van-picker-group>
  </van-popup>
</template>

<script lang="ts" setup>
/**
 * SchemaProForm DATETIME 控件：component = schemaDateTimePicker
 * 外层 Field 负责 label / is-link；本组件用 PickerGroup 组合 DatePicker + TimePicker
 */
import { computed, ref, watch } from 'vue';
import type { ProFormColumn } from 'vant';

defineOptions({ name: 'SchemaDateTimePickerField' });

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    column?: ProFormColumn;
    dateColumnsType?: Array<'year' | 'month' | 'day'>;
    timeColumnsType?: Array<'hour' | 'minute' | 'second'>;
    disabled?: boolean;
    readonly?: boolean;
  }>(),
  {
    modelValue: '',
    column: undefined,
    dateColumnsType: () => ['year', 'month', 'day'],
    timeColumnsType: () => ['hour', 'minute', 'second'],
    disabled: false,
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const show = ref(false);
const dateValue = ref<string[]>([]);
const timeValue = ref<string[]>(['00', '00', '00']);

const displayValue = computed(() => props.modelValue || '');

const placeholder = computed(() =>
  String(props.column?.fieldProps?.placeholder || '请选择'),
);

const locked = computed(() => Boolean(props.disabled || props.readonly));

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function nowDateParts() {
  const d = new Date();
  return [String(d.getFullYear()), pad2(d.getMonth() + 1), pad2(d.getDate())];
}

function nowTimeParts(withSecond: boolean) {
  const d = new Date();
  const parts = [pad2(d.getHours()), pad2(d.getMinutes())];
  if (withSecond) parts.push(pad2(d.getSeconds()));
  return parts;
}

/** 解析 model：支持 2026/01/15 14:30:00 或 2026-01-15 14:30:00 */
function parseModel(value?: string) {
  const withSecond = props.timeColumnsType?.includes('second');
  const text = String(value || '').trim();
  if (!text) {
    return {
      date: nowDateParts().slice(0, props.dateColumnsType?.length || 3),
      time: nowTimeParts(Boolean(withSecond)),
    };
  }

  const [datePart = '', timePart = ''] = text.split(/\s+/);
  const dateSep = datePart.includes('/') ? '/' : '-';
  const dateParts = datePart.split(dateSep).filter(Boolean);
  const timeParts = timePart.split(':').filter(Boolean);

  const dateLen = props.dateColumnsType?.length || 3;
  const fallbackDate = nowDateParts();
  const date = Array.from(
    { length: dateLen },
    (_, i) => dateParts[i] || fallbackDate[i],
  );

  const fallbackTime = nowTimeParts(Boolean(withSecond));
  const timeLen = withSecond ? 3 : 2;
  const time = Array.from(
    { length: timeLen },
    (_, i) => timeParts[i] || fallbackTime[i],
  );

  return { date, time };
}

function formatModel(date: string[], time: string[]) {
  return `${date.join('/')} ${time.join(':')}`;
}

watch(
  () => props.modelValue,
  (value) => {
    const parsed = parseModel(value);
    dateValue.value = parsed.date;
    timeValue.value = parsed.time;
  },
  { immediate: true },
);

function open() {
  if (locked.value) return;
  const parsed = parseModel(props.modelValue);
  dateValue.value = parsed.date;
  timeValue.value = parsed.time;
  show.value = true;
}

function onConfirm() {
  emit('update:modelValue', formatModel(dateValue.value, timeValue.value));
  show.value = false;
}
</script>

<style scoped lang="less">
.schema-datetime-picker-field {
  width: 100%;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.schema-datetime-picker-field-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.schema-datetime-picker-text {
  font-size: var(--van-cell-font-size, 14px);
  line-height: var(--van-cell-line-height, 24px);
  color: var(--van-field-input-text-color, #323233);
}

.schema-datetime-picker-placeholder {
  color: var(--van-field-placeholder-text-color, #c8c9cc);
}
</style>
