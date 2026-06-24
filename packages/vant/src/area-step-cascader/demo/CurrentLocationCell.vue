<script setup lang="ts">
import VanCell from '../../cell';
import VanIcon from '../../icon';
import VanLoading from '../../loading';

defineProps<{
  label: string;
  text: string;
  refreshText: string;
  refreshing?: boolean;
}>();

const emit = defineEmits<{
  click: [];
  refresh: [];
}>();
</script>

<template>
  <van-cell
    class="current-location-cell"
    icon="location-o"
    clickable
    :border="false"
    @click="emit('click')"
  >
    <template #title>
      <span class="current-location-cell__label">{{ label }}</span>
      <span class="current-location-cell__text">{{ text }}</span>
    </template>
    <template #extra>
      <div
        class="current-location-cell__refresh"
        role="button"
        tabindex="0"
        @click.stop="emit('refresh')"
      >
        <van-loading v-if="refreshing" size="16" />
        <van-icon v-else name="aim" size="14" />
        <span>{{ refreshText }}</span>
      </div>
    </template>
  </van-cell>
</template>

<style lang="less">
.current-location-cell {
  .van-cell__left-icon {
    margin-right: 10px;
    color: var(--van-text-color-auxiliary);
    font-size: 14px;
  }

  .van-cell__title {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &__label {
    flex: none;
  }

  &__text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__refresh {
    display: flex;
    flex: none;
    align-items: center;
    margin-left: 12px;
    color: var(--van-primary-color);
    cursor: pointer;

    .van-icon,
    .van-loading {
      margin-right: 6px;
    }

    .van-loading {
      color: var(--van-primary-color);
    }

    .van-icon {
      font-size: 16px;
    }
  }
}
</style>
