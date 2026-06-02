<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanField from '../../field';
import VanPopup from '../../popup';
import VanTabs from '../../tabs';
import VanTab from '../../tab';
import VanDivider from '../../divider';
import VanIcon from '../../icon';
import VanLoading from '../../loading';
import VanAreaStepCascader from '..';
import { closeToast, showLoadingToast, showToast } from '../../toast';
import type { Numeric } from '../../utils';
import type { CascaderOption } from '../../cascader';

type LocationType = 'domestic' | 'foreign';

const t = useTranslate({
  'zh-CN': {
    title: '国内/国外切换',
    area: '地区',
    selectArea: '请选择地区',
    domestic: '国内',
    foreign: '国外',
    currentLocation: '当前位置',
    refreshLocation: '刷新',
    locating: '定位中...',
    locationRefreshed: '定位成功',
    currentLocationDomestic: '浙江省/杭州市/西湖区',
    currentLocationDomesticAlt: '浙江省/宁波市/海曙区',
    currentLocationForeign: '美国/加利福尼亚/洛杉矶',
    currentLocationForeignAlt: '日本/东京都/涩谷区',
    foreignOptions: [
      {
        text: '美国',
        value: 'US',
        children: [
          {
            text: '加利福尼亚',
            value: 'US-CA',
            children: [{ text: '洛杉矶', value: 'US-CA-LA' }],
          },
        ],
      },
      {
        text: '日本',
        value: 'JP',
        children: [
          {
            text: '东京都',
            value: 'JP-13',
            children: [{ text: '涩谷区', value: 'JP-13-SBY' }],
          },
        ],
      },
    ] as CascaderOption[],
  },
  'en-US': {
    title: 'Domestic and Overseas',
    area: 'Area',
    selectArea: 'Select Area',
    domestic: 'Domestic',
    foreign: 'Overseas',
    currentLocation: 'Current Location',
    refreshLocation: 'Refresh',
    locating: 'Locating...',
    locationRefreshed: 'Location updated',
    currentLocationDomestic: 'Zhejiang/Hangzhou/Xihu',
    currentLocationDomesticAlt: 'Zhejiang/Ningbo/Haishu',
    currentLocationForeign: 'United States/California/Los Angeles',
    currentLocationForeignAlt: 'Japan/Tokyo/Shibuya',
    foreignOptions: [
      {
        text: 'United States',
        value: 'US',
        children: [
          {
            text: 'California',
            value: 'US-CA',
            children: [{ text: 'Los Angeles', value: 'US-CA-LA' }],
          },
        ],
      },
      {
        text: 'Japan',
        value: 'JP',
        children: [
          {
            text: 'Tokyo',
            value: 'JP-13',
            children: [{ text: 'Shibuya', value: 'JP-13-SBY' }],
          },
        ],
      },
    ] as CascaderOption[],
  },
});

const state = reactive({
  show: false,
  domesticValue: '' as Numeric | undefined,
  foreignValue: '' as Numeric | undefined,
  result: '',
});

const locationIndex = reactive<Record<LocationType, number>>({
  domestic: 0,
  foreign: 0,
});

const locationRefreshing = reactive<Record<LocationType, boolean>>({
  domestic: false,
  foreign: false,
});

const foreignOptions = computed(() => t('foreignOptions') as CascaderOption[]);

const locationOptions = computed(() => ({
  domestic: [
    {
      text: t('currentLocationDomestic') as string,
      value: '330106',
    },
    {
      text: t('currentLocationDomesticAlt') as string,
      value: '330203',
    },
  ],
  foreign: [
    {
      text: t('currentLocationForeign') as string,
      value: 'US-CA-LA',
    },
    {
      text: t('currentLocationForeignAlt') as string,
      value: 'JP-13-SBY',
    },
  ],
}));

const getCurrentLocation = (type: LocationType) =>
  locationOptions.value[type][locationIndex[type]];

const onFinish = ({
  selectedOptions,
}: {
  value: Numeric;
  selectedOptions: CascaderOption[];
}) => {
  state.result = selectedOptions.map((item) => item.text).join('/');
  state.show = false;
};

const selectCurrentLocation = (type: LocationType) => {
  const { text, value } = getCurrentLocation(type);

  if (type === 'domestic') {
    state.domesticValue = value;
  } else {
    state.foreignValue = value;
  }

  state.result = text;
  state.show = false;
};

