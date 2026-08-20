<script setup lang="tsx">
import { ref } from 'vue';
import { useTranslate } from '../../../docs/site';
import VanFilterMenuBar from '..';
import VanCell from '../../cell';
import VanEmpty from '../../empty';
import Search from '../../search';
import VanCascadeTreeSelect, {
  type CascadeTreeSelectOption,
} from '../../cascade-tree-select';
import stampFrameIcon from '../../tag/assets/stamp-frame1.svg';
import type { FilterMenuBarExpose } from '..';
import type { FilterMenuBarItem, FilterMenuBarModel } from '../types';

const AMOUNT_MIN = 0;
const AMOUNT_MAX = 100000000000;

const t = useTranslate({
  'zh-CN': {
    itemTitle: '筛选',
    filterStatus: '状态',
    filterCategory: '品类',
    filterBrand: '品牌',
    filterDate: '日期',
    filterPrice: '价格',
    filterSort: '排序',
    filterArea: '地区',
    filterDiscount: '优惠',
    filterService: '服务',
    filterRating: '评分',
    filterFunnel: '带漏斗的',
    filterPanelTypes: '面板类型（标签单选 / 日期面板 / 侧栏）',
    filterStateTypes: '禁用与排序',
    filterSingleItem: '单个筛选项',
    filterDoubleItem: '两个筛选项',
    filterContentPanel: '筛选内容面板：标签单选',
    filterContentPanelMultiple: '筛选内容面板：标签多选',
    filterContentPanelRadio: '筛选内容面板：单选头像',
    filterContentPanelCheckbox: '筛选内容面板：多选头像',
    filterContentPanelMenuList: '选择菜单（单选）',
    filterContentPanelMenuListMultiple: '筛选内容面板：选择菜单（多选）',
    filterMenuList: '选择菜单',
    filterEmptyOptions: '空 options',
    radioSingle: '单选',
    checkboxMultiple: '多选',
    tagSingle: '标签单选',
    tagMultiple: '标签多选',
    filterSelectAll: '全选',
    filterCancel: '取消',
    filterInvert: '反选',
    filterReset: '重置',
    filterConfirm: '确定',
    filterClearPrice: '清空',
    filterSearch: '搜索',
    filterKeyword: '关键词',
    filterKeywordName: '查找关键字名称',
    filterSelectAmount: '选择金额',
    filterSelectAmountRange: '选择金额区间',
    filterSelectRange: '选择区间',
    filterKeywordSearch: '筛选关键词',
    filterKeywordPlaceholder: '请输入关键词',
    filterEmptyText: '暂无数据',
    unselected: '未选择',
    minPlaceholder: '¥ 最低金额',
    maxPlaceholder: '¥ 最高金额',
  },
  'en-US': {
    itemTitle: 'Title',
    filterStatus: 'Status',
    filterCategory: 'Category',
    filterBrand: 'Brand',
    filterDate: 'Date',
    filterPrice: 'Price',
    filterSort: 'Sort',
    filterArea: 'Area',
    filterDiscount: 'Discount',
    filterService: 'Service',
    filterRating: 'Rating',
    filterFunnel: 'With funnel',
    filterPanelTypes: 'Panels (tag single / date panel / sidebar)',
    filterStateTypes: 'Disabled and sort',
    filterSingleItem: 'Single item',
    filterDoubleItem: 'Two items',
    filterContentPanel: 'Filter content panel: tag single',
    filterContentPanelMultiple: 'Filter content panel: tag multiple',
    filterContentPanelRadio: 'Filter content panel: radio avatar',
    filterContentPanelCheckbox: 'Filter content panel: checkbox avatar',
    filterContentPanelMenuList: 'Menu list (single)',
    filterContentPanelMenuListMultiple:
      'Filter content panel: menu list multiple',
    filterMenuList: 'Menu list',
    filterEmptyOptions: 'Empty options',
    radioSingle: 'Radio single',
    checkboxMultiple: 'Checkbox multiple',
    tagSingle: 'Tag single',
    tagMultiple: 'Tag multiple',
    filterSelectAll: 'Select all',
    filterCancel: 'Cancel',
    filterInvert: 'Invert',
    filterReset: 'Reset',
    filterConfirm: 'Confirm',
    filterClearPrice: 'Clear',
    filterSearch: 'Search',
    filterKeyword: 'Keyword',
    filterKeywordName: 'Find keyword name',
    filterSelectAmount: 'Select amount',
    filterSelectAmountRange: 'Amount range',
    filterSelectRange: 'Select range',
    filterKeywordSearch: 'Search keyword',
    filterKeywordPlaceholder: 'Please enter keyword',
    filterEmptyText: 'No data',
    unselected: 'Unselected',
    minPlaceholder: '¥ Min amount',
    maxPlaceholder: '¥ Max amount',
  },
});

