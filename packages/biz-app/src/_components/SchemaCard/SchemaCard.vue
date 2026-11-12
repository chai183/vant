<template>
  <div class="schema-card" :style="hostStyle">
    <!-- /*----加载start----*/ -->
    <van-loading v-if="loading" class="schema-card-loading" vertical>
      加载中
    </van-loading>
    <!-- /*----加载end----*/ -->

    <!-- /*----空态start----*/ -->
    <van-empty v-else-if="!cards.length" :description="emptyText" />
    <!-- /*----空态end----*/ -->

    <!-- /*----分组卡片start----*/ -->
    <template v-else>
      <van-card
        v-for="card in cards"
        :key="card.name"
        class="schema-card-item"
        :class="{ 'schema-card-item-static': !collapsible }"
        :title="card.title"
        content-type="text-list"
        :content-items="utils.isExpanded(card.name) ? card.items : []"
      >
        <template v-if="collapsible" #title-action>
          <div class="schema-card-toggle" @click="cardPanel.toggle(card.name)">
            <span>{{ utils.isExpanded(card.name) ? '收起' : '展开' }}</span>
            <van-icon
              name="arrow-down"
              size="16"
              class="schema-card-toggle-icon"
              :class="{
                'schema-card-toggle-icon-expanded': utils.isExpanded(card.name),
              }"
            />
          </div>
        </template>
        <template #text-list-row="{ item }">
          <div
            class="schema-card-row"
            :class="{ 'schema-card-row-center': item.labelAlign === 'center' }"
          >
            <div class="schema-card-row-label">
              <span class="schema-card-row-label-text">{{ item.label }}</span>
              <van-icon
                v-if="item.tip"
                name="info-o"
                size="16"
                class="schema-card-tip"
              />
            </div>
            <div class="schema-card-row-main">
              <div v-if="item.images?.length" class="schema-card-images">
                <van-image
                  v-for="(url, imageIndex) in item.images"
                  :key="`${url}-${imageIndex}`"
                  :src="url"
                  width="48"
                  height="48"
                  fit="cover"
                  radius="4"
                  @click="utils.preview(item.images, imageIndex)"
                />
              </div>
              <span
                v-else-if="item.files?.length"
                class="schema-card-row-value"
              >
                {{ utils.fileText(item.files) }}
              </span>
              <span v-else class="schema-card-row-value">{{ item.value }}</span>
            </div>
          </div>
        </template>
      </van-card>
    </template>
    <!-- /*----分组卡片end----*/ -->
  </div>
</template>

<script lang="ts" setup>
/**
 * SchemaCard - 信息集 JSON + 数据 → 分组卡片只读
 * 每组一张 van-card，标题收起/展开，内容为文案列表
 */
import { computed, reactive } from 'vue';
import type {
  SchemaCardField,
  SchemaCardGroup,
  SchemaCardSchema,
} from './types';
import {
  formatSchemaCardValue,
  getSchemaCardFieldLabel,
  getSchemaCardFiles,
  getSchemaCardImages,
  isSchemaCardFileField,
  isSchemaCardImageField,
  isSchemaCardTipField,
  previewSchemaCardImages,
  readSchemaCardRaw,
} from './format';

defineOptions({
  name: 'SchemaCard',
});

const props = withDefaults(
  defineProps<{
    /** 信息集 schema（setCode → groupList → fieldList） */
    schema?: SchemaCardSchema[] | null;
    /** 已拆好的分组；不传 schema 时用这个 */
    groups?: SchemaCardGroup[];
    /** 单条数据 */
    modelValue?: Record<string, unknown>;
    /** 多行数据，有值时一人一张卡 */
    records?: Record<string, unknown>[];
    /** 多行卡片标题前缀，展示为 教育经历（1） */
    recordTitle?: string;
    /** 标签垂直对齐，字段未单独设置时用这个；默认顶部 */
    labelAlign?: 'top' | 'center';
    /** 标签列宽，数字按 px；默认 96 */
    labelWidth?: number | string;
    /** 是否显示展开/收起，默认开启 */
    collapsible?: boolean;
    loading?: boolean;
    emptyText?: string;
  }>(),
  {
    schema: null,
    groups: () => [],
    modelValue: () => ({}),
    records: () => [],
    recordTitle: '',
    labelAlign: 'top',
    labelWidth: 96,
    collapsible: true,
    loading: false,
    emptyText: '暂无数据',
  },
);

function groupFields(group: SchemaCardGroup): SchemaCardField[] {
  return group.fields || group.fieldList || [];
}

function groupTitle(group: SchemaCardGroup) {
  return group.title || group.groupName || '默认分组';
}

function groupName(group: SchemaCardGroup, index: number) {
  return group.name || group.groupCode || `group-${index}`;
}

function recordOf(group: SchemaCardGroup, model: Record<string, unknown>) {
  const code = group.groupCode || group.name || '';
  const nested = code ? model[code] : undefined;
  if (Array.isArray(nested) && nested[0] && typeof nested[0] === 'object') {
    return nested[0] as Record<string, unknown>;
  }
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return model;
}