const refreshLocation = (type: LocationType) => {
  if (locationRefreshing[type]) {
    return;
  }

  locationRefreshing[type] = true;
  showLoadingToast({
    message: t('locating') as string,
    forbidClick: true,
    duration: 0,
  });

  window.setTimeout(() => {
    const options = locationOptions.value[type];
    locationIndex[type] = (locationIndex[type] + 1) % options.length;
    locationRefreshing[type] = false;
    closeToast();
    showToast(t('locationRefreshed') as string);
  }, 800);
};
</script>

<template>
  <demo-block card :title="t('title')">
    <van-field
      v-model="state.result"
      is-link
      readonly
      :label="t('area')"
      :placeholder="t('selectArea')"
      @click="state.show = true"
    />
    <van-popup
      v-model:show="state.show"
      :title="t('selectArea')"
      closeable
      round
      teleport="body"
      position="bottom"
    >
      <van-tabs>
        <van-tab :title="t('domestic')">
          <van-divider class="region-tab-divider" />
          <van-area-step-cascader
            v-model="state.domesticValue"
            :show-header="false"
            @finish="onFinish"
          >
            <template #title-extra>
              <div class="region-tab-current">
                <div
                  class="region-tab-current__main"
                  role="button"
                  tabindex="0"
                  @click="selectCurrentLocation('domestic')"
                >
                  <van-icon
                    name="location-o"
                    class="region-tab-current__icon"
                  />
                  <span class="region-tab-current__label">{{
                    t('currentLocation')
                  }}</span>
                  <span class="region-tab-current__text">{{
                    getCurrentLocation('domestic').text
                  }}</span>
                </div>
                <div
                  class="region-tab-current__refresh"
                  role="button"
                  tabindex="0"
                  @click.stop="refreshLocation('domestic')"
                >
                  <van-loading
                    v-if="locationRefreshing.domestic"
                    size="16"
                  />
                  <van-icon v-else name="replay" />
                  <span>{{ t('refreshLocation') }}</span>
                </div>
              </div>
              <van-divider class="region-tab-divider" />
            </template>
          </van-area-step-cascader>
        </van-tab>
        <van-tab :title="t('foreign')">
          <van-divider class="region-tab-divider" />
          <van-area-step-cascader
            v-model="state.foreignValue"
            :options="foreignOptions"
            :show-header="false"
            @finish="onFinish"
          >
            <template #title-extra>
              <div class="region-tab-current">
                <div
                  class="region-tab-current__main"
                  role="button"
                  tabindex="0"
                  @click="selectCurrentLocation('foreign')"
                >
                  <van-icon
                    name="location-o"
                    class="region-tab-current__icon"
                  />
                  <span class="region-tab-current__label">{{
                    t('currentLocation')
                  }}</span>
                  <span class="region-tab-current__text">{{
                    getCurrentLocation('foreign').text
                  }}</span>
                </div>
                <div
                  class="region-tab-current__refresh"
                  role="button"
                  tabindex="0"
                  @click.stop="refreshLocation('foreign')"
                >
                  <van-loading
                    v-if="locationRefreshing.foreign"
                    size="16"
                  />
                  <van-icon v-else name="replay" />
                  <span>{{ t('refreshLocation') }}</span>
                </div>
              </div>
              <van-divider class="region-tab-divider" />
            </template>
          </van-area-step-cascader>
        </van-tab>
      </van-tabs>
    </van-popup>
  </demo-block>
</template>

<style lang="less">
.region-tab-divider {
  --van-divider-line-height: 8px;
  height: 8px;
  margin: 0;
  background: #fafafa;
  border: none;

  &::before,
  &::after {
    display: none;
  }
}

.region-tab-current {
  display: flex;
  align-items: center;
  padding: 10px var(--van-padding-md);
  font-size: var(--van-font-size-md);
  line-height: var(--van-line-height-md);
  color: var(--van-text-color);
  background: var(--van-background-2);

  &__main {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    cursor: pointer;
  }

  &__icon {
    margin-right: 4px;
    color: var(--van-primary-color);
    font-size: 16px;
  }

  &__label {
    flex: none;
    margin-right: 8px;
    color: var(--van-text-color-2);
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

    .van-icon {
      margin-right: 2px;
      font-size: 16px;
    }
  }
}
</style>