const tagOptions = [
  { label: '全部', value: 'all', icon: 'apps-o', disabled: true },
  { label: '数码', value: 'digital', icon: 'phone-o' },
  { label: '服饰', value: 'clothes', icon: 'bag-o' },
  { label: '食品', value: 'food', icon: 'gift-o' },
  { label: '家居', value: 'home', icon: 'home-o' },
  { label: '美妆', value: 'beauty', icon: 'smile-o' },
];

const avatarOptions = [
  { label: '用户 A', value: 'a', icon: stampFrameIcon },
  {
    label: '用户 B',
    value: 'b',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
  {
    label: '用户 C',
    value: 'c',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
  {
    label: '用户 D',
    value: 'd',
    icon: stampFrameIcon,
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'mini' } },
  },
];

const menuListOptions = [
  {
    label: ['结算单据', '收款账户'],
    value: 'a',
    cellProps: {
      label: '2 个标题分 2 行 · 一行辅助信息',
    },
  },
  {
    label: ['订单信息', '客户资料', '发票抬头'],
    value: 'b',
    cellProps: {
      label: '3 个标题分 2 行 · 一行辅助信息',
    },
  },
  {
    label: '张小明',
    value: 'c',
    cellProps: {
      center: true,
      avatar: { src: stampFrameIcon, size: 'mini' },
    },
  },
  {
    label: '李小红',
    value: 'd',
    cellProps: {
      center: true,
      label: '产品经理 · 负责移动端体验优化',
      avatar: { src: stampFrameIcon, size: 'small' },
    },
  },
];

const funnelModel = ref<FilterMenuBarModel>({
  filterItem1: 'all',
  filterItem2: ['brand-a'],
  filterItem3: ['keyword-a'],
  tagNormalTwo: 'digital',
  tagFoldThree: 'food',
  tagNormalFour: 'home',
  tagIconThree: 'digital',
  range: [400, 800],
  amountRange: [3000, 30000000000],
  date: ['2024-05-01', '2024-05-22'],
  radioTitle: 'all',
  checkboxTitle: ['delivery'],
  keyword: '手机',
  amount: AMOUNT_MIN,
});
const funnelRef = ref<FilterMenuBarExpose>();

const radioListOptions = [
  { label: '全部', value: 'all' },
  { label: '选项 A', value: 'a' },
  { label: '选项 B（禁用）', value: 'b', disabled: true },
  { label: '选项 C', value: 'c' },
];

const checkboxListOptions = [
  { label: '品牌 A', value: 'brand-a' },
  { label: '品牌 B', value: 'brand-b' },
  { label: '品牌 C', value: 'brand-c' },
  { label: '品牌 D', value: 'brand-d' },
];

