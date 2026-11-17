<template>
  <div ref="rootRef" class="schema-pro-form" :style="rootStyle">
    <!-- /*----加载start----*/ -->
    <van-skeleton
      v-if="loading"
      title
      :row="skeletonRow"
      class="schema-pro-form-skeleton"
    />
    <!-- /*----加载end----*/ -->

    <template v-else>
      <!-- /*----空态start----*/ -->
      <van-empty v-if="!columns.length" :description="emptyText" />
      <!-- /*----空态end----*/ -->

      <template v-else>
        <!-- /*----区块锚点 Tabs start----*/ -->
        <div
          v-if="anchorTabs.length > 1"
          ref="anchorRef"
          class="schema-pro-form-anchor"
          :style="anchorStickyStyle"
        >
          <van-tabs
            v-model:active="activeAnchor"
            class="schema-pro-form-anchor-tabs"
            shrink
            :ellipsis="false"
            color="var(--van-primary-color)"
            title-active-color="var(--van-primary-color)"
            title-inactive-color="var(--van-text-color)"
            @change="onAnchorChange"
          >
            <van-tab
              v-for="item in anchorTabs"
              :key="item.key"
              :name="item.key"
              :title="item.title"
            />
          </van-tabs>
        </div>
        <!-- /*----区块锚点 Tabs end----*/ -->

        <!-- /*----表单start----*/ -->
        <van-pro-form
          ref="proFormRef"
          v-model="formModel"
          :columns="columns"
          :components="mergedComponents"
          :show-submit="showSubmit"
          :submit-text="submitText"
          :disabled="disabled"
          :readonly="readonly"
          v-bind="formAttrs"
          @submit="onSubmit"
          @failed="onFailed"
        >
          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData || {}" />
          </template>
        </van-pro-form>
        <!-- /*----表单end----*/ -->
      </template>
    </template>
  </div>
</template>

<script lang="ts" setup>
/**
 * SchemaProForm - 后端信息集 schema → vant ProForm
 * 供入职填写、花名册等复用：传入 schema，内部转 columns 并维护 model
 */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from 'vue';
import type { Component, CSSProperties } from 'vue';
import {
  getProFormStructureTitle,
  resolveProFormStructureKind,
  type ProFormColumn,
  type ProFormOption,
} from 'vant';
import { useDictStore } from '@/pinia/stores/dict';
import type { SchemaFieldSet } from './types';
import { createMergedResolveSchemaField } from './resolve-schema-field';
import SchemaTimePickerField from './SchemaTimePickerField.vue';
import SchemaDateTimePickerField from './SchemaDateTimePickerField.vue';
import SchemaUploadField from './SchemaUploadField.vue';
import type { SchemaOption } from './apply-type-config';
import {
  collectSchemaFieldRuntimeMetas,
  syncSchemaModelLinkages,
} from './schema-runtime';
import {
  buildSubmitPayload,
  collectSchemaDictCodes,
  createModelFromSchema,
  mapGroupNameAsSetName as applyGroupNameAsSetName,
  transformSchemaToColumns,
  type ResolveSchemaField,
  type TransformSchemaOptions,
} from './transform-schema';

