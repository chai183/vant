<template>
  <div v-if="items.length" ref="rootRef" class="curmb">
    <template v-for="(item, index) in items" :key="item.id">
      <span v-if="index" class="curmb-sep" :style="sepStyle">
        <van-icon v-if="!separator" name="arrow" class="curmb-arrow" />
        <template v-else>{{ separator }}</template>
      </span>
      <button
        v-if="!isActive(index)"
        type="button"
        class="curmb-item"
        :style="itemColor(index)"
        @click="onSelect(item.id, index)"
      >
        {{ item.name }}
      </button>
      <span
        v-else
        class="curmb-item curmb-item-active"
        :style="itemColor(index)"
      >
        {{ item.name }}
      </span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({ name: 'Curmb' });

const props = withDefaults(
  defineProps<{
    items: { id: string; name: string }[];
    separator?: string;
    activeColor?: string;
    inactiveColor?: string;
    /**
     * 路由模式。点某一级按历史回退到那一层，后面的子路径会被丢掉。
     * 适合每一级都是 push 进来、面包屑和路由历史一一对应的页面。
     */
    router?: boolean;
  }>(),
  {
    separator: '',
    activeColor: '',
    inactiveColor: '',
    router: false,
  },
);

const emit = defineEmits<{
  select: [id: string];
}>();

const vueRouter = useRouter();

const rootRef = ref<HTMLElement>();

// 最后一级是当前页
const activeIndex = computed(() => props.items.length - 1);

// 箭头跟随非活跃颜色
const sepStyle = computed(() =>
  props.inactiveColor ? { color: props.inactiveColor } : undefined,
);

// 路径变了就滚到最后一级的末尾；放得下时不滚动
function placeScroll() {
  const el = rootRef.value;
  if (!el) return;
  const max = el.scrollWidth - el.clientWidth;
  el.scrollLeft = max > 0 ? max : 0;
}

watch(
  () => props.items.map((item) => item.id).join('\n'),
  async () => {
    await nextTick();
    requestAnimationFrame(() => {
      placeScroll();
      requestAnimationFrame(placeScroll);
    });
  },
  { immediate: true },
);

function isActive(index: number) {
  return index === activeIndex.value;
}

function onSelect(id: string, index: number) {
  if (props.router) {
    const steps = props.items.length - 1 - index;
    if (steps > 0) vueRouter.go(-steps);
    return;
  }
  emit('select', id);
}

function itemColor(index: number) {
  const color = isActive(index) ? props.activeColor : props.inactiveColor;
  return color ? { color } : undefined;
}
</script>

<style scoped lang="less">
.curmb {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  overflow-x: auto;
  padding: 9px 12px;
  white-space: nowrap;
  scrollbar-width: none;
}

.curmb::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.curmb-item {
  border: 0;
  padding: 0;
  background: transparent;
  color: #999999;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.curmb-item-active {
  color: #333333;
}

.curmb-sep {
  display: inline-flex;
  align-items: center;
  margin: 0 4px;
  color: #999999;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.curmb-arrow {
  width: 14px;
  height: 14px;
  font-size: 14px;
  line-height: 14px;
}
</style>
