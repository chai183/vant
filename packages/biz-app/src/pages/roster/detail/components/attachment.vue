<template>
  <div class="roster-attach">
    <van-loading v-if="loading" class="roster-attach-loading" vertical>
      加载中
    </van-loading>

    <van-empty v-else-if="!currentTab" description="暂无附件" />

    <template v-else>
      <van-empty v-if="!currentTab.groups.length" description="暂无附件" />

      <!-- /*----分组卡片start----*/ -->
      <div v-else class="roster-attach-list">
        <van-card
          v-for="group in currentTab.groups"
          :key="group.groupCode"
          class="roster-attach-card"
          :class="{ 'roster-attach-card-collapsible': canCollapse }"
          :title="group.groupName"
          :show-title="true"
        >
          <!-- /*----入职附件展开收起start----*/ -->
          <template v-if="canCollapse" #title-action>
            <div
              class="roster-attach-toggle"
              @click="cardPanel.toggle(group.groupCode)"
            >
              <span>{{ isExpanded(group.groupCode) ? '收起' : '展开' }}</span>
              <van-icon
                name="arrow-down"
                size="16"
                class="roster-attach-toggle-icon"
                :class="{
                  'roster-attach-toggle-icon-expanded': isExpanded(
                    group.groupCode,
                  ),
                }"
              />
            </div>
          </template>
          <!-- /*----入职附件展开收起end----*/ -->

          <template v-if="!canCollapse || isExpanded(group.groupCode)">
            <div
              v-if="group.displayType === 'image'"
              class="roster-attach-images"
            >
              <van-image
                v-for="(file, index) in group.files"
                :key="file.id"
                class="roster-attach-image"
                :src="file.thumbUrl || file.url"
                width="72"
                height="72"
                fit="cover"
                radius="8"
                @click="previewGroup(group, index)"
              />
            </div>

            <div v-else class="roster-attach-files">
              <div
                v-for="file in group.files"
                :key="file.id"
                class="roster-attach-file"
              >
                <div class="roster-attach-file-main">
                  <van-icon
                    name="description"
                    size="14"
                    class="roster-attach-file-icon"
                  />
                  <span class="roster-attach-file-text"
                    ><span class="roster-attach-file-base">{{
                      splitFileName(file.name).base
                    }}</span
                    ><span
                      v-if="splitFileName(file.name).ext"
                      class="roster-attach-file-ext"
                      >{{ splitFileName(file.name).ext }}</span
                    ></span
                  >
                </div>
                <button
                  type="button"
                  class="roster-attach-download"
                  @click="download(file)"
                >
                  下载
                </button>
              </div>
            </div>
          </template>
        </van-card>
      </div>
      <!-- /*----分组卡片end----*/ -->

      <!-- /*----打包下载start----*/ -->
      <van-bottom-action-bar class="roster-attach-pack" placeholder>
        <template #actions>
          <van-button type="primary" plain round block @click="packDownload">
            打包下载
          </van-button>
        </template>
      </van-bottom-action-bar>
      <!-- /*----打包下载end----*/ -->
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { showToast } from 'vant';
import { ROSTER_DETAIL_ATTACH_ONBOARD } from '@/services/api/employee/roster/config';
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
const currentTab = computed(() =>
  props.subCode
    ? props.tabs.find((item) => item.code === props.subCode) || null
    : props.tabs[0] || null,
);

/** 仅入职附件分组可展开收起；花名册附件始终展开 */
const canCollapse = computed(
  () => currentTab.value?.code === ROSTER_DETAIL_ATTACH_ONBOARD,
);

/** 收起的分组。默认全展开 */
const cardPanel = reactive({
  collapsed: [] as string[],
  toggle(name: string) {
    if (cardPanel.collapsed.includes(name)) {
      cardPanel.collapsed = cardPanel.collapsed.filter((item) => item !== name);
      return;
    }
    cardPanel.collapsed = [...cardPanel.collapsed, name];
  },
});

watch(
  currentTab,
  () => {
    cardPanel.collapsed = [];
  },
  { immediate: true },
);

function isExpanded(name: string) {
  return !cardPanel.collapsed.includes(name);
}

/** 拆出后缀，超出时只省略文件名，.xls 这类后缀保留 */
function splitFileName(name = '') {
  const text = String(name || '');
  const index = text.lastIndexOf('.');
  if (index <= 0 || index === text.length - 1) {
    return { base: text, ext: '' };
  }
  return {
    base: text.slice(0, index),
    ext: text.slice(index),
  };
}

function previewGroup(group: RosterDetailAttachGroup, start: number) {
  const urls = group.files.map((item) => item.url || item.thumbUrl || '');
  if (!urls[start]) {
    showToast('暂无可用预览地址');
    return;
  }
  // 过滤空地址后同步修正点击位置，预览优先使用原图。
  const current = urls.slice(0, start).filter(Boolean).length;
  previewRosterImages(urls.filter(Boolean), current);
}

function download(file: RosterDetailAttachFile) {
  if (/^https?:\/\//.test(file.url)) {
    window.open(file.url);
    return;
  }
  showToast('暂无可用下载地址');
}

function packDownload() {
  showToast('打包下载暂未接入');
}
</script>

<style scoped lang="less">
.roster-attach {
  min-height: 120px;
}

.roster-attach-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.roster-attach-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.roster-attach-card.van-card {
  --van-card-title-color: #333333;
  --van-card-title-font-size: 14px;
  --van-card-title-line-height: 16px;
  --van-font-bold: 500;
  --van-padding-base: 8px;
  margin-top: 0;
  background: #ffffff;
}

.roster-attach-card-collapsible.van-card {
  --van-card-title-extra-width: 72px;
}

.roster-attach-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #999999;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.roster-attach-toggle-icon {
  font-size: 16px;
  transition: transform 0.2s;
}

.roster-attach-toggle-icon-expanded {
  transform: rotate(180deg);
}

.roster-attach-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.roster-attach-image {
  flex: none;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border-radius: 8px;
}

.roster-attach-files {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.roster-attach-file {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.roster-attach-file-main {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.roster-attach-file-icon {
  flex: none;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  color: #ff8125;
  font-size: 14px;
  line-height: 14px;
}

.roster-attach-file-text {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  color: #ff8125;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.roster-attach-file-base {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.roster-attach-file-ext {
  flex: none;
}

.roster-attach-download {
  flex: none;
  margin-left: 4px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #ff8125;
  font-size: 14px;
  font-weight: 400;
  line-height: 14px;
}

.roster-attach-pack {
  --van-bottom-action-bar-background: #ffffff;
}
</style>
