import { computed, onBeforeUnmount, onMounted } from 'vue';
import { DeviceEnum } from '@/_constants/_app-key';
import { useAppStore } from '@/pinia/stores/app';

const MOBILE_MAX_WIDTH = 992;

export function useDevice() {
  const appStore = useAppStore();
  const isMobile = computed(() => appStore.device === DeviceEnum.Mobile);
  const isDesktop = computed(() => appStore.device === DeviceEnum.Desktop);

  function checkDevice() {
    const { width } = document.body.getBoundingClientRect();
    appStore.toggleDevice(
      width < MOBILE_MAX_WIDTH ? DeviceEnum.Mobile : DeviceEnum.Desktop,
    );
  }

  onMounted(() => {
    checkDevice();
    window.addEventListener('resize', checkDevice);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkDevice);
  });

  return { isMobile, isDesktop, checkDevice };
}