const searchableCheckboxOptions = [
  {
    label: '关键词 A',
    value: 'keyword-a',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
  {
    label: '关键词 B',
    value: 'keyword-b',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
  {
    label: '关键词 C',
    value: 'keyword-c',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
  {
    label: '关键词 D',
    value: 'keyword-d',
    cellProps: { center: true, avatar: { src: stampFrameIcon, size: 'small' } },
  },
];

const tagNormalOptions = tagOptions.filter((option) => !option.disabled);

const tagIconOptions = tagOptions.filter(
  (option) => option.icon && !option.disabled,
);

const funnelItems: FilterMenuBarItem[] = [
  {
    key: 'filterItem1',
    title: '筛选项1',
    columns: [
      {
        name: 'filterItem1',
        label: '筛选项1',
        component: 'radioGroup',
        defaultValue: 'all',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: radioListOptions,
        },
      },
    ],
  },
  {
    key: 'filterItem2',
    title: '筛选项2',
    showFooter: true,
    columns: [
      {
        name: 'filterItem2',
        label: '筛选项2',
        component: 'checkboxGroup',
        defaultValue: ['brand-a'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: checkboxListOptions,
        },
      },
    ],
  },
  {
    key: 'filterItem3',
    title: '筛选项3',
    showFieldLabel: true,
    showFooter: true,
    searchable: true,
    searchPlaceholder: t('filterSearch'),
    columns: [
      {
        name: 'filterItem3',
        label: t('filterKeywordName'),
        component: 'checkboxGroup',
        defaultValue: ['keyword-a'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          showSearch: true,
          searchPlaceholder: t('filterSearch'),
          options: searchableCheckboxOptions,
        },
      },
    ],
  },
  {
    key: 'tagNormalTwo',
    title: '标签列表-常规',
    columns: [
      {
        name: 'tagNormalTwo',
        label: '标签列表-常规',
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 2,
          direction: 'horizontal',
          options: tagNormalOptions,
        },
      },
    ],
  },
  {
    key: 'tagFoldThree',
    title: '标签列表-可折叠',
    collapsible: true,
    defaultExpanded: false,
    columns: [
      {
        name: 'tagFoldThree',
        label: '标签列表-可折叠',
        component: 'radioGroup',
        defaultValue: 'food',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagNormalOptions,
        },
      },
    ],
  },
  {
    key: 'tagNormalFour',
    title: '标签列表-常规',
    columns: [
      {
        name: 'tagNormalFour',
        label: '标签列表-常规',
        component: 'radioGroup',
        defaultValue: 'home',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 4,
          direction: 'horizontal',
          options: tagNormalOptions,
        },
      },
    ],
  },
  {
    key: 'tagIconThree',
    title: '标签列表-常规',
    columns: [
      {
        name: 'tagIconThree',
        label: '标签列表-常规',
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagIconOptions,
        },
      },
    ],
  },
  {
    key: 'range',
    title: t('filterSelectRange'),
    columns: [
      {
        name: 'range',
        label: t('filterSelectRange'),
        component: 'slider',
        defaultValue: [400, 800],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          type: 'node-range',
          min: 200,
          max: 1000,
          step: 200,
        },
      },
    ],
  },
  {
    key: 'amountRange',
    title: t('filterSelectAmountRange'),
    columns: [
      {
        name: 'amountRange',
        label: t('filterSelectAmountRange'),
        component: 'slider',
        defaultValue: [3000, 30000000000],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          type: 'range',
          showInputs: true,
          min: AMOUNT_MIN,
          max: AMOUNT_MAX,
          minPlaceholder: t('minPlaceholder'),
          maxPlaceholder: t('maxPlaceholder'),
        },
      },
    ],
  },
  {
    key: 'date',
    title: t('filterDate'),
    columns: [
      {
        name: 'date',
        label: t('filterDate'),
        component: 'rangeInput',
        defaultValue: ['', ''],
        componentProps: {
          layout: 'horizontal',
          showDateShortcuts: true,
          start: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
          end: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
        },
      },
    ],
  },
  {
    key: 'radioTitle',
    title: '单选标题',
    columns: [
      {
        name: 'radioTitle',
        label: '单选标题',
        component: 'radioGroup',
        defaultValue: 'all',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: [
            { label: '全部', value: 'all' },
            { label: '默认排序', value: 'default' },
            { label: '销量优先', value: 'sales' },
          ],
        },
      },
    ],
  },
  {
    key: 'checkboxTitle',
    title: '多选标题',
    columns: [
      {
        name: 'checkboxTitle',
        label: '多选标题',
        component: 'checkboxGroup',
        defaultValue: ['delivery'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: [
            { label: '包邮', value: 'delivery' },
            { label: '七天无理由', value: 'refund' },
            { label: '极速发货', value: 'fast' },
            { label: '官方自营', value: 'official' },
          ],
        },
      },
    ],
  },
  {
    key: 'keyword',
    title: t('filterKeywordSearch'),
    columns: [
      {
        name: 'keyword',
        label: t('filterKeywordSearch'),
        defaultValue: '手机',
        fieldProps: {
          labelAlign: 'top',
          rules: [
            {
              required: true,
              message: '请输入关键词',
            },
          ],
        },
        render: () => (
          <Search
            scene="filter-inner"
            placeholder={t('filterKeywordPlaceholder')}
          />
        ),
      },
    ],
  },
  {
    key: 'amount',
    title: t('filterSelectAmount'),
    columns: [
      {
        name: 'amount',
        label: t('filterSelectAmount'),
        component: 'slider',
        defaultValue: AMOUNT_MIN,
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          type: 'single',
          showValue: true,
          min: AMOUNT_MIN,
          max: AMOUNT_MAX,
          unselectedText: t('unselected'),
        },
      },
    ],
  },
];

