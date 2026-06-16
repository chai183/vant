import type { PropType } from 'vue';
import type { ProFormColumn, ProFormComponentMap } from '../pro-form';

export type FilterMenuBarDirection = 'down' | 'up';

export type FilterMenuBarSortValue = 'default' | 'asc' | 'desc';

export type FilterMenuBarModel = Record<string, unknown>;

export type FilterMenuBarCloseOptions = {
  /** 关闭时是否提交本轮 draft 改动，默认 false */
  commit?: boolean;
};

export type FilterMenuBarPanelActions = {
  close: (options?: FilterMenuBarCloseOptions) => void;
  confirm: () => Promise<void>;
  reset: () => void;
  validate: () => Promise<void>;
};

export type FilterMenuBarConfirmPayload = {
  /** 提交的面板 key，漏斗固定为 funnel */
  key: string;
  /** 提交后的完整 model */
  model: FilterMenuBarModel;
};

export type FilterMenuBarItem = {
  /** 唯一标识，对应 modelValue 中的一级字段 */
  key: string;
  /** 筛选条标题 */
  title?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 排序项：仅切换排序状态，不渲染表单面板 */
  sort?: boolean;
  /** 是否展示在筛选条上 */
  barVisible?: boolean;
  /** ProForm 表单项配置 */
  columns?: ProFormColumn[];
  /** ProForm 自定义组件映射 */
  components?: ProFormComponentMap;
  /** 普通单字段面板是否展示 Field 标题 */
  showFieldLabel?: boolean;
  /** 是否展示面板底部确认/重置区域（单 section 默认 false） */
  showFooter?: boolean;
  /** 面板底部确认按钮文案，覆盖组件级 confirmText */
  confirmText?: string;
  /** 面板底部重置按钮文案，覆盖组件级 resetText */
  resetText?: string;
  /** 搜索能力先预留，后续可在 ProForm 或自定义面板中接入 */
  searchable?: boolean;
  /** 搜索占位文案，当前先预留 */
  searchPlaceholder?: string;
  /** 漏斗聚合面板中是否可折叠 */
  collapsible?: boolean;
  /** 漏斗聚合面板中是否默认展开 */
  defaultExpanded?: boolean;
};

export type FilterMenuBarConfig = {
  /** 筛选项配置 */
  items: FilterMenuBarItem[];
  /** 超过该数量后，其余项聚合进漏斗面板 */
  overflowThreshold?: number | string;
};

export type FilterMenuBarTitleIconSlotProps = {
  item: FilterMenuBarItem;
  active: boolean;
  showPopup: boolean;
  sortOrder: FilterMenuBarSortValue;
  isFunnel: boolean;
  isSort: boolean;
};

export type FilterMenuBarItemSlotProps = {
  item: FilterMenuBarItem;
  model: Record<string, unknown>;
  updateModel: (value: Record<string, unknown>) => void;
} & FilterMenuBarPanelActions;

export type FilterMenuBarPanelFooterSlotProps = FilterMenuBarItemSlotProps & {
  /** 单字段多选面板当前选中的 options 数量 */
  selectedCount?: number;
  /** 内置确认按钮同款文案，多选时会附带 (n) */
  confirmLabel?: string;
};

export type FilterMenuBarFunnelFooterSlotProps = {
  items: FilterMenuBarItem[];
  model: FilterMenuBarModel;
} & FilterMenuBarPanelActions;

export const filterMenuBarSharedProps = {
  modelValue: Object as PropType<FilterMenuBarModel>,
  config: Object as PropType<FilterMenuBarConfig>,
  /** 配置数组快捷写法，等价于 config.items */
  columns: Array as PropType<FilterMenuBarItem[]>,
  activeColor: String,
  overflowThreshold: [Number, String],
  overlay: Boolean,
  zIndex: [Number, String],
  duration: [Number, String],
  direction: String as PropType<FilterMenuBarDirection>,
  autoLocate: Boolean,
  closeOnClickOutside: Boolean,
  closeOnClickOverlay: Boolean,
};