function buildItems(
  fields: SchemaCardField[],
  record: Record<string, unknown>,
) {
  return fields.map((field) => {
    const raw = readSchemaCardRaw(field, record);
    const images = isSchemaCardImageField(field)
      ? getSchemaCardImages(raw)
      : [];
    const files = isSchemaCardFileField(field) ? getSchemaCardFiles(raw) : [];
    const item: Record<string, unknown> = {
      label: getSchemaCardFieldLabel(field),
      value: formatSchemaCardValue(field, record),
      valueRows: 'auto',
      labelAlign: field.labelAlign || props.labelAlign || 'top',
      tip: isSchemaCardTipField(field),
    };
    if (images.length) {
      item.images = images;
    } else if (files.length) {
      item.files = files;
    }
    return item;
  });
}

/** 多行卡片标题，对齐 PC：教育经历（1） */
function recordCardTitle(index: number) {
  const prefix = props.recordTitle || '记录';
  return `${prefix}（${index + 1}）`;
}

/** schema 转分组 */
const schemaGroups = computed(() => {
  const list: SchemaCardGroup[] = [];
  (props.schema || []).forEach((set) => {
    (set.groupList || []).forEach((group) => {
      list.push({
        name: group.groupCode,
        groupCode: group.groupCode,
        title: group.groupName || set.setName,
        fields: (group.fieldList || []) as SchemaCardField[],
      });
    });
  });
  return list;
});

/** 实际用来画卡的分组 */
const sourceGroups = computed(() =>
  (props.groups || []).length ? props.groups : schemaGroups.value,
);

/** 分组卡片 */
const cards = computed(() => {
  const groups = sourceGroups.value.filter(
    (group) => groupFields(group).length,
  );
  if (props.records?.length) {
    const fields = groups.flatMap((group) => groupFields(group));
    return props.records.map((record, index) => ({
      name: String(record.id ?? index),
      title: recordCardTitle(index),
      items: buildItems(fields, record),
    }));
  }
  const model = props.modelValue || {};
  return groups.map((group, index) => ({
    name: groupName(group, index),
    title: groupTitle(group),
    items: buildItems(groupFields(group), recordOf(group, model)),
  }));
});

/** 标签列宽同步到卡片变量 */
const hostStyle = computed(() => {
  const width =
    typeof props.labelWidth === 'number'
      ? `${props.labelWidth}px`
      : props.labelWidth;
  return {
    '--schema-card-label-width': width,
    '--van-card-text-list-label-width': width,
  };
});

/* ----收起展开start---- */
const cardPanel = reactive({
  collapsed: [] as string[],
  toggle(name: string) {
    if (cardPanel.collapsed.includes(name)) {
      cardPanel.collapsed = cardPanel.collapsed.filter((item) => item !== name);
      return;
    }
    cardPanel.collapsed = [...cardPanel.collapsed, name];
  },
});
/* ----收起展开end---- */

const utils = {
  isExpanded(name: string) {
    if (!props.collapsible) return true;
    return !cardPanel.collapsed.includes(name);
  },
  preview(urls: string[] = [], start = 0) {
    previewSchemaCardImages(urls, start);
  },
  fileText(files: Array<{ name: string }> = []) {
    return files.map((item) => item.name).join('、');
  },
};
</script>

<style scoped lang="less">
.schema-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
}

.schema-card-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.schema-card-item.van-card {
  --van-card-title-color: #333;
  --van-card-title-font-size: 14px;
  --van-card-title-line-height: 16px;
  --van-card-title-extra-width: 72px;
  --van-card-text-list-row-padding-y: 4px;
  --van-font-bold: 500;
  --van-padding-base: 8px;
  margin-top: 0;
}

.schema-card-row {
  display: flex;
  flex: 1;
  align-items: flex-start;
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
}

.schema-card-row-center {
  align-items: center;
}

.schema-card-row-label {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  width: var(--schema-card-label-width, 96px);
  max-width: var(--schema-card-label-width, 96px);
  color: var(--van-card-text-list-label-color);
  font-size: var(--van-card-text-list-font-size);
  line-height: var(--van-card-text-list-line-height);
  word-break: break-all;
}

.schema-card-row-label-text {
  min-width: 0;
  white-space: normal;
}

.schema-card-row-main {
  flex: 1;
  min-width: 0;
  margin-left: var(--van-padding-sm);
}

.schema-card-row-value {
  color: var(--van-card-text-list-value-color);
  font-size: var(--van-card-text-list-font-size);
  line-height: var(--van-card-text-list-line-height);
  word-break: break-all;
  white-space: pre-wrap;
}

.schema-card-item.van-card:not(:first-child) {
  margin-top: 0;
}

.schema-card-item-static.van-card {
  --van-card-title-extra-width: 0;
}

.schema-card-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
}

.schema-card-toggle-icon {
  font-size: 16px;
  transition: transform 0.2s;
}

.schema-card-toggle-icon-expanded {
  transform: rotate(180deg);
}

.schema-card-tip {
  flex: none;
  width: 16px;
  height: 16px;
  overflow: hidden;
  color: var(--van-gray-5);
  font-size: 16px;
  line-height: 16px;
}

.schema-card-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