const panelTypesModel = ref<FilterMenuBarModel>({
  category: 'digital',
  date: ['2024-05-01', '2024-05-22'],
  area: ['tag-1-1', 'tag-1-2'],
});

type PanelTypesFirstOption = CascadeTreeSelectOption & {
  children: CascadeTreeSelectOption[];
};

const panelTypesAreaExpandPath = ref(['tag-1']);

const panelTypesAreaItems: PanelTypesFirstOption[] = [
  {
    text: '一级标签一',
    value: 'tag-1',
    children: [
      {
        text: '二级标签 1-1',
        value: 'tag-1-1',
        badge: 3,
      },
      {
        text: '二级标签 1-2',
        value: 'tag-1-2',
      },
      {
        text: '二级标签 1-3',
        value: 'tag-1-3',
        dot: true,
      },
    ],
  },
  {
    text: '一级标签二',
    value: 'tag-2',
    children: [
      {
        text: '二级标签 2-1',
        value: 'tag-2-1',
      },
      {
        text: '二级标签 2-2',
        value: 'tag-2-2',
      },
    ],
  },
  {
    text: '一级标签三',
    value: 'tag-3',
    children: [
      {
        text: '二级标签 3-1',
        value: 'tag-3-1',
      },
      {
        text: '二级标签 3-2',
        value: 'tag-3-2',
      },
    ],
  },
];

const panelTypesAreaOptions = panelTypesAreaItems.flatMap(
  (option) => option.children ?? [],
);

const panelTypesItems: FilterMenuBarItem[] = [
  {
    key: 'category',
    title: `${t('filterCategory')}（${t('tagSingle')}）`,
    columns: [
      {
        name: 'category',
        label: t('filterCategory'),
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagOptions,
        },
      },
    ],
  },
  {
    key: 'date',
    title: t('filterDate'),
    showFooter: true,
    columns: [
      {
        name: 'date',
        label: t('filterDate'),
        component: 'rangeInput',
        defaultValue: ['', ''],
        componentProps: {
          layout: 'horizontal',
          showDateShortcuts: true,
          start: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
          end: {
            component: 'datePicker',
            fieldProps: {
              inputBorder: true,
              placeholder: '请输入',
              isLink: false,
            },
          },
        },
      },
    ],
  },
  {
    key: 'area',
    title: t('filterArea'),
    showFooter: true,
    columns: [
      {
        name: 'area',
        label: t('filterArea'),
        defaultValue: [],
        componentProps: { columns: panelTypesAreaOptions },
      },
    ],
  },
];

