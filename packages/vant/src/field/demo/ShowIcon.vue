<script setup lang="ts">
import VanField from '..';
import VanCellGroup from '../../cell-group';
import VanIcon from '../../icon';
import VanPopover from '../../popover';
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import { showToast } from '../../toast';

const t = useTranslate({
  'zh-CN': {
    text: '文本',
    showIcon: '显示图标',
    showClearIcon: '显示清除图标',
    actionButton: '操作按钮',
    actionButton2: '按钮',
    rightIconPopover: '气泡菜单',
    actions: [{ text: '选项一' }, { text: '选项二' }, { text: '选项三' }],
  },
  'en-US': {
    text: 'Text',
    showIcon: 'Show Icon',
    showClearIcon: 'Show Clear Icon',
    actionButton: 'Action Button',
    actionButton2: 'Button',
    rightIconPopover: 'Popover Menu',
    actions: [{ text: 'Option 1' }, { text: 'Option 2' }, { text: 'Option 3' }],
  },
});

const icon1 = ref('');
const icon2 = ref('123');
const icon3 = ref('');
const showPopover = ref(false);

const onSelect = (action: { text: string }) => showToast(action.text);
</script>

<template>
  <demo-block :title="t('showIcon')">
    <van-cell-group inset>
      <van-field
        v-model="icon1"
        :show-right-icon-divider="true"
        :label="t('text')"
        left-icon="smile-o"
        right-icon="warning-o"
        :placeholder="t('showIcon')"
        :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
      />
      <van-field
        v-model="icon1"
        :show-right-icon-divider="true"
        :label="t('text')"
        left-icon="smile-o"
        :placeholder="t('showIcon')"
        :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
      >
        <template #right-icon>
          <a>{{ t('actionButton') }}</a>
        </template>
      </van-field>
      <van-field
        v-model="icon2"
        :show-right-icon-divider="true"
        clearable
        :label="t('text')"
        left-icon="music-o"
        :placeholder="t('showClearIcon')"
        :style="{ '--van-field-right-icon-color': 'var(--van-primary-color)' }"
      >
        <template #right-icon>
          <div style="display: flex; align-items: center; gap: 8px">
            <a>{{ t('actionButton2') }}</a>
            <van-icon name="scan" />
          </div>
        </template>
      </van-field>
      <van-field
        v-model="icon3"
        :show-right-icon-divider="true"
        :label="t('text')"
        left-icon="smile-o"
        :placeholder="t('rightIconPopover')"
      >
        <template #right-icon>
          <van-popover
            v-model:show="showPopover"
            :actions="t('actions')"
            reference-text
            placement="bottom-end"
            @select="onSelect"
            @click.stop
          />
        </template>
      </van-field>
    </van-cell-group>
  </demo-block>
</template>
