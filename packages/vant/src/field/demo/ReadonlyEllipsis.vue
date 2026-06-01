<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import { useTranslate } from '../../../docs/site';

const t = useTranslate({
  'zh-CN': {
    readonlyEllipsisOverflow: '超出省略',
    readonlyEllipsisNoOverflow: '未超出',
    readonlyLabel: '收货地址',
    readonlyValue:
      '上海市浦东新区张江高科技园区科苑路88号张江大厦12层1201室',
    readonlyShortValue: '上海市浦东新区',
    readonlyTagsLabel: '已选标签',
    readonlyTagsValue: ['设计设计设计设计设计设设计设计设计设计设计设', '交互', '前端'],
    readonlyShortTagsValue: ['设计', '交互', '前端'],
    placeholder: '请选择收货地址',
    tagsPlaceholder: '请选择标签',
  },
  'en-US': {
    readonlyEllipsisOverflow: 'Overflow',
    readonlyEllipsisNoOverflow: 'No Overflow',
    readonlyLabel: 'Address',
    readonlyValue:
      'Room 1201, 12F, Zhangjiang Building, 88 Keyuan Road, Pudong, Shanghai',
    readonlyShortValue: 'Pudong, Shanghai',
    readonlyTagsLabel: 'Tags',
    readonlyTagsValue: [
      'Design',
      'Interaction',
      'Frontend',
      'QA',
      'Product',
      'Operations',
    ],
    readonlyShortTagsValue: ['Design', 'Interaction', 'Frontend'],
    placeholder: 'Select address',
    tagsPlaceholder: 'Select tags',
  },
});
</script>

<template>
  <demo-block :title="t('readonlyEllipsisOverflow')">
    <van-cell-group inset>
      <van-field
        readonly
        :model-value="t('readonlyValue')"
        :label="t('readonlyLabel')"
        :placeholder="t('placeholder')"
      />
      <van-field
        readonly
        :model-value="t('readonlyTagsValue')"
        :label="t('readonlyTagsLabel')"
        :placeholder="t('tagsPlaceholder')"
      />
    </van-cell-group>
  </demo-block>

  <demo-block :title="t('readonlyEllipsisNoOverflow')">
    <van-cell-group inset>
      <van-field
        readonly
        :model-value="t('readonlyShortValue')"
        :label="t('readonlyLabel')"
        :placeholder="t('placeholder')"
      />
      <van-field
        readonly
        :model-value="t('readonlyShortTagsValue')"
        :label="t('readonlyTagsLabel')"
        :placeholder="t('tagsPlaceholder')"
      />
    </van-cell-group>
  </demo-block>
</template>