const stateTypesModel = ref<FilterMenuBarModel>({
  order: 'default',
});
const stateTypesSortEvent = ref();
const stateTypesItems: FilterMenuBarItem[] = [
  { key: 'disabled', title: '禁用', disabled: true, columns: [] },
  { key: 'order', title: t('filterSort'), sort: true },
];

const singleItemLongLabelA =
  '这是一个超级长超级长超级长的选项文案用于观察单个筛选项选中后标题返显是否可以稳定省略展示不会撑开菜单栏布局不会影响右侧图标也不会导致整体换行或者溢出到屏幕外面';
const singleItemLongLabelB =
  '这是另一个超级长超级长超级长的选项文案用于观察切换选中值之后菜单栏标题是否依然保持单行省略不会破坏筛选栏高度和左右间距';

const singleItemModel = ref<FilterMenuBarModel>({
  single: '',
});
const singleItemItems: FilterMenuBarItem[] = [
  {
    key: 'single',
    title: '单个筛选项',
    columns: [
      {
        name: 'single',
        label: '单个筛选项',
        component: 'radioGroup',
        defaultValue: '',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [
            {
              label: singleItemLongLabelA,
              value: 'a',
              cellProps: {
                title: [singleItemLongLabelA],
                titleTextClass: 'van-ellipsis',
              },
            },
            {
              label: singleItemLongLabelB,
              value: 'b',
              cellProps: {
                title: [singleItemLongLabelB],
                titleTextClass: 'van-ellipsis',
              },
            },
          ],
        },
      },
    ],
  },
];

const doubleItemModel = ref<FilterMenuBarModel>({
  first: 'a',
  second: 'a',
});
const doubleItemItems: FilterMenuBarItem[] = [
  {
    key: 'first',
    title: '第一个筛选项',
    columns: [
      {
        name: 'first',
        label: '第一个筛选项',
        component: 'radioGroup',
        defaultValue: 'a',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [
            {
              label:
                '第一个筛选项里这是一个超级长超级长超级长的选项文案用于观察两个筛选项并排展示时选中返显是否能够正常省略不会把第二个筛选项挤出屏幕',
              value: 'a',
            },
            {
              label:
                '第一个筛选项里的第二个超级长选项文案用于验证不同选项切换时标题宽度省略表现是否一致并且不会影响排序图标和下拉图标对齐',
              value: 'b',
            },
          ],
        },
      },
    ],
  },
  {
    key: 'second',
    title: '第二个筛选项',
    columns: [
      {
        name: 'second',
        label: '第二个筛选项',
        component: 'radioGroup',
        defaultValue: 'a',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [
            {
              label:
                '第二个筛选项里这是一个超级长超级长超级长的选项文案用于观察右侧项目选中返显之后是否可以保持稳定宽度并且标题能够正常省略显示',
              value: 'a',
            },
            {
              label:
                '第二个筛选项里的第二个超级长选项文案用于验证两个筛选项同时存在超长返显文本时整体布局是否稳定不会换行不会溢出',
              value: 'b',
            },
          ],
        },
      },
    ],
  },
];

const emptyOptionsModel = ref<FilterMenuBarModel>({
  empty: '',
});
const emptyOptionsItems: FilterMenuBarItem[] = [
  {
    key: 'empty',
    title: t('filterEmptyOptions'),
    columns: [
      {
        name: 'empty',
        label: t('filterEmptyOptions'),
        component: 'radioGroup',
        defaultValue: '',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: [],
        },
      },
    ],
  },
];

const menuListSingleModel = ref<FilterMenuBarModel>({
  menuList: '',
});
const menuListSingleItems: FilterMenuBarItem[] = [
  {
    key: 'menuList',
    title: t('filterMenuList'),
    columns: [
      {
        name: 'menuList',
        label: t('filterMenuList'),
        component: 'radioGroup',
        defaultValue: '',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: menuListOptions,
        },
      },
    ],
  },
];

