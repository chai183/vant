<script setup lang="ts">
import VanTabs from '../../tabs';
import VanTab from '../../tab';
import VanIndexBar from '..';
import VanIndexAnchor from '../../index-anchor';
import VanCell from '../../cell';
import { STAMP_FRAME_URL_SINGLE_LINE } from '../../tag/stamp-presets';
import { computed, ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { useCurrentLang } from '../../locale';

const t = useTranslate({
  'zh-CN': {
    text: '文本',
    customIndexList: '自定义索引列表',
    traditionalSearch: '传统写法',
    autoSearch: '自动渲染',
    customSearchSlots: '自定义列表项',
    searchPlaceholder: '请输入搜索关键词，如「百度」「北京」',
    emptyDescription: '暂无搜索结果',
  },
  'en-US': {
    text: 'Text',
    customIndexList: 'Custom Index List',
    traditionalSearch: 'Traditional',
    autoSearch: 'Auto Render',
    customSearchSlots: 'Custom List Item',
    searchPlaceholder: 'Search, e.g. "Baidu" or "Hangzhou"',
    emptyDescription: 'No search results',
  },
});

const searchItemsByLang: Record<string, Record<string, string[]>> = {
  'zh-CN': {
    A: ['阿里巴巴', '安徽合肥', '爱心捐助'],
    B: ['百度地图', '北京大学', '百货商场'],
    C: ['重庆小面', '长沙地铁', '咖啡伴侣'],
    D: ['钉钉办公', '大连港', '电动自行车'],
    E: ['饿了么', '峨嵋山景区', '儿童手表'],
    F: ['飞猪旅行', '福州码头', '服装批发'],
    G: ['广州塔', '高铁购票', '公益活动'],
    H: ['杭州西湖', '华为手机', '海运物流'],
    I: ['Instagram', 'IT 运维', 'Ice 破冰'],
    J: ['京东快递', '济南泉水', '基因检测'],
    K: ['快手直播', '肯德基', '科技园区'],
    L: ['LinkedIn', '兰州拉面', '律师咨询'],
    M: ['美团外卖', '麦当劳', '美容美发'],
    N: ['南京大学', '宁波舟山', '农产品'],
    O: ['Office 365', '欧洲航线', '偶像周边'],
    P: ['拼多多', '浦发银行', '拍拍贷'],
    Q: ['青岛啤酒', '企业微信', '奇瑞汽车'],
    R: ['瑞幸咖啡', '人工智能', '日式料理'],
    S: ['上海迪士尼', '深圳湾', '区块链技术'],
    T: ['腾讯视频', '天津眼', '团购优惠'],
    U: ['Uber 打车', 'U 盘存储', '优衣库'],
    V: ['VIP 会员', 'Vue 开发', '维生素'],
    W: ['微信支付', '武汉长江大桥', 'Wifi 路由'],
    X: ['小红书', '西安兵马俑', '条形码'],
    Y: ['优酷视频', '网易云音乐', '瑜伽课程'],
    Z: ['支付宝', '郑州东站', '展览中心'],
  },
  'en-US': {
    A: ['Apple Store', 'Amazon Prime', 'Airport Shuttle'],
    B: ['Baidu Maps', 'Beijing University', 'Book Store'],
    C: ['Chongqing Noodles', 'Changsha Metro', 'Coffee Maker'],
    D: ['DingTalk', 'Dalian Port', 'Electric Bike'],
    E: ['Ele.me', 'Emei Mountain', 'E-book Reader'],
    F: ['Fliggy Travel', 'Fuzhou Wharf', 'Fashion Mall'],
    G: ['Guangzhou Tower', 'High-speed Rail', 'Green Charity'],
    H: ['Hangzhou West Lake', 'Huawei Phone', 'Harbor Logistics'],
    I: ['Instagram', 'IT Support', 'Ice Breaker'],
    J: ['JD Express', 'Jinan Spring', 'Gene Test'],
    K: ['Kuaishou Live', 'KFC', 'Knowledge Park'],
    L: ['LinkedIn', 'Lanzhou Noodles', 'Legal Advice'],
    M: ['Meituan', "McDonald's", 'Makeup Studio'],
    N: ['Nanjing University', 'Ningbo Port', 'Natural Food'],
    O: ['Office 365', 'Overseas Flight', 'Online Shop'],
    P: ['Pinduoduo', 'Pudong Bank', 'Photo Studio'],
    Q: ['Qingdao Beer', 'Qiwei Chat', 'Qoros Auto'],
    R: ['Luckin Coffee', 'Robotics AI', 'Ramen House'],
    S: ['Shanghai Disney', 'Shenzhen Bay', 'Smart Chain'],
    T: ['Tencent Video', 'Tianjin Eye', 'Team Deal'],
    U: ['Uber Ride', 'USB Storage', 'Uniqlo Store'],
    V: ['VIP Member', 'Vue Developer', 'Vitamin Shop'],
    W: ['WeChat Pay', 'Wuhan Bridge', 'Wifi Router'],
    X: ['Xiaohongshu', "Xi'an Terracotta", 'X-ray Clinic'],
    Y: ['Youku Video', 'Yoga Course', 'Yellow Taxi'],
    Z: ['Zhifubao', 'Zhengzhou Station', 'Zoo Ticket'],
  },
};

const activeTab = ref(0);
const searchKeyword = ref('');
const indexList: string[] = [];
const customIndexList = [1, 2, 3, 4, 5, 6, 8, 9, 10];
const charCodeOfA = 'A'.charCodeAt(0);
const lang = useCurrentLang();

const currentSearchItems = computed(
  () => searchItemsByLang[lang.value] || searchItemsByLang['zh-CN'],
);

for (let i = 0; i < 26; i++) {
  indexList.push(String.fromCharCode(charCodeOfA + i));
}

const getSearchItems = (index: string | number) =>
  currentSearchItems.value[String(index)] || [];

const searchStampMask = `url(${STAMP_FRAME_URL_SINGLE_LINE})`;
</script>

<template>
  <van-tabs v-model:active="activeTab">
    <!-- 基础用法 -->
    <van-tab :title="t('basicUsage')">
      <van-index-bar>
        <div v-for="index in indexList" :key="index">
          <van-index-anchor :index="index" />
          <van-cell :title="t('text')" />
          <van-cell :title="t('text')" />
          <van-cell :title="t('text')" />
        </div>
      </van-index-bar>
    </van-tab>

    <!-- 自定义索引列表 -->
    <van-tab :title="t('customIndexList')">
      <van-index-bar :index-list="customIndexList">
        <div v-for="index in customIndexList" :key="index">
          <van-index-anchor :index="index">
            {{ t('title') + index }}
          </van-index-anchor>
          <van-cell :title="t('text')" />
          <van-cell :title="t('text')" />
          <van-cell :title="t('text')" />
        </div>
      </van-index-bar>
    </van-tab>

    <!-- 搜索 · 传统写法：search-texts + 手写 Cell + highlight -->
    <van-tab :title="t('traditionalSearch')">
      <van-index-bar
        v-model:search="searchKeyword"
        searchable
        :search-placeholder="t('searchPlaceholder')"
        :empty-description="t('emptyDescription')"
      >
        <div v-for="index in indexList" :key="index">
          <van-index-anchor
            :index="index"
            :search-texts="getSearchItems(index)"
          />
          <van-cell
            v-for="(title, itemIndex) in getSearchItems(index)"
            :key="itemIndex"
            :title="title"
            :highlight="[searchKeyword]"
          />
        </div>
      </van-index-bar>
    </van-tab>

    <!-- 搜索 · 自动渲染：仅 search-texts，由 IndexAnchor 内置 Cell -->
    <van-tab :title="t('autoSearch')">
      <van-index-bar
        v-model:search="searchKeyword"
        searchable
        :search-placeholder="t('searchPlaceholder')"
        :empty-description="t('emptyDescription')"
      >
        <van-index-anchor
          v-for="index in indexList"
          :key="index"
          :index="index"
          :search-texts="getSearchItems(index)"
        />
      </van-index-bar>
    </van-tab>

    <!-- 搜索 · 自定义列表项：#body 插槽自行渲染 van-cell -->
    <van-tab :title="t('customSearchSlots')">
      <van-index-bar
        v-model:search="searchKeyword"
        searchable
        :search-placeholder="t('searchPlaceholder')"
        :empty-description="t('emptyDescription')"
      >
        <van-index-anchor
          v-for="index in indexList"
          :key="index"
          :index="index"
          :search-texts="getSearchItems(index)"
        >
          <template #body="{ texts }">
            <van-cell
              v-for="(title, itemIndex) in texts"
              :key="itemIndex"
              :title="title"
              :highlight="[searchKeyword]"
            >
              <template #icon>
                <span
                  class="index-bar-demo-stamp"
                  :style="{
                    maskImage: searchStampMask,
                    WebkitMaskImage: searchStampMask,
                  }"
                />
              </template>
              <template #label>
                {{ index }}
              </template>
            </van-cell>
          </template>
        </van-index-anchor>
      </van-index-bar>
    </van-tab>
  </van-tabs>
</template>

<style>
.index-bar-demo-stamp {
  display: block;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: var(--van-padding-xs);
  background-color: var(--van-primary-color);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
</style>
