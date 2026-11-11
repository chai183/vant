<template>
  <div class="roster-attach">
    <van-loading v-if="loading" class="roster-attach-loading" vertical>
      加载中
    </van-loading>

    <van-empty v-else-if="!currentTab" description="暂无附件" />

    <template v-else>
      <van-empty v-if="!currentTab.groups.length" description="暂无附件" />

      <van-collapse
        v-for="group in currentTab.groups"
        :key="group.groupCode"
        v-model="expandedNames"
        class="roster-detail-card"
      >
        <van-collapse-item
          :name="group.groupCode"
          :title="group.groupName"
          :value="isExpanded(group.groupCode) ? '收起' : '展开'"
        >
          <van-grid
            v-if="group.displayType === 'image'"
            :border="false"
            :column-num="4"
            :gutter="8"
            square
            clickable
          >
            <van-grid-item
              v-for="(file, index) in group.files"
              :key="file.id"
              @click="previewGroup(group, index)"
            >
              <van-image
                :src="file.thumbUrl || file.url"
                width="100%"
                height="100%"
                fit="cover"
                radius="4"
              />
            </van-grid-item>
          </van-grid>

          <van-cell
            v-for="file in group.files"
            v-else
            :key="file.id"
            :title="file.name"
            icon="description"
            @click="download(file)"
          >
            <span class="roster-attach-download">下载</span>
          </van-cell>
        </van-collapse-item>
      </van-collapse>

      <div class="roster-attach-pack">
        <van-button type="primary" plain round block @click="packDownload">
          打包下载
        </van-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { showToast } from 'vant';
import type {
  RosterDetailAttachFile,
  RosterDetailAttachGroup,
  RosterDetailAttachTab,
} from '@/types/employee/roster';
import { previewRosterImages } from '../utils/display';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    subCode?: string;
    tabs?: RosterDetailAttachTab[];
  }>(),
  {
    loading: false,
    subCode: '',
    tabs: () => [],
  },
);

/** 当前二级附件页 */
const currentTab = computed(
  () =>
    (props.tabs || []).find((item) => item.code === props.subCode) ||
    (props.tabs || [])[0] ||
    null,
);

/** 展开的分组 */
const expandedNames = ref<string[]>([]);

watch(
  currentTab,
  (tab) => {
    expandedNames.value = (tab?.groups || []).map((item) => item.groupCode);
  },
  { immediate: true },
);

function isExpanded(name: string) {
  return expandedNames.value.includes(name);
}

function previewGroup(group: RosterDetailAttachGroup, start: number) {
  const urls = (group.files || [])
    .map((item) => item.thumbUrl || item.url)
    .filter(Boolean);
  previewRosterImages(urls, start);
}

function download(file: RosterDetailAttachFile) {
  if (/^https?:\/\//.test(file.url)) {
    window.open(file.url);
    return;
  }
  showToast('下载');
}

function packDownload() {
  showToast('打包下载');
}
</script>

<style scoped lang="less">
.roster-attach {
  min-height: 120px;
  padding: 8px 0 16px;
}

.roster-attach-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.roster-detail-card {
  margin-bottom: 8px;
  --van-collapse-item-content-padding: 0;
  --van-cell-value-color: #333333;
}

.roster-attach-download {
  color: var(--van-primary-color);
}

.roster-attach-pack {
  padding: 16px 12px 8px;
}
</style>