const contentPanelTagModel = ref<FilterMenuBarModel>({
  category: 'digital',
});
const contentPanelTagItems: FilterMenuBarItem[] = [
  {
    key: 'category',
    title: `${t('filterCategory')}（${t('tagSingle')}）`,
    columns: [
      {
        name: 'category',
        label: t('filterCategory'),
        component: 'radioGroup',
        defaultValue: 'digital',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: tagOptions,
        },
      },
    ],
  },
];

const contentPanelTagMultipleModel = ref<FilterMenuBarModel>({
  category: ['digital', 'home', 'all'],
});
const contentPanelTagMultipleItems: FilterMenuBarItem[] = [
  {
    key: 'category',
    title: `${t('filterCategory')}（${t('tagMultiple')}）`,
    columns: [
      {
        name: 'category',
        label: t('filterCategory'),
        component: 'checkboxGroup',
        defaultValue: ['digital', 'home', 'all'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          columns: 3,
          direction: 'horizontal',
          options: tagOptions,
        },
      },
    ],
  },
];

const contentPanelRadioModel = ref<FilterMenuBarModel>({
  user: 'a',
});
const contentPanelRadioItems: FilterMenuBarItem[] = [
  {
    key: 'user',
    title: t('filterContentPanelRadio'),
    columns: [
      {
        name: 'user',
        label: t('filterContentPanelRadio'),
        component: 'radioGroup',
        defaultValue: 'a',
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: avatarOptions,
        },
      },
    ],
  },
];

const contentPanelCheckboxModel = ref<FilterMenuBarModel>({
  user: ['a', 'b'],
});
const contentPanelCheckboxItems: FilterMenuBarItem[] = [
  {
    key: 'user',
    title: t('filterContentPanelCheckbox'),
    columns: [
      {
        name: 'user',
        label: t('filterContentPanelCheckbox'),
        component: 'checkboxGroup',
        defaultValue: ['a', 'b'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          shape: 'block',
          columns: 3,
          direction: 'horizontal',
          options: avatarOptions,
        },
      },
    ],
  },
];

const contentPanelMenuListMultipleModel = ref<FilterMenuBarModel>({
  menuList: ['a', 'b'],
});
const contentPanelMenuListMultipleItems: FilterMenuBarItem[] = [
  {
    key: 'menuList',
    title: t('filterMenuList'),
    searchable: true,
    searchPlaceholder: t('filterSearch'),
    columns: [
      {
        name: 'menuList',
        label: t('filterMenuList'),
        component: 'checkboxGroup',
        defaultValue: ['a', 'b'],
        fieldProps: { labelAlign: 'top' },
        componentProps: {
          isList: true,
          options: menuListOptions,
        },
      },
    ],
  },
];
</script>

