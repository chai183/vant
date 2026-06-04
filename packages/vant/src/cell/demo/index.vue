<script setup lang="ts">
import VanCellGroup from '../../cell-group';
import VanCell from '..';
import VanTag from '../../tag';
import VanIcon from '../../icon';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    cell: '单元格',
    group: '分组',
    router: '页面导航',
    urlRoute: 'URL 跳转',
    vueRoute: '路由跳转',
    useSlots: '使用插槽',
    showIcon: '展示图标',
    showAvatar: '展示头像',
    showArrow: '展示箭头',
    highlightText: '高亮文本',
    largeSize: '单元格大小',
    groupTitle: '分组标题',
    insetGrouped: '卡片风格',
    verticalCenter: '垂直居中',
    titleArray: '多行标题',
    titleLine1: '主标题',
    titleLine2: '副标题',
  },
  'en-US': {
    cell: 'Cell title',
    group: 'Group',
    router: 'Router',
    urlRoute: 'URL',
    vueRoute: 'Vue Router',
    useSlots: 'Use Slots',
    showIcon: 'Left Icon',
    showAvatar: 'Left Avatar',
    showArrow: 'Link',
    highlightText: 'Highlight Text',
    largeSize: 'Size',
    groupTitle: 'Group Title',
    insetGrouped: 'Inset Grouped',
    verticalCenter: 'Vertical center',
    titleArray: 'Multi-line Title',
    titleLine1: 'Main Title',
    titleLine2: 'Sub Title',
  },
});
</script>

<template>
  <demo-block :title="t('basicUsage')">
    <van-cell-group>
      <van-cell :title="t('cell')" :value="t('content')" />
      <van-cell :title="t('cell')" :value="t('content')" :label="t('desc')" />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('insetGrouped')">
    <van-cell-group inset>
      <van-cell :title="t('cell')" :value="t('content')" />
      <van-cell :title="t('cell')" :value="t('content')" :label="t('desc')" />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('largeSize')">
    <van-cell :title="t('cell')" :value="t('content')" size="large" />
    <van-cell
      :title="t('cell')"
      :value="t('content')"
      size="large"
      :label="t('desc')"
    />
  </demo-block>

  <demo-block :title="t('showIcon')">
    <van-cell :title="t('cell')" :value="t('content')" icon="location-o" />
  </demo-block>

  <demo-block :title="t('showAvatar')">
    <van-cell
      :title="t('cell')"
      :value="t('content')"
      :avatar="{ type: 'text', text: '张', size: 'small' }"
    />
  </demo-block>

  <demo-block :title="t('highlightText')">
    <van-cell
      :title="t('cell')"
      :value="t('content')"
      :label="t('desc')"
      :highlight="[t('cell').slice(0, 2), t('content'), t('desc')]"
      :highlight-props="{ highlightClass: 'custom-highlight' }"
    />
  </demo-block>

  <demo-block :title="t('showArrow')">
    <van-cell :title="t('cell')" is-link />
    <van-cell :title="t('cell')" is-link :value="t('content')" />
    <van-cell
      :title="t('cell')"
      is-link
      arrow-direction="down"
      :value="t('content')"
    />
  </demo-block>

  <demo-block :title="t('router')">
    <van-cell
      :title="t('urlRoute')"
      is-link
      url="https://github.com/vant-ui/vant"
    />
    <van-cell :title="t('vueRoute')" is-link to="index" />
  </demo-block>

  <demo-block :title="t('groupTitle')">
    <van-cell-group :title="`${t('group')} 1`">
      <van-cell :title="t('cell')" :value="t('content')" />
    </van-cell-group>
    <van-cell-group :title="`${t('group')} 2`">
      <van-cell :title="t('cell')" :value="t('content')" />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('useSlots')">
    <van-cell :value="t('content')" is-link>
      <template #title>
        <span class="custom-title">{{ t('cell') }}</span>
        <van-tag type="primary">{{ t('tag') }}</van-tag>
      </template>
    </van-cell>

    <van-cell icon="shop-o" :title="t('cell')">
      <template #right-icon>
        <van-icon name="search" class="search-icon" />
      </template>
    </van-cell>
  </demo-block>

  <demo-block :title="t('verticalCenter')">
    <van-cell
      center
      :title="t('cell')"
      :value="t('content')"
      :label="t('desc')"
    />
  </demo-block>

  <demo-block :title="t('titleArray')">
    <van-cell
      :title="[t('titleLine1'), t('titleLine2')]"
      :value="t('content')"
    />
    <van-cell
      :title="[t('titleLine1'), t('titleLine2')]"
      :value="t('content')"
      :label="t('desc')"
    />
  </demo-block>
</template>

<style lang="less">
.demo-cell {
  .custom-title {
    margin-right: 4px;
    vertical-align: middle;
  }

  .search-icon {
    font-size: 16px;
    line-height: inherit;
  }

  .custom-highlight {
    color: var(--van-danger-color);
  }
}
</style>
