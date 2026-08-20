<script setup lang="ts">
import VanTabs from '../../tabs';
import VanTab from '../../tab';
import VanPullRefresh, { type PullRefreshRefreshParams } from '..';
import { computed, onMounted, ref } from 'vue';
import { cdnURL, useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    try: '下拉试试',
    text: '刷新次数',
    success: '刷新成功',
    successTip: '成功提示',
    errorTip: '失败提示',
    networkError: '网络不可用，请检查网络设置',
    customTips: '自定义提示',
  },
  'en-US': {
    try: 'Try it down',
    text: 'Refresh Count',
    success: 'Refresh success',
    successTip: 'Success Tip',
    errorTip: 'Error Tip',
    networkError: 'Network unavailable, please check network settings',
    customTips: 'Custom Tips',
  },
});

const count = ref(0);
const loading = ref(false);

// 自定义示例的最大拖拽高度，同时作为缩放比例的计算基准。
const maxPullDistance = 100;

const tips = computed(() => {
  if (count.value) {
    return `${t('text')}: ${count.value}`;
  }
  return t('try');
});

// 基础用法
const onRefresh = (isShowToast: boolean) => {
  setTimeout(() => {
    if (isShowToast) {
      showToast(t('success'));
    }
    loading.value = false;
    count.value++;
  }, 1000);
};

// 错误提示
const onRefreshError = ({ error }: PullRefreshRefreshParams) => {
  setTimeout(() => {
    error(new Error(t('networkError')));
  }, 1000);
};

const onError = (error: unknown) => {
  console.log(error);
};

// distance / maxPullDistance 会得到 0~1 的缩放比例，Math.min 用于限制最大 100%。
const getPullingStyle = (distance: number) => ({
  transform: `scale(${Math.min(distance / maxPullDistance, 1)})`,
});

const preloadImage = () => {
  // 提前加载自定义图片，避免首次下拉时图片闪烁。
  const doge = new Image();
  const dogeFire = new Image();

  doge.src = cdnURL('doge.png');
  dogeFire.src = cdnURL('doge-fire.jpeg');
};

onMounted(preloadImage);
</script>

<template>
  <van-tabs>
    <van-tab :title="t('basicUsage')">
      <van-pull-refresh v-model="loading" @refresh="onRefresh(true)">
        <p>{{ tips }}</p>
      </van-pull-refresh>
    </van-tab>

    <van-tab :title="t('successTip')">
      <van-pull-refresh
        v-model="loading"
        :success-text="t('success')"
        @refresh="onRefresh(false)"
      >
        <p>{{ tips }}</p>
      </van-pull-refresh>
    </van-tab>

    <van-tab :title="t('errorTip')">
      <van-pull-refresh
        v-model="loading"
        @refresh="onRefreshError"
        @error="onError"
      >
        <p>{{ tips }}</p>
      </van-pull-refresh>
    </van-tab>

    <van-tab :title="t('customTips')">
      <van-pull-refresh
        v-model="loading"
        :head-height="maxPullDistance"
        :pull-distance="maxPullDistance"
        @refresh="onRefresh(true)"
      >
        <template #pulling="{ distance }">
          <!-- 下拉过程中，图片跟随 distance 从中心逐步放大到 100%。 -->
          <img
            class="doge"
            :src="cdnURL('doge.png')"
            :style="getPullingStyle(distance)"
          />
        </template>
        <template #loosing>
          <!-- 达到最大拖拽距离后，释放态保持 100% 大小。 -->
          <img :src="cdnURL('doge.png')" class="doge" />
        </template>
        <template #loading>
          <!-- 松手进入刷新态后，图片/GIF 保持 100% 大小不变。 -->
          <img :src="cdnURL('doge-fire.jpeg')" class="doge" />
        </template>
        <template #success>
          <!-- 刷新成功后，图片从 100% 缩放到 0%，随后组件回到初始位置。 -->
          <img :src="cdnURL('doge.png')" class="doge doge-success" />
        </template>
        <p>{{ tips }}</p>
      </van-pull-refresh>
    </van-tab>
  </van-tabs>
</template>

<style lang="less">
.demo-pull-refresh {
  background-color: var(--van-background-2);

  .van-pull-refresh {
    height: calc(100vh - 50px);
  }

  .doge {
    width: 140px;
    height: 72px;
    margin-top: 8px;
    border-radius: 4px;
    transform-origin: center;
  }

  .doge-success {
    // success 插槽展示期间执行缩小动画，动画结束后组件会自动收起头部区域。
    animation: doge-scale-out 500ms ease both;
  }

  p {
    margin: 0;
    padding: var(--van-padding-md) 0 0 var(--van-padding-md);
  }
}

@keyframes doge-scale-out {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(0);
  }
}
</style>
