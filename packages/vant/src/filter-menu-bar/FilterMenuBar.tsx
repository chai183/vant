import {
  ref,
  watch,
  computed,
  nextTick,
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

import {
  extend,
  omit,
  truthProp,
  windowHeight,
  getZIndexStyle,
  makeStringProp,
  makeNumericProp,
  createNamespace,
  HAPTICS_FEEDBACK,
  getContainingBlock,
} from '../utils';
import { useId } from '../composables/use-id';
import { useExpose } from '../composables/use-expose';
import { Icon } from '../icon';
import { Popup } from '../popup';
import { Field } from '../field';
import { BottomActionBar } from '../bottom-action-bar';
import { ProForm } from '../pro-form';
import { getDefaultValueByComponent } from '../pro-form/getDefaultValue';
import {
  filterMenuBarSharedProps,
  type FilterMenuBarCloseOptions,
  type FilterMenuBarConfig,
  type FilterMenuBarFunnelFooterSlotProps,
  type FilterMenuBarItem,
  type FilterMenuBarModel,
  type FilterMenuBarPanelFooterSlotProps,
  type FilterMenuBarSortValue,
} from './types';
import type { ProFormColumn, ProFormOption } from '../pro-form';
import type { FieldProps } from '../field/Field';
import type { FieldTextAlign } from '../field/types';
import type { FormExpose } from '../form/types';
import {
  useRect,
  useClickAway,
  useScrollParent,
  useEventListener,
} from '@vant/use';
import {
  appendSliderFieldClass,
  cloneDefaultValue,
  hasValue,
  toNumber,
} from './utils';

const [name, bem] = createNamespace('filter-menu-bar');

const funnelSvg = new URL('./assets/funnel.svg', import.meta.url).href;

// 内部漏斗入口 key，用于区分真实筛选项 key，事件对外会统一转换成 'funnel'。
const FUNNEL_KEY = '__filter_menu_bar_funnel__';
// 筛选条图标未激活时的默认颜色，激活态由 active-color 控制。
const INACTIVE_BAR_ICON_COLOR = '#cccccc';
// 漏斗面板内 Slider 需要特殊间距，给 Field 和 label 分别追加内部类名。
const FUNNEL_SLIDER_FIELD_CLASS = bem('funnel-slider-field') as string;
const FUNNEL_SLIDER_LABEL_CLASS = bem('funnel-slider-label') as string;
// 普通单字段多选面板使用的 ProForm 组件类型。
const MULTI_SELECT_COMPONENTS = new Set([
  'checkbox',
  'checkboxGroup',
  'checkboxPicker',
]);
// 普通下拉面板里选中即提交的 ProForm 组件类型。
const SINGLE_SELECT_COMPONENTS = new Set([
  'radio',
  'radioGroup',
  'radioPicker',
  'picker',
]);

export type FilterMenuBarValidateError = {
  // 校验失败的漏斗 section key 列表。
  keys: string[];
  // ProForm validate 返回的原始错误集合。
  errors: unknown[];
};

type BarItem = FilterMenuBarItem & {
  // 内部标记当前 bar item 是否为漏斗入口。
  funnel?: boolean;
};

type TitleIconScope = {
  // 图标是否处于激活态，包含打开、已选中、排序激活等情况。
  active: boolean;
  // 当前筛选项面板是否打开。
  showPopup: boolean;
  // 排序项当前排序方向，非排序项固定为 default。
  sortOrder: FilterMenuBarSortValue;
  // 当前标题图标是否属于漏斗入口。
  isFunnel: boolean;
  // 当前标题图标是否属于排序项。
  isSort: boolean;
};

type OptionLike = ProFormOption & {
  // 兼容 Picker/Cascader 类 options 可能使用 text 作为展示文案。
  text?: string;
};

export const filterMenuBarProps = extend({}, filterMenuBarSharedProps, {
  modelValue: {
    type: Object as PropType<FilterMenuBarModel>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<FilterMenuBarConfig>,
    default: undefined,
  },
  columns: {
    type: Array as PropType<FilterMenuBarItem[]>,
    default: undefined,
  },
  overflowThreshold: makeNumericProp(4),
  activeColor: makeStringProp('var(--van-primary-color)'),
  overlay: truthProp,
  duration: makeNumericProp(0.2),
  direction: makeStringProp<'down' | 'up'>('down'),
  closeOnClickOutside: truthProp,
  closeOnClickOverlay: truthProp,
  funnelTitle: makeStringProp('筛选'),
  funnelSectionCollapsible: Boolean,
  funnelSectionDefaultExpanded: truthProp,
  funnelShowFooter: {
    type: Boolean,
    default: true,
  },
  confirmText: makeStringProp('确定'),
  resetText: makeStringProp('重置'),
  showResetButton: {
    type: Boolean,
    default: true,
  },
});

export type FilterMenuBarProps = ExtractPropTypes<typeof filterMenuBarProps>;

export type FilterMenuBarExpose = {
  // 暴露给用户主动调用的漏斗整体验证方法。
  validate: () => Promise<void>;
};

// 内部漏斗 key 不直接暴露给用户事件，统一转换为语义化的 funnel。
function normalizeEventKey(key: string) {
  return key === FUNNEL_KEY ? 'funnel' : key;
}

export default defineComponent({
  name,

  props: filterMenuBarProps,

  emits: [
    'update:modelValue',
    'change',
    'open',
    'opened',
    'close',
    'closed',
    'confirm',
    'sort',
    'sectionToggle',
  ],

  setup(props, { emit, slots }) {
    // 标题 aria-labelledby 使用的唯一 id 前缀。
    const id = useId();
    // 组件根节点，用于 click-away 监听。
    const root = ref<HTMLElement>();
    // 筛选条 DOM，用于计算弹层 top/bottom 偏移。
    const barRef = ref<HTMLElement>();
    // 弹层定位容器，autoLocate 时用于计算 containing block 偏移。
    const wrapperRef = ref<HTMLElement>();
    // 弹层相对视口或 containing block 的偏移距离。
    const offset = ref(0);
    // 当前激活的筛选项 key，可能是用户 key，也可能是内部 FUNNEL_KEY。
    const activeKey = ref<string>();
    // 正在关闭的 key，用于 Popup 动画结束后派发 closed 事件。
    const closingKey = ref<string>();
    // 控制 Popup 自身显隐，关闭时会先触发 Popup 动画。
    const showPopup = ref(false);
    // 控制外层定位容器是否渲染，动画结束后才移除。
    const showWrapper = ref(false);
    // 漏斗 section 展开状态映射，key 为 FilterMenuBarItem.key。
    const expandedMap = ref<Record<string, boolean>>({});
    // 漏斗内每个 ProForm 实例引用，用于 validate 时逐项校验。
    const funnelFormRefs = ref<Record<string, FormExpose | undefined>>({});
    // 普通确认面板 ProForm 实例引用。
    const panelFormRefs = ref<Record<string, FormExpose | undefined>>({});
    // 确认模式下面板打开期间的 draft model，关闭未提交时丢弃。
    const draftModel = ref<FilterMenuBarModel>();
    // 滚动时重新计算弹层位置，避免筛选条位置变化后弹层错位。
    const scrollParent = useScrollParent(root);

    // 筛选项数据源，config.items 优先；columns 是快捷写法。
    const items = computed(
      () => props.config?.items ?? props.columns ?? ([] as FilterMenuBarItem[]),
    );

    // 超过该数量后启用漏斗聚合。
    const overflowThreshold = computed(() =>
      toNumber(props.config?.overflowThreshold ?? props.overflowThreshold, 4),
    );

    // 启用漏斗后，筛选条上保留的筛选项数量。
    const barItemCount = computed(() =>
      Math.max(overflowThreshold.value - 1, 1),
    );

    // barVisible=false 的筛选项不展示也不进入漏斗。
    const visibleItems = computed(() =>
      items.value.filter((item) => item.barVisible !== false),
    );

    // 是否展示漏斗入口。
    const showFunnel = computed(
      () => visibleItems.value.length > overflowThreshold.value,
    );

    // 被聚合进漏斗面板的筛选项。
    const funnelItems = computed(() =>
      showFunnel.value ? visibleItems.value.slice(barItemCount.value) : [],
    );

    // 漏斗入口是内部追加的 bar item，不参与用户 columns。
    const funnelBarItem = computed<BarItem>(() => ({
      key: FUNNEL_KEY,
      title: props.funnelTitle,
      funnel: true,
    }));

    // 最终渲染到筛选条上的项目：普通项 + 可选漏斗入口。
    const renderedBarItems = computed<BarItem[]>(() => {
      const bar = showFunnel.value
        ? visibleItems.value.slice(0, barItemCount.value)
        : visibleItems.value;
      return showFunnel.value ? [...bar, funnelBarItem.value] : bar;
    });

    // 只有一个筛选项时使用单项布局样式。
    const singleBarItem = computed(() => renderedBarItems.value.length === 1);

    // 3、4 个筛选项时，首尾项文本区域分别左对齐、右对齐。
    const edgeAlignBarItem = computed(() => {
      const count = renderedBarItems.value.length;
      return count === 3 || count === 4;
    });
    // wrapper 或 popup 任一存在时，都认为组件处于打开态。
    const opened = computed(() => showWrapper.value || showPopup.value);

    // 打开时提升 bar 层级，避免被弹层和遮罩覆盖。
    const barStyle = computed<CSSProperties | undefined>(() => {
      if (opened.value && props.zIndex !== undefined) {
        return { zIndex: +props.zIndex + 1 };
      }
    });

    // 计算弹层定位样式，down 使用 top，up 使用 bottom。
    const popupStyle = computed<CSSProperties>(() => {
      const style: CSSProperties = getZIndexStyle(props.zIndex);
      let offsetValue = offset.value;

      if (props.autoLocate && wrapperRef.value) {
        const offsetParent = getContainingBlock(wrapperRef.value);
        if (offsetParent) {
          offsetValue -= useRect(offsetParent).top;
        }
      }

      if (props.direction === 'down') {
        style.top = `${offsetValue}px`;
      } else {
        style.bottom = `${offsetValue}px`;
      }

      return style;
    });

    // 统一读取筛选项 columns，减少空值判断分散在各处。
    const getItemColumns = (item: FilterMenuBarItem) => item.columns ?? [];

    // 普通面板约定单字段，多字段时返回 undefined。
    const getSingleColumn = (item: FilterMenuBarItem) => {
      const columns = getItemColumns(item);
      return columns.length === 1 ? columns[0] : undefined;
    };

    // 获取单个 ProFormColumn 的默认值，优先使用用户 defaultValue。
    const getColumnDefaultValue = (column: ProFormColumn) =>
      cloneDefaultValue(
        column.defaultValue ??
          getDefaultValueByComponent(column.component ?? 'field'),
      );

    // 生成单个筛选项的默认 model，供重置按钮使用。
    const getItemDefaultModel = (item: FilterMenuBarItem) => {
      const columns = getItemColumns(item);
      if (!columns.length) {
        return {
          [item.key]: cloneDefaultValue(getDefaultValueByComponent('field')),
        };
      }

      return columns.reduce<Record<string, unknown>>((model, column) => {
        model[column.name] = getColumnDefaultValue(column);
        return model;
      }, {});
    };

    // 普通面板是否展示底部确认/重置区域。
    const shouldShowItemFooter = (item: FilterMenuBarItem) =>
      item.showFooter === true ||
      !!(slots[`panel-footer-${item.key}`] ?? slots['panel-footer']);

    // 漏斗面板是否展示底部确认/重置区域。
    const shouldShowFunnelFooter = () =>
      props.funnelShowFooter !== false || !!slots['funnel-footer'];

    // 普通下拉面板里的单选类组件。
    const isSingleSelectItem = (item: FilterMenuBarItem) => {
      const column = getSingleColumn(item);
      return !!column && SINGLE_SELECT_COMPONENTS.has(column.component ?? '');
    };

    // 判断 ProForm 字段是否为 options 多选（仅 checkbox 系列，不含 rangeInput 等数组值组件）。
    const isMultiSelectColumn = (column: ProFormColumn) =>
      MULTI_SELECT_COMPONENTS.has(column.component ?? '');

    // 普通单字段面板且字段为多选类型。
    const isSingleFieldMultiSelectPanel = (item: FilterMenuBarItem) => {
      const column = getSingleColumn(item);
      return !!column && isMultiSelectColumn(column);
    };

    // 统计单字段多选面板当前选中的 options 数量。
    const getPanelSelectedCount = (item: FilterMenuBarItem) => {
      const column = getSingleColumn(item);
      if (!column) {
        return 0;
      }

      const value = getItemModel(item)[column.name];
      if (!Array.isArray(value)) {
        return 0;
      }

      return value.filter(
        (current) =>
          current !== undefined && current !== null && current !== '',
      ).length;
    };

    // 单字段多选面板的确认按钮文案，追加 (n) 选中数量。
    const getFormattedConfirmText = (item: FilterMenuBarItem) => {
      const text = item.confirmText ?? props.confirmText;
      if (!isSingleFieldMultiSelectPanel(item)) {
        return text;
      }

      return `${text} (${getPanelSelectedCount(item)})`;
    };

    // 单选类且无需底部按钮的面板：选中即提交并关闭。
    // 漏斗内 section 始终走 draft，即使本身是单选也不能即时提交。
    const isImmediatePanel = (item: FilterMenuBarItem) => {
      if (activeKey.value === FUNNEL_KEY) {
        return false;
      }
      return isSingleSelectItem(item) && !shouldShowItemFooter(item);
    };

    // 当前普通面板是否应使用 draft 编辑态。
    const shouldUseDraftForItem = (item: FilterMenuBarItem): boolean =>
      opened.value && activeKey.value === item.key && !isImmediatePanel(item);

    // 当前漏斗 section 是否应使用 draft 编辑态。
    const shouldUseDraftForFunnel = (): boolean =>
      opened.value && activeKey.value === FUNNEL_KEY;

    // 读取 model 数据源：draft 打开期间走 draft，否则走已提交的 props.modelValue。
    const getModelSource = (item: FilterMenuBarItem) =>
      (shouldUseDraftForItem(item) || shouldUseDraftForFunnel()) &&
      draftModel.value
        ? draftModel.value
        : props.modelValue;

    // 生成当前筛选项传给 ProForm/插槽的局部 model。
    const getItemModel = (item: FilterMenuBarItem) => {
      const source = getModelSource(item);
      const columns = getItemColumns(item);
      if (!columns.length) {
        return { [item.key]: source[item.key] };
      }

      return columns.reduce<Record<string, unknown>>((model, column) => {
        model[column.name] =
          source[column.name] ?? getColumnDefaultValue(column);
        return model;
      }, {});
    };

    // 初始化当前面板的 draft，从已提交 model 复制。
    const initDraftForKey = (key: string) => {
      if (key === FUNNEL_KEY) {
        draftModel.value = { ...props.modelValue };
        return;
      }

      const item = visibleItems.value.find((current) => current.key === key);
      if (item && !isImmediatePanel(item)) {
        draftModel.value = { ...props.modelValue };
      } else {
        draftModel.value = undefined;
      }
    };

    // 丢弃 draft，未提交的改动不会影响 props.modelValue。
    const dismissDraft = () => {
      draftModel.value = undefined;
    };

    // 合并 draft 局部改动，确认面板与漏斗 section 共用。
    const mergeDraft = (patch: Record<string, unknown>) => {
      draftModel.value = {
        ...(draftModel.value ?? { ...props.modelValue }),
        ...patch,
      };
    };

    // 同步 v-model 并派发 change。
    const emitModelChange = (
      next: FilterMenuBarModel,
      key: string,
      value: unknown,
    ) => {
      emit('update:modelValue', next);
      emit('change', next, { key, value });
    };

    // 提交 draft 到 v-model，并通知业务层。
    const commitDraft = (key: string) => {
      const normalizedKey = normalizeEventKey(key);
      const next = draftModel.value
        ? { ...draftModel.value }
        : { ...props.modelValue };

      if (draftModel.value) {
        emit('update:modelValue', next);
        emit('change', next, {
          key: normalizedKey,
          value: getItemModel(
            visibleItems.value.find((item) => item.key === key) ?? {
              key,
            },
          ),
        });
        draftModel.value = undefined;
      }

      emit('confirm', {
        key: normalizedKey,
        model: next,
      });
    };

    // 即时单选面板：直接提交并触发 confirm。
    const commitImmediateSelection = (
      item: FilterMenuBarItem,
      value: Record<string, unknown>,
    ) => {
      const next = { ...props.modelValue, ...value };
      emitModelChange(next, item.key, value);
      emit('confirm', {
        key: normalizeEventKey(item.key),
        model: next,
      });
    };

    // 更新无 columns 的原始筛选项值，例如排序项（始终即时生效）。
    const updateRawItemValue = (item: FilterMenuBarItem, value: unknown) => {
      const next = { ...props.modelValue, [item.key]: value };
      emitModelChange(next, item.key, value);
    };

    // 更新有 columns 的筛选项；确认模式写 draft，即时模式写 props。
    const updateItemModel = (
      item: FilterMenuBarItem,
      value: Record<string, unknown>,
    ) => {
      if (isImmediatePanel(item)) {
        commitImmediateSelection(item, value);
        return;
      }

      if (shouldUseDraftForItem(item) || shouldUseDraftForFunnel()) {
        mergeDraft(value);
        return;
      }

      const next = { ...props.modelValue, ...value };
      emitModelChange(next, item.key, value);
    };

    // 重置单个面板到组件默认值。
    const resetPanel = (item: FilterMenuBarItem) => {
      const defaults = getItemDefaultModel(item);
      if (shouldUseDraftForItem(item) || draftModel.value) {
        mergeDraft(defaults);
        return;
      }

      const next = { ...props.modelValue, ...defaults };
      emitModelChange(next, item.key, defaults);
    };

    // 重置漏斗内所有 section 到组件默认值。
    const resetFunnel = () => {
      const defaults = funnelItems.value.reduce<Record<string, unknown>>(
        (model, item) => ({ ...model, ...getItemDefaultModel(item) }),
        {},
      );

      mergeDraft(defaults);
    };

    // 没有选中返显时，使用 title；没有 title 时兜底 key。
    const getFallbackTitle = (item: FilterMenuBarItem) =>
      item.title ?? item.key;

    // 从 column 或 componentProps 上读取候选项，用于标题返显。
    const getColumnOptions = (column: ProFormColumn): OptionLike[] => {
      const componentProps = column.componentProps ?? {};
      const options =
        column.options ??
        (componentProps.options as OptionLike[] | undefined) ??
        (componentProps.columns as OptionLike[] | undefined);
      return Array.isArray(options) ? options : [];
    };

    // 兼容 label/text 两种展示字段。
    const getOptionLabel = (option: OptionLike) =>
      option.label ?? option.text ?? String(option.value);

    // 根据当前值在 options 中查找展示文案。
    const findOptionLabel = (column: ProFormColumn, value: unknown) => {
      const match = getColumnOptions(column).find(
        (option) => option.value === value,
      );
      return match ? getOptionLabel(match) : undefined;
    };

    // 根据 model 当前值解析筛选条标题：单选显示 label，多选显示“多选”。
    const resolveSelectedTitle = (item: FilterMenuBarItem) => {
      for (const column of getItemColumns(item)) {
        const value = props.modelValue[column.name];
        if (!hasValue(value)) {
          continue;
        }

        if (Array.isArray(value)) {
          const labels = value
            .map((current) => findOptionLabel(column, current))
            .filter(Boolean);
          if (labels.length === 1) {
            return labels[0];
          }
          if (labels.length > 1) {
            return '多选';
          }
          continue;
        }

        const label = findOptionLabel(column, value);
        if (label) {
          return label;
        }
      }
    };

    // 筛选条最终标题。
    const getItemTitle = (item: FilterMenuBarItem) =>
      resolveSelectedTitle(item) ?? getFallbackTitle(item);

    // 漏斗 section 标题优先使用首个 column.label，和 ProForm 标题保持一致。
    const getFunnelSectionTitle = (item: FilterMenuBarItem) =>
      getItemColumns(item).find((column) => column.label)?.label ??
      getFallbackTitle(item);

    // 单个 section 的 collapsible 配置优先级高于全局默认。
    const isFunnelSectionCollapsible = (item: FilterMenuBarItem) =>
      item.collapsible ?? props.funnelSectionCollapsible;

    // section 展开状态优先读内部状态，否则使用默认展开配置。
    const getFunnelSectionExpanded = (item: FilterMenuBarItem) =>
      expandedMap.value[item.key] ?? props.funnelSectionDefaultExpanded;

    // 更新 section 展开状态，并通知外部。
    const updateFunnelSectionExpanded = (
      item: FilterMenuBarItem,
      expanded: boolean,
    ) => {
      expandedMap.value = { ...expandedMap.value, [item.key]: expanded };
      emit('sectionToggle', item.key, expanded);
    };

    // 漏斗 section Field 折叠 props，ProForm 首列与自定义 section 共用。
    const getFunnelCollapseFieldProps = (
      item: FilterMenuBarItem,
    ): Partial<FieldProps> =>
      ({
        labelAlign: 'top' as FieldTextAlign,
        labelCollapsible: isFunnelSectionCollapsible(item),
        labelExpanded: getFunnelSectionExpanded(item),
        'onUpdate:labelExpanded': (value: boolean) =>
          updateFunnelSectionExpanded(item, value),
      }) as Partial<FieldProps>;

    // 渲染漏斗 section 标题右侧操作区。
    const renderFunnelSectionAction = (item: FilterMenuBarItem) => {
      const actionSlot = slots[`section-action-${item.key}`];
      if (!actionSlot) {
        return;
      }

      const collapsible = isFunnelSectionCollapsible(item);
      const expanded = getFunnelSectionExpanded(item);

      return (
        <span
          class={bem('funnel-section-action')}
          // Field 标题行可点击折叠，操作区阻止冒泡避免误触发展开/收起。
          onClick={(event: MouseEvent) => event.stopPropagation()}
        >
          {actionSlot({
            item,
            section: item,
            expanded,
            collapsible,
            toggle: () => updateFunnelSectionExpanded(item, !expanded),
            model: getItemModel(item),
            updateModel: (value: Record<string, unknown>) =>
              updateItemModel(item, value),
            close,
          })}
        </span>
      );
    };

    const getProFormColumns = (
      item: FilterMenuBarItem,
      options: { funnel?: boolean } = {},
    ): ProFormColumn[] => {
      const columns = getItemColumns(item);

      // 漏斗面板里每个筛选项就是一个 section，首列 Field 承担标题和折叠控制。
      if (options.funnel) {
        const collapsible = isFunnelSectionCollapsible(item);
        const expanded = getFunnelSectionExpanded(item);

        return columns.map((column, index) => {
          // 只有首列承载 section 标题，其余列跟随折叠状态隐藏。
          const firstColumn = index === 0;
          const hidden =
            firstColumn || !collapsible || expanded ? column.hidden : true;
          // section-action 只挂到首列标题右侧。
          const hasAction =
            firstColumn && !!slots[`section-action-${item.key}`];
          // 首列强制 labelAlign=top，接入 Field 自带折叠能力。
          const baseFieldProps = firstColumn
            ? {
                ...column.fieldProps,
                ...getFunnelCollapseFieldProps(item),
              }
            : column.fieldProps;
          // Slider 展开态内容区需要额外上下间距，只给 slider 字段追加类名。
          const fieldProps =
            column.component === 'slider'
              ? appendSliderFieldClass(
                  baseFieldProps,
                  FUNNEL_SLIDER_FIELD_CLASS,
                  FUNNEL_SLIDER_LABEL_CLASS,
                )
              : baseFieldProps;

          return {
            ...column,
            // 首列没有 label 时使用 section fallback 标题，避免漏斗分组无标题。
            label: firstColumn
              ? (column.label ?? getFunnelSectionTitle(item))
              : column.label,
            hidden,
            fieldProps,
            fieldSlots: hasAction
              ? {
                  ...column.fieldSlots,
                  'label-action': () => renderFunnelSectionAction(item),
                }
              : column.fieldSlots,
          };
        });
      }

      // 普通面板的单字段默认隐藏 Field 标题，和原筛选下拉视觉保持一致。
      if (columns.length !== 1 || item.showFieldLabel) {
        return columns;
      }

      // 隐藏标题时同时移除 labelAlign，避免 label-top 产生空占位。
      const [column] = columns;
      return [
        {
          ...column,
          label: undefined,
          fieldProps: omit(column.fieldProps ?? {}, ['labelAlign']),
        },
      ];
    };

    // 读取排序项当前方向，非法值统一回到 default。
    const getSortOrder = (item: FilterMenuBarItem): FilterMenuBarSortValue => {
      const value = props.modelValue[item.key];
      return value === 'asc' || value === 'desc' ? value : 'default';
    };

    // 计算弹层偏移，滚动或打开前都需要刷新。
    const updateOffset = () => {
      if (!barRef.value) {
        return;
      }
      const rect = useRect(barRef);
      offset.value =
        props.direction === 'down'
          ? rect.bottom
          : windowHeight.value - rect.top;
    };

    // 校验单个普通面板 ProForm。
    const validatePanel = async (item: FilterMenuBarItem) => {
      const form = panelFormRefs.value[item.key];
      if (form) {
        await form.validate();
      }
    };

    // 批量展开漏斗 section，校验前和校验失败后都会使用。
    const expandFunnelSections = (
      keys: string[],
      baseMap = expandedMap.value,
    ) => {
      if (!keys.length) {
        return;
      }
      const next = { ...baseMap };
      keys.forEach((key) => {
        next[key] = true;
      });
      expandedMap.value = next;
    };

    // 校验漏斗内所有 ProForm；折叠内容未渲染时先临时展开再校验。
    const validateFunnelForms = async () => {
      const previousExpandedMap = { ...expandedMap.value };
      const collapsibleKeys = funnelItems.value
        .filter((item) => isFunnelSectionCollapsible(item))
        .map((item) => item.key);
      const failedKeys: string[] = [];
      const failedErrors: unknown[] = [];

      expandFunnelSections(collapsibleKeys, previousExpandedMap);
      await nextTick();

      for (const item of funnelItems.value) {
        const form = funnelFormRefs.value[item.key];
        if (!form) {
          continue;
        }

        try {
          await form.validate();
        } catch (error) {
          failedKeys.push(item.key);
          failedErrors.push(...(Array.isArray(error) ? error : [error]));
        }
      }

      if (failedKeys.length) {
        expandFunnelSections(failedKeys, previousExpandedMap);
        return Promise.reject({
          keys: failedKeys,
          errors: failedErrors,
        } satisfies FilterMenuBarValidateError);
      }

      expandedMap.value = previousExpandedMap;
    };

    // 确认按钮：校验通过后提交 draft 并关闭面板。
    const handleConfirm = async () => {
      const key = activeKey.value;
      if (!key) {
        return;
      }

      try {
        if (key === FUNNEL_KEY) {
          await validateFunnelForms();
        } else {
          const item = visibleItems.value.find(
            (current) => current.key === key,
          );
          if (item) {
            await validatePanel(item);
          }
        }
      } catch {
        return;
      }

      commitDraft(key);
      close({ commit: true });
    };

    // 关闭 Popup；默认丢弃 draft，commit=true 时保留已提交的数据。
    const close = (options?: FilterMenuBarCloseOptions) => {
      if (!showWrapper.value || !showPopup.value) {
        return;
      }

      if (!options?.commit) {
        dismissDraft();
      }

      closingKey.value = activeKey.value;
      showPopup.value = false;

      if (closingKey.value) {
        emit('close', normalizeEventKey(closingKey.value));
      }
    };

    // 打开指定筛选项面板，并记录当前 activeKey。
    const open = (key: string) => {
      if (opened.value && activeKey.value !== key) {
        dismissDraft();
      }

      updateOffset();
      initDraftForKey(key);
      activeKey.value = key;
      showWrapper.value = true;
      showPopup.value = true;
      emit('open', normalizeEventKey(key));
    };

    // 排序项点击不打开面板，只在 default/asc/desc 三态之间切换。
    const toggleSort = (item: FilterMenuBarItem) => {
      const order = getSortOrder(item);
      const next: FilterMenuBarSortValue =
        order === 'default' ? 'asc' : order === 'asc' ? 'desc' : 'default';

      updateRawItemValue(item, next);
      emit('sort', { name: item.key, order: next });
    };

    // 点击筛选条项目：禁用不处理，排序直接切换，普通项打开/关闭面板。
    const onClickBarItem = (item: BarItem) => {
      if (item.disabled) {
        return;
      }
      if (item.sort) {
        toggleSort(item);
        return;
      }
      if (activeKey.value === item.key && showPopup.value) {
        close();
        return;
      }
      open(item.key);
    };

    // ProForm 内 datePicker / picker 等弹层 teleport 到 body，点击其内容不应关闭筛选面板。
    const isNestedPopupLayerClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return false;
      }

      const layer = target.closest('.van-popup, .van-overlay');
      return !!layer && !root.value?.contains(layer);
    };

    // 点击组件外部时按配置关闭。
    const onClickAway = (event: Event) => {
      if (isNestedPopupLayerClick(event)) {
        return;
      }

      if (props.closeOnClickOutside) {
        close();
      }
    };

    // 滚动容器滚动时刷新弹层位置。
    const onScroll = () => {
      if (showPopup.value) {
        updateOffset();
      }
    };

    // Popup 动画结束后清理状态并派发 closed。
    const onPopupClosed = () => {
      const key = closingKey.value;
      showWrapper.value = false;
      activeKey.value = undefined;
      closingKey.value = undefined;

      if (key) {
        emit('closed', normalizeEventKey(key));
      }
    };

    // 创建面板类插槽作用域，暴露 model 更新与底部操作能力。
    const createItemFooterScope = (
      item: FilterMenuBarItem,
    ): FilterMenuBarPanelFooterSlotProps => ({
      item,
      model: getItemModel(item),
      updateModel: (value) => updateItemModel(item, value),
      close,
      confirm: handleConfirm,
      reset: () => resetPanel(item),
      validate: () => validatePanel(item),
      selectedCount: isSingleFieldMultiSelectPanel(item)
        ? getPanelSelectedCount(item)
        : undefined,
      confirmLabel: getFormattedConfirmText(item),
    });

    const createFunnelFooterScope = (): FilterMenuBarFunnelFooterSlotProps => ({
      items: funnelItems.value,
      model: draftModel.value ?? props.modelValue,
      close,
      confirm: handleConfirm,
      reset: resetFunnel,
      validate: validateFunnelForms,
    });

    // 渲染内置确认/重置按钮（BottomActionBar）。
    const renderDefaultFooter = (options: {
      onReset: () => void;
      confirmText?: string;
      resetText?: string;
      showResetButton?: boolean;
    }) => (
      <div class={bem('footer')}>
        <BottomActionBar
          secondaryButtonText={options.resetText ?? props.resetText}
          primaryButtonText={options.confirmText ?? props.confirmText}
          showSecondaryButton={options.showResetButton ?? props.showResetButton}
          safeAreaInsetBottom={false}
          onClick-secondary={options.onReset}
          onClick-primary={handleConfirm}
        />
      </div>
    );

    const getShowResetButton = (item: FilterMenuBarItem) =>
      item.showResetButton ?? props.showResetButton;

    // 根据 item 配置渲染 ProForm，普通面板和漏斗面板共用。
    const renderProForm = (
      item: FilterMenuBarItem,
      options?: { funnel?: boolean },
      scope = createItemFooterScope(item),
    ) => {
      const needPanelRef = options?.funnel || !isImmediatePanel(item);

      return (
        <ProForm
          ref={
            needPanelRef
              ? (instance) => {
                  const target = options?.funnel
                    ? funnelFormRefs.value
                    : panelFormRefs.value;
                  target[item.key] =
                    (instance as FormExpose | null) ?? undefined;
                }
              : undefined
          }
          modelValue={scope.model}
          columns={getProFormColumns(item, options)}
          components={item.components}
          showSubmit={false}
          onUpdate:modelValue={(value: Record<string, unknown>) => {
            scope.updateModel(value);
            // 即时单选：updateModel 已提交并触发 confirm，此处关闭面板。
            if (activeKey.value !== FUNNEL_KEY && isImmediatePanel(item)) {
              close({ commit: true });
            }
          }}
          v-slots={{
            default: () => slots[`item-${item.key}`]?.(scope),
          }}
        />
      );
    };

    // 渲染普通面板底部：插槽优先，否则按 showFooter 渲染内置按钮。
    const renderItemFooter = (item: FilterMenuBarItem) => {
      const scope = createItemFooterScope(item);
      const footerSlot =
        slots[`panel-footer-${item.key}`] ?? slots['panel-footer'];

      if (footerSlot) {
        return <div class={bem('footer')}>{footerSlot(scope)}</div>;
      }

      if (item.showFooter) {
        return renderDefaultFooter({
          onReset: () => resetPanel(item),
          confirmText: getFormattedConfirmText(item),
          resetText: item.resetText,
          showResetButton: getShowResetButton(item),
        });
      }

      return null;
    };

    // 渲染普通筛选项面板，优先使用 panel-{key}，否则使用 ProForm。
    const renderItemPanel = (item: FilterMenuBarItem) => {
      const scope = createItemFooterScope(item);
      const panelSlot = slots[`panel-${item.key}`];

      return (
        <div class={bem('panel')}>
          {panelSlot?.(scope) ?? renderProForm(item, undefined, scope)}
          {renderItemFooter(item)}
        </div>
      );
    };

    // 对外暴露的漏斗校验：必要时先打开漏斗面板。
    const validateFunnel = async () => {
      if (showFunnel.value && activeKey.value !== FUNNEL_KEY) {
        open(FUNNEL_KEY);
        await nextTick();
      }

      return validateFunnelForms();
    };

    useExpose<FilterMenuBarExpose>({
      validate: validateFunnel,
    });

    // 渲染漏斗底部：插槽优先，否则按 funnelShowFooter 渲染内置按钮。
    const renderFunnelFooter = () => {
      const footerSlot = slots['funnel-footer'];

      if (footerSlot) {
        return (
          <div class={bem('footer')}>
            {footerSlot(createFunnelFooterScope())}
          </div>
        );
      }

      if (shouldShowFunnelFooter()) {
        return renderDefaultFooter({
          onReset: resetFunnel,
        });
      }

      return null;
    };

    // 自定义漏斗 section 内容也统一包一层 Field，以复用标题和折叠视觉。
    const renderCustomFunnelSection = (
      item: FilterMenuBarItem,
      content: unknown,
    ) => {
      const hasAction = !!slots[`section-action-${item.key}`];

      return (
        <Field
          class={bem('funnel-section-field')}
          label={getFunnelSectionTitle(item)}
          {...getFunnelCollapseFieldProps(item)}
          v-slots={{
            input: () => content,
            ...(hasAction
              ? { 'label-action': () => renderFunnelSectionAction(item) }
              : {}),
          }}
        />
      );
    };

    // 渲染单个漏斗 section：panel-{key} 自定义内容优先，否则使用 ProForm。
    const renderFunnelSection = (item: FilterMenuBarItem) => {
      const scope = createItemFooterScope(item);
      const customContent = slots[`panel-${item.key}`]?.(scope);

      return (
        <div key={item.key} class={bem('funnel-section')}>
          {customContent
            ? renderCustomFunnelSection(item, customContent)
            : renderProForm(item, { funnel: true })}
        </div>
      );
    };

    // 渲染漏斗聚合面板，包含 section 列表和底部按钮。
    const renderFunnelPanel = () => (
      <div class={bem('funnel')}>
        {funnelItems.value.length ? (
          funnelItems.value.map(renderFunnelSection)
        ) : (
          <div class={bem('placeholder')}>暂无筛选项</div>
        )}
        {renderFunnelFooter()}
      </div>
    );

    // 普通筛选项存在有效值时，标题和图标进入已选中态。
    const isItemSelected = (item: BarItem) =>
      !item.funnel &&
      !item.sort &&
      Object.values(getItemModel(item)).some(hasValue);

    // 渲染默认标题图标：漏斗、排序、普通下拉三种形态。
    const renderDefaultTitleIcon = (
      item: BarItem,
      scope: TitleIconScope,
      activeColor?: string,
    ) => {
      const color =
        scope.active && activeColor ? activeColor : INACTIVE_BAR_ICON_COLOR;

      if (item.funnel) {
        return (
          <span
            class={bem('funnel-icon')}
            style={{
              backgroundColor: color,
              WebkitMaskImage: `url(${funnelSvg})`,
              maskImage: `url(${funnelSvg})`,
            }}
            aria-hidden="true"
          />
        );
      }

      if (item.sort) {
        const inactiveColor = INACTIVE_BAR_ICON_COLOR;
        const upColor =
          scope.sortOrder === 'asc' && activeColor
            ? activeColor
            : inactiveColor;
        const downColor =
          scope.sortOrder === 'desc' && activeColor
            ? activeColor
            : inactiveColor;

        return (
          <span
            class={bem('sort-icon', {
              asc: scope.sortOrder === 'asc',
              desc: scope.sortOrder === 'desc',
            })}
          >
            <Icon
              name="arrow-up"
              class={bem('sort-icon-up')}
              size={6}
              style={{ color: upColor }}
            />
            <Icon
              name="arrow-down"
              class={bem('sort-icon-down')}
              size={6}
              style={{ color: downColor }}
            />
          </span>
        );
      }

      return (
        <Icon
          name="arrow-down"
          class={bem('title-icon', { up: scope.showPopup })}
          style={{ color }}
        />
      );
    };

    // 渲染筛选条单项，整合标题、图标、激活态和点击行为。
    const renderTitle = (item: BarItem, index: number) => {
      const show = activeKey.value === item.key && showPopup.value;
      const isSort = !!item.sort;
      const sortOrder = isSort ? getSortOrder(item) : 'default';
      const sortActive = isSort && sortOrder !== 'default';
      const selected = isItemSelected(item);
      const titleActive = show || selected;
      const iconActive = show || sortActive || selected;
      const iconScope: TitleIconScope = {
        active: iconActive,
        showPopup: show,
        sortOrder,
        isFunnel: !!item.funnel,
        isSort,
      };
      const slotItem = item.funnel
        ? ({ key: 'funnel', title: props.funnelTitle } as FilterMenuBarItem)
        : item;
      const customIcon = slots['title-icon']?.({
        ...iconScope,
        item: slotItem,
      });

      const itemCount = renderedBarItems.value.length;

      return (
        <div
          key={item.key}
          id={`${id}-${index}`}
          role="button"
          tabindex={item.disabled ? undefined : 0}
          class={[
            bem('item', {
              disabled: item.disabled,
              funnel: item.funnel,
              'align-start': edgeAlignBarItem.value && index === 0,
              'align-end': edgeAlignBarItem.value && index === itemCount - 1,
            }),
            { [HAPTICS_FEEDBACK]: !item.disabled },
          ]}
          onClick={() => onClickBarItem(item)}
        >
          <span
            class={bem('title', { active: titleActive })}
            style={{ color: titleActive ? props.activeColor : '' }}
          >
            <div class="van-ellipsis">{getItemTitle(item)}</div>
          </span>
          {customIcon ??
            renderDefaultTitleIcon(item, iconScope, props.activeColor)}
        </div>
      );
    };

    // 根据 activeKey 渲染当前打开的面板内容。
    const renderActivePanel = () => {
      if (activeKey.value === FUNNEL_KEY) {
        return renderFunnelPanel();
      }

      const item = visibleItems.value.find(
        (current) => current.key === activeKey.value,
      );
      return item ? renderItemPanel(item) : null;
    };

    // 渲染弹层定位容器和 Popup，Popup 负责动画与遮罩，外层负责定位。
    const renderPopup = () => {
      if (!showWrapper.value || !activeKey.value) {
        return null;
      }

      return (
        <div
          ref={wrapperRef}
          style={popupStyle.value}
          class={bem('popup', props.direction)}
        >
          <Popup
            show={showPopup.value}
            class={bem('content')}
            overlay={props.overlay}
            overlayProps={{ duration: props.duration }}
            position={props.direction === 'down' ? 'top' : 'bottom'}
            duration={props.duration}
            zIndex={props.zIndex}
            overlayStyle={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            closeOnClickOverlay={props.closeOnClickOverlay}
            aria-labelledby={`${id}-${renderedBarItems.value.findIndex(
              (item) => item.key === activeKey.value,
            )}`}
            onUpdate:show={(show: boolean) => {
              if (!show) {
                close();
              }
            }}
            onOpened={() => {
              if (activeKey.value) {
                emit('opened', normalizeEventKey(activeKey.value));
              }
            }}
            onClosed={onPopupClosed}
          >
            {renderActivePanel()}
          </Popup>
        </div>
      );
    };

    // 点击外部关闭。
    useClickAway(root, onClickAway);
    // 页面滚动时保持弹层和筛选条对齐。
    useEventListener('scroll', onScroll, {
      target: scrollParent,
      passive: true,
    });

    // 漏斗项发生变化时初始化新增 section 的展开状态，保留已有状态。
    watch(
      () => funnelItems.value.map((item) => item.key).join(','),
      () => {
        const next = { ...expandedMap.value };
        funnelItems.value.forEach((item) => {
          if (!(item.key in next)) {
            next[item.key] =
              item.defaultExpanded ?? props.funnelSectionDefaultExpanded;
          }
        });
        expandedMap.value = next;
      },
      { immediate: true },
    );

    return () => (
      <div ref={root} class={bem()}>
        <div
          ref={barRef}
          style={barStyle.value}
          class={bem('bar', {
            opened: opened.value,
            single: singleBarItem.value,
          })}
        >
          {renderedBarItems.value.map(renderTitle)}
        </div>
        {renderPopup()}
      </div>
    );
  },
});