<template>
  <div class="demo-filter-menu-bar">
    <!-- 带漏斗的 -->
    <demo-block :title="t('filterFunnel')">
      <van-filter-menu-bar
        ref="funnelRef"
        v-model="funnelModel"
        :columns="funnelItems"
        :overflow-threshold="4"
        :funnel-title="t('itemTitle')"
      />
      <van-cell title="model" :label="JSON.stringify(funnelModel)" />
    </demo-block>

    <!-- 面板类型 -->
    <demo-block :title="t('filterPanelTypes')">
      <van-filter-menu-bar
        v-model="panelTypesModel"
        :columns="panelTypesItems"
        :overflow-threshold="10"
      >
        <template #panel-area="{ model, updateModel }">
          <van-cascade-tree-select
            :model-value="model.area"
            v-model:expand-path="panelTypesAreaExpandPath"
            :items="panelTypesAreaItems"
            active-color="#ff8125"
            height="260"
            multiple
            @update:model-value="updateModel({ area: $event })"
          />
        </template>
      </van-filter-menu-bar>
      <van-cell title="model" :label="JSON.stringify(panelTypesModel)" />
    </demo-block>

    <!-- 禁用和排序 -->
    <demo-block :title="t('filterStateTypes')">
      <van-filter-menu-bar
        v-model="stateTypesModel"
        :columns="stateTypesItems"
        :overflow-threshold="10"
        @sort="stateTypesSortEvent = $event"
      />
      <van-cell
        title="sort event"
        :label="JSON.stringify(stateTypesSortEvent)"
      />
    </demo-block>

    <!-- 单个筛选项 -->
    <demo-block :title="t('filterSingleItem')">
      <van-filter-menu-bar
        v-model="singleItemModel"
        :columns="singleItemItems"
        :overflow-threshold="10"
      />
    </demo-block>

    <!-- 两个筛选项 -->
    <demo-block :title="t('filterDoubleItem')">
      <van-filter-menu-bar
        v-model="doubleItemModel"
        :columns="doubleItemItems"
        :overflow-threshold="10"
      />
    </demo-block>

    <!-- 空 options -->
    <demo-block :title="t('filterEmptyOptions')">
      <van-filter-menu-bar
        v-model="emptyOptionsModel"
        :columns="emptyOptionsItems"
        :overflow-threshold="10"
      >
        <template #panel-empty>
          <van-empty image="default" :description="t('filterEmptyText')" />
        </template>
      </van-filter-menu-bar>
    </demo-block>

    <!-- 选择菜单（单选） -->
    <demo-block :title="t('filterContentPanelMenuList')">
      <van-filter-menu-bar
        v-model="menuListSingleModel"
        :columns="menuListSingleItems"
        :overflow-threshold="10"
      />
      <van-cell title="model" :label="JSON.stringify(menuListSingleModel)" />
    </demo-block>

    <demo-block :title="t('filterContentPanel')">
      <van-filter-menu-bar
        v-model="contentPanelTagModel"
        :columns="contentPanelTagItems"
        :overflow-threshold="10"
      />
      <van-cell title="model" :label="JSON.stringify(contentPanelTagModel)" />
    </demo-block>

    <demo-block :title="t('filterContentPanelMultiple')">
      <van-filter-menu-bar
        v-model="contentPanelTagMultipleModel"
        :columns="contentPanelTagMultipleItems"
        :overflow-threshold="10"
      />
      <van-cell
        title="model"
        :label="JSON.stringify(contentPanelTagMultipleModel)"
      />
    </demo-block>

    <demo-block :title="t('filterContentPanelRadio')">
      <van-filter-menu-bar
        v-model="contentPanelRadioModel"
        :columns="contentPanelRadioItems"
        :overflow-threshold="10"
      />
      <van-cell title="model" :label="JSON.stringify(contentPanelRadioModel)" />
    </demo-block>

    <demo-block :title="t('filterContentPanelCheckbox')">
      <van-filter-menu-bar
        v-model="contentPanelCheckboxModel"
        :columns="contentPanelCheckboxItems"
        :overflow-threshold="10"
      />
      <van-cell
        title="model"
        :label="JSON.stringify(contentPanelCheckboxModel)"
      />
    </demo-block>

    <demo-block :title="t('filterContentPanelMenuListMultiple')">
      <van-filter-menu-bar
        v-model="contentPanelMenuListMultipleModel"
        :columns="contentPanelMenuListMultipleItems"
        :overflow-threshold="10"
      />
      <van-cell
        title="model"
        :label="JSON.stringify(contentPanelMenuListMultipleModel)"
      />
    </demo-block>
    <van-empty image="default" description="占位" />
    <van-empty image="default" description="占位" />
  </div>
</template>

<style lang="less">
.demo-filter-menu-bar {
  .van-cell__title {
    min-width: 0;
  }

  .van-cell__label {
    word-break: break-all;
  }
}
</style>
