<template>
  <!--
    仅作为 ProForm Field 的 input 插槽内容，不再包 van-field
    （否则会双层 Field，标签顶对齐、样式与 datePicker 不一致）
  -->
  <div
    class="schema-time-picker-field"
    :class="{ 'schema-time-picker-field-disabled': locked }"
    @click="open"
  >
    <span
      class="schema-time-picker-text"
      :class="{ 'schema-time-picker-placeholder': !displayValue }"
    >
      {{ displayValue || placeholder }}
    </span>
  </div>
  <van-popup v-model:show="show" position="bottom" round teleport="body">
    <van-time-picker
      :columns-type="columnsType"
      v-model="pickerValue"
      @confirm="onConfirm"
      @cancel="show = false"
    />
  </van-popup>
</template>

<script lang="ts" setup>
/**
 * SchemaProForm TIME 控件：component = schemaTimePicker
 * ProForm 外层 Field 负责 label / is-link；本组件只负责展示值 + TimePicker
 */
import { computed, ref, watch } from 'vue';
import type { ProFormColumn } from 'vant';

defineOptions({ name: 'SchemaTimePickerField' });

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    column?: ProFormColumn;
    columnsType?: Array<'hour' | 'minute' | 'second'>;
    disabled?: boolean;
    readonly?: boolean;
  }>(),
  {
    modelValue: '',
    column: undefined,
    columnsType: () => ['hour', 'minute'],
    disabled: false,
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const show = ref(false);
const pickerValue = ref<string[]>(['00', '00']);

const displayValue = computed(() => props.modelValue || '');

const placeholder = computed(() =>
  String(props.column?.fieldProps?.placeholder || '请选择'),
);

/** 表单级禁用 / 只读（勿用 fieldProps.readonly，那是为了禁键盘） */
const locked = computed(() => Boolean(props.disabled || props.readonly));

function parseToPicker(value?: string) {
  const text = String(value || '').trim();
  const parts = text.split(':').filter(Boolean);
  if (props.columnsType?.includes('second')) {
    return [parts[0] || '00', parts[1] || '00', parts[2] || '00'];
  }
  return [parts[0] || '00', parts[1] || '00'];
}

watch(
  () => props.modelValue,
  (value) => {
    pickerValue.value = parseToPicker(value);
  },
  { immediate: true },
);

function open() {
  if (locked.value) return;
  pickerValue.value = parseToPicker(props.modelValue);
  show.value = true;
}

function onConfirm({ selectedValues }: { selectedValues: string[] }) {
  emit('update:modelValue', (selectedValues || []).join(':'));
  show.value = false;
}
</script>

<style scoped lang="less">
.schema-time-picker-field {
  width: 100%;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.schema-time-picker-field-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.schema-time-picker-text {
  font-size: var(--van-cell-font-size, 14px);
  line-height: var(--van-cell-line-height, 24px);
  color: var(--van-field-input-text-color, #323233);
}

.schema-time-picker-placeholder {
  color: var(--van-field-placeholder-text-color, #c8c9cc);
}
</style>
