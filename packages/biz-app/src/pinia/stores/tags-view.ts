import type { RouteLocationNormalizedGeneric } from 'vue-router';
import {
  getCachedViews,
  getVisitedViews,
  setCachedViews,
  setVisitedViews,
} from '@/_utils/_local-storage';
import { pinia } from '@/pinia';
import { useSettingsStore } from './settings';

export type TagView = Partial<RouteLocationNormalizedGeneric>;

export const useTagsViewStore = defineStore('tags-view', () => {
  const { cacheTagsView } = useSettingsStore();

  const visitedViews = ref<TagView[]>(cacheTagsView ? getVisitedViews() : []);
  const cachedViews = ref<string[]>(cacheTagsView ? getCachedViews() : []);

  watchEffect(() => {
    setVisitedViews(visitedViews.value);
    setCachedViews(cachedViews.value);
  });

  const addVisitedView = (view: TagView) => {
    const index = visitedViews.value.findIndex((v) => v.path === view.path);
    if (index !== -1) {
      visitedViews.value[index].fullPath !== view.fullPath &&
        (visitedViews.value[index] = { ...view });
    } else {
      visitedViews.value.push({ ...view });
    }
  };

  const addCachedView = (view: TagView) => {
    if (typeof view.name !== 'string') return;
    if (cachedViews.value.includes(view.name)) return;
    if (view.meta?.keepAlive) {
      cachedViews.value.push(view.name);
    }
  };

  const delVisitedView = (view: TagView) => {
    const index = visitedViews.value.findIndex((v) => v.path === view.path);
    if (index !== -1) {
      visitedViews.value.splice(index, 1);
    }
  };

  const delCachedView = (view: TagView) => {
    if (typeof view.name !== 'string') return;
    const index = cachedViews.value.indexOf(view.name);
    if (index !== -1) {
      cachedViews.value.splice(index, 1);
    }
  };

  const delOthersVisitedViews = (view: TagView) => {
    visitedViews.value = visitedViews.value.filter((v) => {
      return v.meta?.affix || v.path === view.path;
    });
  };

  const delOthersCachedViews = (view: TagView) => {
    if (typeof view.name !== 'string') return;
    const index = cachedViews.value.indexOf(view.name);
    if (index !== -1) {
      cachedViews.value = cachedViews.value.slice(index, index + 1);
    } else {
      cachedViews.value = [];
    }
  };

  const delAllVisitedViews = () => {
    visitedViews.value = visitedViews.value.filter((tag) => tag.meta?.affix);
  };

  const delAllCachedViews = () => {
    cachedViews.value = [];
  };

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOthersVisitedViews,
    delOthersCachedViews,
    delAllVisitedViews,
    delAllCachedViews,
  };
});

export function useTagsViewStoreOutside() {
  return useTagsViewStore(pinia);
}
