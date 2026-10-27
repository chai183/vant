<template>
  <div class="app-layout">
    <van-nav-bar
      v-if="showNavbar"
      :title="navbarTitle"
      fixed
      placeholder
      safe-area-inset-top
    >
      <template #right>
        <van-icon name="user-o" size="18" @click="goLogin" />
      </template>
    </van-nav-bar>

    <main class="app-layout__main">
      <router-view v-slot="{ Component, route: viewRoute }">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="viewRoute.fullPath" />
        </keep-alive>
      </router-view>
    </main>

    <van-tabbar v-if="showTabbar" route safe-area-inset-bottom>
      <van-tabbar-item
        v-for="item in tabbarRoutes"
        :key="item.path"
        :to="item.path"
        :icon="item.meta?.vanIcon"
      >
        {{ item.meta?.title }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useDevice } from '@/_composables/_useDevice';
import { useSettingsStore } from '@/pinia/stores/settings';
import { useTagsViewStore } from '@/pinia/stores/tags-view';
import { usePermissionStore } from '@/pinia/stores/permission';

useDevice();

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();
const tagsViewStore = useTagsViewStore();
const permissionStore = usePermissionStore();

const { showNavbar, showTabbar } = storeToRefs(settingsStore);
const { cachedViews } = storeToRefs(tagsViewStore);

const navbarTitle = computed(
  () => route.meta.title || import.meta.env.VITE_APP_TITLE,
);

const tabbarRoutes = computed(() => {
  const result: Array<{ path: string; meta?: Record<string, any> }> = [];
  const walk = (routes: typeof permissionStore.routes, parentPath = '') => {
    routes.forEach((item) => {
      const fullPath = item.path.startsWith('/')
        ? item.path
        : `${parentPath}/${item.path}`.replace(/\/+/g, '/');
      if (item.meta?.tabbar) {
        result.push({ path: fullPath, meta: item.meta });
      }
      if (item.children?.length) {
        walk(item.children, fullPath === '/' ? '' : fullPath);
      }
    });
  };
  walk(
    permissionStore.routes.length
      ? permissionStore.routes
      : (router.getRoutes() as any),
  );
  return result;
});

function goLogin() {
  router.push('/login');
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--van-background-2, #f7f8fa);
}

.app-layout__main {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