defineOptions({
  name: 'SchemaProForm',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    /** 表单 model（须用 ref 绑定，增删分组才能生效） */
    modelValue?: Record<string, unknown>;
    /**
     * 后端信息集 JSON（setCode → groupList → fieldList）
     * 与 PC ProForm schema 同构
     */
    schema?: SchemaFieldSet[] | null;
    /** 拉取 / 转换中 */
    loading?: boolean;
    /** 骨架行数 */
    skeletonRow?: number;
    /** 无字段时文案 */
    emptyText?: string;
    /** 是否展示提交按钮 */
    showSubmit?: boolean;
    submitText?: string;
    disabled?: boolean;
    readonly?: boolean;
    /** 是否展示 groupName（默认 false：字段平铺在 setName 区块下） */
    showGroupName?: boolean;
    /**
     * 展示时是否把 groupName 提升为 setName（对齐 PC AddDialog）
     * 提交仍按原始 schema 的 setCode 组装
     */
    mapGroupNameAsSetName?: boolean;
    /** columnName → options */
    fieldOptions?: Record<string, ProFormOption[]>;
    /**
     * dictCode / dictId → options（可选覆盖）
     * 默认按 schema 的 dictCode 调 PC 同款字典接口拉一层；传入时覆盖对应 code
     */
    dictOptions?: Record<string, SchemaOption[]>;
    /** 是否自动按 schema 拉取字典（一层）；默认 true */
    autoLoadDict?: boolean;
    /**
     * 单字段转换钩子（在组件默认覆盖之后执行，可再改 type / options / rules）
     * 默认已处理 gender / staffType / orgId 无 options 兜底
     */
    resolveSchemaField?: ResolveSchemaField;
    /** 扩展 ProForm components（默认含 schemaTimePicker） */
    components?: Record<string, Component>;
    /**
     * 为 true 时，第一层区块 / 可增删分组超过 1 个才在顶部展示吸顶 Tab
     * 点击滚动到对应标题。默认不展示
     */
    showSectionTabs?: boolean;
    /**
     * 吸顶偏移。不传时自动避开固定导航栏和外层吸顶 Tab
     * 支持数字（px）或带 px 的字符串
     */
    sectionTabOffsetTop?: number | string | null;
  }>(),
  {
    modelValue: undefined,
    schema: null,
    loading: false,
    skeletonRow: 10,
    emptyText: '暂无表单字段配置',
    showSubmit: true,
    submitText: '提交',
    disabled: false,
    readonly: false,
    showGroupName: false,
    mapGroupNameAsSetName: true,
    fieldOptions: undefined,
    dictOptions: undefined,
    autoLoadDict: true,
    resolveSchemaField: undefined,
    components: undefined,
    showSectionTabs: false,
    sectionTabOffsetTop: null,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
  submit: [
    payload: {
      model: Record<string, unknown>;
      formData: Record<string, Array<Record<string, unknown>>>;
    },
  ];
  failed: [errorInfo: unknown];
}>();

const attrs = useAttrs();
const dictStore = useDictStore();
const proFormRef = ref<{
  submit?: () => void;
  validate?: (name?: string | string[]) => Promise<void>;
  getValues?: () => Record<string, unknown>;
  resetValidation?: (name?: string | string[]) => void;
} | null>(null);

/** 接口拉取的一层字典（schema dictCode → options） */
const loadedDictOptions = ref<Record<string, SchemaOption[]>>({});
/** 避免 schema 快速切换时旧请求回写 */
let dictLoadToken = 0;

/** 透传给底层 van-pro-form 的其余 attrs（去掉已声明 props） */
const formAttrs = computed(() => {
  const next = { ...attrs } as Record<string, unknown>;
  return next;
});

/** 原始 schema（提交用） */
const originSchema = computed(() =>
  Array.isArray(props.schema) ? props.schema : [],
);

/** 展示用 schema */
const displaySchema = computed(() => {
  const list = originSchema.value;
  return props.mapGroupNameAsSetName ? applyGroupNameAsSetName(list) : list;
});

/** 默认字段覆盖 + 业务侧钩子 */
const mergedResolveSchemaField = computed(() =>
  createMergedResolveSchemaField(props.resolveSchemaField),
);

const mergedComponents = computed(() => ({
  schemaTimePicker: SchemaTimePickerField,
  schemaDateTimePicker: SchemaDateTimePickerField,
  schemaUpload: SchemaUploadField,
  ...(props.components || {}),
}));

/** 内部 model；有 v-model 时与外部同步 */
const innerModel = ref<Record<string, unknown>>({});
/** 联动对比用快照 */
const linkageSnapshot = ref<Record<string, unknown>>({});

/** 接口结果 + 业务 dictOptions 覆盖 */
const mergedDictOptions = computed(() => ({
  ...loadedDictOptions.value,
  ...(props.dictOptions || {}),
}));

const transformOptions = computed<TransformSchemaOptions>(() => ({
  showGroupName: props.showGroupName,
  fieldOptions: props.fieldOptions,
  dictOptions: mergedDictOptions.value,
  model: props.modelValue ?? innerModel.value,
  resolveSchemaField: mergedResolveSchemaField.value,
}));

/** 按 schema 批量拉一层字典（对齐 PC getDict） */
async function loadDictOptionsFromSchema(schema: SchemaFieldSet[]) {
  if (!props.autoLoadDict) {
    loadedDictOptions.value = {};
    return;
  }
  const codes = collectSchemaDictCodes(schema);
  const token = ++dictLoadToken;
  if (!codes.length) {
    loadedDictOptions.value = {};
    return;
  }
  const batch = await dictStore.getDictBatch(codes);
  if (token !== dictLoadToken) return;
  const next: Record<string, SchemaOption[]> = {};
  codes.forEach((code) => {
    const list = batch[code];
    next[code] = Array.isArray(list)
      ? list.map((item) => ({
          label: item.label,
          value: item.value,
          ...(item.parentValue != null && item.parentValue !== ''
            ? { parentValue: item.parentValue }
            : {}),
          ...(item.disabled ? { disabled: true } : {}),
        }))
      : [];
  });
  loadedDictOptions.value = next;
}

watch(
  () => [originSchema.value, props.autoLoadDict] as const,
  ([schema]) => {
    loadDictOptionsFromSchema(Array.isArray(schema) ? schema : []);
  },
  { immediate: true, deep: true },
);

const columns = computed<ProFormColumn[]>(() =>
  transformSchemaToColumns(displaySchema.value, transformOptions.value),
);

const fieldMetas = computed(() =>
  collectSchemaFieldRuntimeMetas(columns.value),
);

const formModel = computed({
  get() {
    return props.modelValue ?? innerModel.value;
  },
  set(value: Record<string, unknown>) {
    innerModel.value = value;
    emit('update:modelValue', value);
  },
});

/** 第一层区块 / 可增删分组标题，用作顶部 Tab */
type SectionAnchor = {
  key: string;
  title: string;
};

const ANCHOR_ATTR = 'data-schema-anchor';
const rootRef = ref<HTMLElement | null>(null);
const anchorRef = ref<HTMLElement | null>(null);
const activeAnchor = ref<string | number>('');
/** 吸顶 top：导航栏 + 外层吸顶 Tab */
const anchorOffset = ref<number | string>(0);
/** Tab 条高度，滚动时让标题停在其下方 */
const anchorBarHeight = ref(0);
const anchorElMap = new Map<string, HTMLElement>();

let scrollTarget: HTMLElement | Window | null = null;
let cancelAnchorScroll: (() => void) | null = null;
let anchorScrollLock = false;
/** 点击跳转后先钉住当前 Tab，避免滚不到底时被滚动监听打回 */
let anchorPinned = false;
let anchorResizeObserver: ResizeObserver | null = null;
let anchorVisibilityObserver: IntersectionObserver | null = null;

function isAnchorColumnHidden(
  column: ProFormColumn,
  model: Record<string, unknown>,
) {
  const { hidden } = column;
  if (typeof hidden === 'function') return hidden(model);
  return !!hidden;
}

/** 只收集第一层 section / collapse-group 标题，透传层继续往下找 */
function collectFirstLevelAnchors(
  list: ProFormColumn[],
  model: Record<string, unknown>,
  acc: SectionAnchor[] = [],
) {
  list.forEach((column) => {
    if (isAnchorColumnHidden(column, model)) return;
    const kind = resolveProFormStructureKind(column);
    if (kind === 'section' || kind === 'collapse-group') {
      const title = getProFormStructureTitle(column).trim();
      if (title) {
        acc.push({ key: `anchor-${acc.length}`, title });
      }
      return;
    }
    if (kind === 'passthrough' && column.content?.length) {
      collectFirstLevelAnchors(column.content, model, acc);
    }
  });
  return acc;
}

const anchorTabs = computed(() => {
  if (!props.showSectionTabs) return [];
  return collectFirstLevelAnchors(columns.value, formModel.value);
});

function toCssTop(value: number | string) {
  if (typeof value === 'number') return `${value}px`;
  return /^-?\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

function resolveOffsetPx(value: number | string) {
  if (typeof value === 'number') return value;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const anchorStickyStyle = computed(() => ({
  top: toCssTop(anchorOffset.value),
}));

const rootStyle = computed<CSSProperties | undefined>(() => {
  if (anchorTabs.value.length < 2) return undefined;
  const margin = resolveOffsetPx(anchorOffset.value) + anchorBarHeight.value;
  return {
    '--schema-pro-form-scroll-margin': `${margin}px`,
  };
});

function getScrollTop(scroller: HTMLElement | Window) {
  if (!(scroller instanceof HTMLElement)) {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }
  return scroller.scrollTop;
}

function setScrollTop(scroller: HTMLElement | Window, value: number) {
  if (!(scroller instanceof HTMLElement)) {
    window.scrollTo(window.scrollX, value);
    document.documentElement.scrollTop = value;
    document.body.scrollTop = value;
    return;
  }
  scroller.scrollTop = value;
}

function getScrollParent(el: HTMLElement): HTMLElement | Window {
  let parent = el.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (
      (overflowY === 'auto' ||
        overflowY === 'scroll' ||
        overflowY === 'overlay') &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function getOffsetTop(el: HTMLElement, scroller: HTMLElement | Window) {
  if (!(scroller instanceof HTMLElement)) {
    return el.getBoundingClientRect().top + getScrollTop(window);
  }
  return (
    el.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop
  );
}

/** 当前 van-tabs 自己的标题栏（不含嵌套 tabs、不含表单内锚点条） */
function findTabsHeader(tabsEl: HTMLElement, root: HTMLElement) {
  const wraps = tabsEl.querySelectorAll('.van-tabs__wrap');
  for (const wrap of Array.from(wraps)) {
    if (!(wrap instanceof HTMLElement)) continue;
    if (root.contains(wrap)) continue;
    if (wrap.closest('.van-tabs') !== tabsEl) continue;
    if (!wrap.closest('.van-sticky')) continue;
    return wrap;
  }
  return null;
}

/** 固定导航栏高度 + 外层 van-tabs 吸顶条高度 */
function measureFixedHeaderOffset(root: HTMLElement) {
  let offset = 0;
  document
    .querySelectorAll<HTMLElement>('.van-nav-bar--fixed')
    .forEach((el) => {
      if (root.contains(el)) return;
      const rect = el.getBoundingClientRect();
      if (rect.height > 0 && rect.top <= 1) {
        offset = Math.max(offset, rect.bottom);
      }
    });

  let node = root.parentElement;
  while (node) {
    if (node.classList.contains('van-tabs')) {
      const header = findTabsHeader(node, root);
      if (header) offset += header.getBoundingClientRect().height;
    }
    node = node.parentElement;
  }
  return Math.round(offset);
}

function measureAnchorOffset() {
  if (props.sectionTabOffsetTop != null) {
    anchorOffset.value = props.sectionTabOffsetTop;
    return;
  }
  const root = rootRef.value;
  anchorOffset.value = root ? measureFixedHeaderOffset(root) : 0;
}

function updateAnchorBarHeight() {
  anchorBarHeight.value = anchorRef.value?.offsetHeight ?? 0;
}

/** 给第一层标题打标，顺序与 Tab 一致 */
function syncAnchorMarks() {
  anchorElMap.clear();
  const root = rootRef.value;
  const form = root?.querySelector('.van-pro-form > .van-form');
  if (!form) return;

  const titles: HTMLElement[] = [];
  const visit = (parent: Element) => {
    Array.from(parent.children).forEach((child) => {
      const isSection = child.classList.contains('van-pro-form__section');
      const isCollapseGroup = child.classList.contains(
        'van-pro-form__collapse-group',
      );
      if (isSection || isCollapseGroup) {
        const title = Array.from(child.children).find((node) =>
          node.classList.contains('van-pro-form__section-title'),
        );
        if (title instanceof HTMLElement) titles.push(title);
        return;
      }
      if (child.classList.contains('van-pro-form__passthrough')) {
        visit(child);
      }
    });
  };
  visit(form);

  const tabs = anchorTabs.value;
  titles.forEach((el, index) => {
    const item = tabs[index];
    if (!item) {
      el.removeAttribute(ANCHOR_ATTR);
      return;
    }
    el.setAttribute(ANCHOR_ATTR, item.key);
    anchorElMap.set(item.key, el);
  });
}

function scrollThreshold() {
  return resolveOffsetPx(anchorOffset.value) + anchorBarHeight.value;
}

/** 补足底部空间，让最后一节标题也能滚到吸顶条下方 */
function syncAnchorScrollPadding() {
  const root = rootRef.value;
  if (!root) return;
  const tabs = anchorTabs.value;
  const last = anchorElMap.get(tabs[tabs.length - 1]?.key ?? '');
  if (!last || tabs.length < 2) {
    root.style.paddingBottom = '';
    return;
  }
  const scroller = getScrollParent(root);
  const view =
    scroller instanceof HTMLElement
      ? scroller.clientHeight
      : window.innerHeight;
  const scrollHeight =
    scroller instanceof HTMLElement
      ? scroller.scrollHeight
      : document.documentElement.scrollHeight;
  const currentPad =
    Number.parseFloat(getComputedStyle(root).paddingBottom) || 0;
  const required = Math.ceil(
    getOffsetTop(last, scroller) -
      scrollThreshold() -
      (scrollHeight - currentPad) +
      view,
  );
  root.style.paddingBottom = required > 1 ? `${required}px` : '';
}

function updateActiveByScroll() {
  const tabs = anchorTabs.value;
  if (tabs.length < 2) return;
  const threshold = scrollThreshold();
  let index = 0;
  for (let i = 0; i < tabs.length; i += 1) {
    const el = anchorElMap.get(tabs[i].key);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= threshold + 1) {
      index = i;
    }
  }
  const next = tabs[index]?.key;
  if (next && next !== activeAnchor.value) {
    activeAnchor.value = next;
  }
}

function smoothScrollTo(
  scroller: HTMLElement | Window,
  to: number,
  duration: number,
  onDone: () => void,
) {
  cancelAnchorScroll?.();
  const start = getScrollTop(scroller);
  const change = to - start;
  if (Math.abs(change) < 1 || duration <= 0) {
    setScrollTop(scroller, to);
    cancelAnchorScroll = null;
    onDone();
    return;
  }
  const startTime = performance.now();
  let rafId = 0;
  let stopped = false;
  const step = (now: number) => {
    if (stopped) return;
    const progress = Math.min(1, (now - startTime) / duration);
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - (-2 * progress + 2) ** 2 / 2;
    setScrollTop(scroller, start + change * eased);
    if (progress < 1) {
      rafId = requestAnimationFrame(step);
      return;
    }
    cancelAnchorScroll = null;
    onDone();
  };
  rafId = requestAnimationFrame(step);
  cancelAnchorScroll = () => {
    stopped = true;
    cancelAnimationFrame(rafId);
    cancelAnchorScroll = null;
  };
}

function onPageScroll() {
  if (anchorScrollLock || anchorPinned) return;
  updateActiveByScroll();
}

function onUserScrollIntent() {
  if (anchorScrollLock) {
    cancelAnchorScroll?.();
    anchorScrollLock = false;
  }
  anchorPinned = false;
}

function unbindAnchorScroll() {
  if (!scrollTarget) return;
  scrollTarget.removeEventListener('scroll', onPageScroll);
  scrollTarget.removeEventListener('wheel', onUserScrollIntent);
  scrollTarget.removeEventListener('touchstart', onUserScrollIntent);
  scrollTarget = null;
}

function bindAnchorScroll() {
  unbindAnchorScroll();
  const root = rootRef.value;
  if (!root || anchorTabs.value.length < 2) return;
  scrollTarget = getScrollParent(root);
  scrollTarget.addEventListener('scroll', onPageScroll, { passive: true });
  scrollTarget.addEventListener('wheel', onUserScrollIntent, { passive: true });
  scrollTarget.addEventListener('touchstart', onUserScrollIntent, {
    passive: true,
  });
}

async function refreshSectionAnchors() {
  await nextTick();
  measureAnchorOffset();
  syncAnchorMarks();
  updateAnchorBarHeight();
  syncAnchorScrollPadding();
  bindAnchorScroll();
  const tabs = anchorTabs.value;
  if (!tabs.some((item) => item.key === activeAnchor.value)) {
    activeAnchor.value = tabs[0]?.key ?? '';
  }
  if (!anchorScrollLock && !anchorPinned) {
    updateActiveByScroll();
  }
}

function onAnchorChange(name: string | number) {
  const key = String(name);
  syncAnchorMarks();
  updateAnchorBarHeight();
  const el = anchorElMap.get(key);
  const root = rootRef.value;
  if (!el || !root) return;
  const scroller = getScrollParent(root);
  const top = Math.max(0, getOffsetTop(el, scroller) - scrollThreshold());
  anchorScrollLock = true;
  anchorPinned = true;
  activeAnchor.value = key;
  smoothScrollTo(scroller, top, 300, () => {
    anchorScrollLock = false;
    activeAnchor.value = key;
  });
}

watch(
  anchorTabs,
  (tabs) => {
    if (!tabs.some((item) => item.key === activeAnchor.value)) {
      activeAnchor.value = tabs[0]?.key ?? '';
    }
    refreshSectionAnchors();
  },
  { flush: 'post' },
);

watch(
  () => props.sectionTabOffsetTop,
  () => {
    measureAnchorOffset();
  },
);

watch(anchorRef, (el) => {
  anchorResizeObserver?.disconnect();
  anchorResizeObserver = null;
  if (!el || typeof ResizeObserver === 'undefined') return;
  anchorResizeObserver = new ResizeObserver(() => {
    updateAnchorBarHeight();
  });
  anchorResizeObserver.observe(el);
});

onMounted(() => {
  refreshSectionAnchors();
  if (rootRef.value && typeof IntersectionObserver !== 'undefined') {
    anchorVisibilityObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        refreshSectionAnchors();
      }
    });
    anchorVisibilityObserver.observe(rootRef.value);
  }
  window.addEventListener('resize', refreshSectionAnchors);
});

onBeforeUnmount(() => {
  cancelAnchorScroll?.();
  unbindAnchorScroll();
  anchorResizeObserver?.disconnect();
  anchorVisibilityObserver?.disconnect();
  window.removeEventListener('resize', refreshSectionAnchors);
});

/** 按原始 schema 重置 model 默认值 */
function resetBySchema(schema: SchemaFieldSet[] = originSchema.value) {
  const next = createModelFromSchema(schema);
  innerModel.value = next;
  linkageSnapshot.value = { ...next };
  emit('update:modelValue', next);
}

watch(
  () => props.schema,
  (schema) => {
    if (!schema) return;
    const current = props.modelValue ?? innerModel.value;
    const hasKeys = current && Object.keys(current).length > 0;
    if (!hasKeys) {
      resetBySchema(Array.isArray(schema) ? schema : []);
    }
  },
  { immediate: true, deep: true },
);

/** fieldMapping 同步 + parentField 级联清空 */
watch(
  formModel,
  (model) => {
    if (!model || typeof model !== 'object') return;
    const prev = linkageSnapshot.value;
    const changed = syncSchemaModelLinkages(model, prev, fieldMetas.value);
    linkageSnapshot.value = { ...model };
    if (changed) {
      innerModel.value = model;
      emit('update:modelValue', model);
    }
  },
  { deep: true },
);

function getModel() {
  return formModel.value;
}

/** 按原始 schema 组装提交体 { [setCode]: [{ fieldKey: value }] } */
function getSubmitPayload(schema: SchemaFieldSet[] = originSchema.value) {
  return buildSubmitPayload(schema, formModel.value);
}

function onSubmit() {
  emit('submit', {
    model: formModel.value,
    formData: getSubmitPayload(),
  });
}

function onFailed(errorInfo: unknown) {
  emit('failed', errorInfo);
}

async function validate(name?: string | string[]) {
  return proFormRef.value?.validate?.(name);
}

function submit() {
  proFormRef.value?.submit?.();
}

function resetValidation(name?: string | string[]) {
  proFormRef.value?.resetValidation?.(name);
}

defineExpose({
  proFormRef,
  validate,
  submit,
  resetValidation,
  getModel,
  getSubmitPayload,
  resetBySchema,
  getOriginSchema: () => originSchema.value,
  getColumns: () => columns.value,
  getFieldMetas: () => fieldMetas.value,
});
</script>

<style scoped lang="less">
.schema-pro-form {
  :deep(.van-cell),
  :deep(.van-pro-form__section),
  :deep(.van-pro-form__section-title),
  :deep(.van-pro-form__collapse-group) {
    scroll-margin-top: var(--schema-pro-form-scroll-margin, 0px);
  }
}

.schema-pro-form-anchor {
  position: sticky;
  z-index: 90;
  background: var(--van-tabs-nav-background, var(--van-background-2));
  box-shadow: 0 1px 0 var(--van-border-color);
}

.schema-pro-form-anchor-tabs {
  :deep(.van-tabs__content) {
    display: none;
  }
}

.schema-pro-form-skeleton {
  margin: 16px;
}
</style>
