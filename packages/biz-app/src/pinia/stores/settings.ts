import type { Ref } from 'vue';
import type { LayoutsConfig } from '@/layouts/config';
import { setLayoutsConfig } from '@/_utils/_local-storage';
import { layoutsConfig } from '@/layouts/config';
import { pinia } from '@/pinia';

type SettingsStore = {
  [Key in keyof LayoutsConfig]: Ref<LayoutsConfig[Key]>;
};

type SettingsStoreKey = keyof SettingsStore;

export const useSettingsStore = defineStore('settings', () => {
  const state = {} as SettingsStore;

  for (const [key, value] of Object.entries(layoutsConfig)) {
    const refValue = ref(value);
    state[key as SettingsStoreKey] =
      refValue as SettingsStore[SettingsStoreKey];
    watch(refValue, () => {
      const settings = getCacheData();
      setLayoutsConfig(settings);
    });
  }

  const getCacheData = () => {
    const settings = {} as LayoutsConfig;
    for (const [key, value] of Object.entries(state)) {
      settings[key as SettingsStoreKey] =
        value.value as LayoutsConfig[SettingsStoreKey];
    }
    return settings;
  };

  return state;
});

export function useSettingsStoreOutside() {
  return useSettingsStore(pinia);
}
