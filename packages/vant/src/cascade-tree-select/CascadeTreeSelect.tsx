import {
  ref,
  watch,
  computed,
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';
import {
  addUnit,
  extend,
  isDef,
  isNumeric,
  isSameValue,
  makeArrayProp,
  makeNumericProp,
  truthProp,
  createNamespace,
  type Numeric,
} from '../utils';
import type {
  CascadeTreeSelectOption,
  CascadeTreeSelectFieldNames,
  CascadeTreeSelectEventParams,
} from './types';
import { Badge } from '../badge';

type ResolvedFieldNames = Required<CascadeTreeSelectFieldNames>;

const [name, bem] = createNamespace('cascade-tree-select');

// 默认自定义字段映射
const defaultFieldNames: ResolvedFieldNames = {
  text: 'text',
  value: 'value',
  children: 'children',
  disabled: 'disabled',
  dot: 'dot',
  badge: 'badge',
  className: 'className',
};

export const cascadeTreeSelectProps = {
  max: makeNumericProp(Infinity), //限制多选时最多选中数量，默认不限制，仅在 multiple 模式下生效
  items: makeArrayProp<CascadeTreeSelectOption>(),
  height: makeNumericProp(300),
  multiple: Boolean,
  showBadge: truthProp,
  selectLeafOnly: truthProp, // 选择父级时只展开不选中，叶子节点才写入 modelValue；默认开启
  activeColor: String,
  maxColumn: makeNumericProp(2),
  expandPath: makeArrayProp<Numeric>(),
  fieldNames: Object as PropType<CascadeTreeSelectFieldNames>,
  modelValue: [Number, String, Array] as PropType<Numeric | Numeric[]>,
};

// 外部暴露的组件类型
export type CascadeTreeSelectProps = ExtractPropTypes<
  typeof cascadeTreeSelectProps
>;

export default defineComponent({
  name,

  props: cascadeTreeSelectProps,

  emits: [
    'change',
    'clickNav',
    'clickItem',
    'update:modelValue',
    'update:expandPath',
  ],

  setup(props, { emit, slots }) {
    /*-----内部 expandPath(展开面板) 状态维护 start-----*/
    const innerExpandPath = ref<Numeric[]>(props.expandPath.slice());

    // 监听外部 expandPath 变化，更新内部展开路径，保证受控模式下内外状态一致。
    watch(
      () => props.expandPath,
      (value) => {
        innerExpandPath.value = value.slice();
      },
      { deep: true },
    );
    /*-----内部 expandPath(展开面板) 状态维护 end-----*/

    // 合并默认字段和用户传入字段，后续读取 text/value/children 等字段都依赖这里。
    const fieldNames = computed<ResolvedFieldNames>(() =>
      extend({}, defaultFieldNames, props.fieldNames),
    );

    // 是否处于多选模式：显式 multiple 或 modelValue 为数组时都按多选处理。
    const isMultiple = computed(
      () => props.multiple || Array.isArray(props.modelValue),
    );

    // 当前业务仅支持单列/双列展示，maxColumn 作为内部预留能力也要兜底不超过 2。
    const normalizedMaxColumn = computed(() => Math.min(+props.maxColumn, 2));

    // 当前已选值数组，仅用于内部计算；真实对外值仍保持 props.modelValue 原始形态。
    const selectedValues = computed<Numeric[]>(() =>
      normalizeValueToArray(props.modelValue),
    );

    // 当前页面是否已经存在选中项，橙点和弱徽标展示都依赖这个状态。
    const hasSelectedValue = computed(() => selectedValues.value.length > 0);

    // 将单选值/多选值/空值统一成数组
    const normalizeValueToArray = (value: Numeric | Numeric[] | undefined) => {
      if (Array.isArray(value)) {
        return value;
      }

      return isDef(value) ? [value] : [];
    };

    /* ----获取选项的数据 start
    * text 获取选项文本
    * value 获取选项值
    * children 获取子级列表
    * isDisabled 获取选项是否禁用
    * badge 获取选项徽标值
    * hasDot 获取选项是否显示小红点
    * className 获取选项自定义类名
    ---- */

    const optionHandler = {
      // 获取选项文本；没有配置 text 时返回空字符串，避免渲染 undefined。
      text: (option: CascadeTreeSelectOption) => {
        const text = option[fieldNames.value.text];
        return isDef(text) ? String(text) : '';
      },
      // 获取选项值；没有配置 value 时退回使用 text，兼容只传文本的简单数据。
      value: (option: CascadeTreeSelectOption): Numeric => {
        const value = option[fieldNames.value.value];
        return (isDef(value) ? value : optionHandler.text(option)) as Numeric;
      },
      // 获取子级列表；非数组 children 按空数组处理，避免后续遍历报错。
      children: (
        option: CascadeTreeSelectOption,
      ): CascadeTreeSelectOption[] => {
        const children = option[fieldNames.value.children];
        return Array.isArray(children) ? children : [];
      },
      isDisabled: (option: CascadeTreeSelectOption) =>
        !!option[fieldNames.value.disabled],
      badge: (option: CascadeTreeSelectOption) =>
        option[fieldNames.value.badge] as Numeric | undefined,
      hasDot: (option: CascadeTreeSelectOption) =>
        !!option[fieldNames.value.dot],
      className: (option: CascadeTreeSelectOption) =>
        option[fieldNames.value.className],
    };

    /* ----获取选项的数据 end---- */

    /*-----徽标计算 start-----
      format: 弱徽标内容格式化
      getOptionWeak: 读取配置项弱徽标内容
      weak: 最终弱徽标内容
      hasSelectedChild: 是否存在已选子项
      shouldShowDot: 是否展示圆点
      hasWeak: 是否配置态弱徽标
    */
    const badgeHandler = {
      format: (badge: Numeric) => {
        return isNumeric(badge) && +badge > 99 ? '99+' : badge;
      },
      getOptionWeak: (option: CascadeTreeSelectOption) => {
        if (!props.showBadge || !isMultiple.value) {
          return;
        }
        return optionHandler.badge(option);
      },
      weak: (option: CascadeTreeSelectOption) => {
        const badge = badgeHandler.getOptionWeak(option);
        if (!isDef(badge) || !hasSelectedValue.value) {
          return;
        }
        return badge;
      },
      hasSelectedChild: (option: CascadeTreeSelectOption) =>
        optionHandler
          .children(option)
          .some((child) =>
            selectedValues.value.includes(optionHandler.value(child)),
          ),
      // - 只允许外层列展示；
      // - 显式配置 dot 或多选双列父项下存在已选子项时展示；
      // - 当前页面存在任意选中项时才展示；
      shouldShowDot: (
        option: CascadeTreeSelectOption,
        columnIndex: number,
        weakBadge: Numeric | undefined,
      ) => {
        if (!props.showBadge || !columnHandler.isOuter(columnIndex)) {
          return false;
        }

        // 弱徽标值存在时，不展示圆点。
        if (isDef(weakBadge)) {
          return false;
        }

        if (!hasSelectedValue.value) {
          return false;
        }

        return (
          optionHandler.hasDot(option) ||
          (isMultiple.value && badgeHandler.hasSelectedChild(option))
        );
      },
      // 判断一组数据里是否存在配置态弱徽标
      hasWeak: (options: CascadeTreeSelectOption[]) =>
        options.some((option) => isDef(badgeHandler.getOptionWeak(option))),
    };

    /*-----徽标计算 end-----*/

    /*-----列与路径计算 start-----*/

    // 根据 expandPath 逐层下钻生成需要渲染的列：
    // 1. 第一列始终来自 props.items；
    // 2. 当前列存在 active 选项且该选项有 children 时，children 作为下一列；
    // 3. 最多渲染 normalizedMaxColumn 列，当前业务限制为 2 列。
    const columns = computed(() => {
      const result: CascadeTreeSelectOption[][] = [];
      let cursor = props.items;

      while (cursor.length && result.length < normalizedMaxColumn.value) {
        const columnIndex = result.length;
        result.push(cursor);

        // 获取展开项的子列数据，作为下一列继续循环；如果没有子列或找不到展开项则终止循环。
        const expandValue = innerExpandPath.value[columnIndex];
        const expandOption = cursor.find(
          (option) => optionHandler.value(option) === expandValue,
        );
        const children = expandOption
          ? optionHandler.children(expandOption)
          : [];

        if (!children.length) {
          break;
        }

        cursor = children;
      }

      return result;
    });

    // 获取对应的展开路径选项配置option。
    const expandOptions = computed(() => {
      const result: CascadeTreeSelectOption[] = [];
      let cursor = props.items;

      innerExpandPath.value.some((value) => {
        // 每一层都只在当前 cursor 范围内查找，保证路径和级联层级严格对应。
        const expandOption = cursor.find(
          (option) => optionHandler.value(option) === value,
        );

        if (!expandOption) {
          // 路径中某一段找不到选项时终止遍历，避免继续用错误层级查找。
          return true;
        }

        result.push(expandOption);
        cursor = optionHandler.children(expandOption);

        return false;
      });

      return result;
    });

    /* 列处理函数集合
      isOuter: 判断当前列是否属于外层列
      canExpand: 选项是否可以继续展开下一列
      getNextExpandPath: 根据当前点击项生成新的展开路径
    */
    const columnHandler = {
      isOuter: (columnIndex: number) =>
        columns.value.length === 1 || columnIndex < columns.value.length - 1,
      canExpand: (option: CascadeTreeSelectOption, columnIndex: number) => {
        return (
          !!optionHandler.children(option).length &&
          columnIndex < normalizedMaxColumn.value - 1
        );
      },
      getNextExpandPath: (
        option: CascadeTreeSelectOption,
        columnIndex: number,
      ) => {
        const nextExpandPath = innerExpandPath.value.slice(0, columnIndex);
        if (columnHandler.canExpand(option, columnIndex)) {
          nextExpandPath.push(optionHandler.value(option));
        }
        return nextExpandPath;
      },
    };
    /*-----列与路径计算 end-----*/

    /*-----选中状态计算 start-----*/

    // 递归查找指定 value 对应的选项
    const findOptionByValue = (
      options: CascadeTreeSelectOption[],
      value: Numeric,
    ): CascadeTreeSelectOption | undefined => {
      for (const option of options) {
        if (optionHandler.value(option) === value) {
          return option;
        }

        // 当前层没找到时继续查找子级，兼容选中项位于第二列的场景。
        const matched = findOptionByValue(
          optionHandler.children(option),
          value,
        );
        if (matched) {
          return matched;
        }
      }
    };

    // 根据指定值集合计算已选项，用于事件参数和 content 插槽的 selectedItems。
    const getSelectedItems = (value: Numeric | Numeric[] | undefined) => {
      const values = normalizeValueToArray(value);

      return values
        .map((item) => findOptionByValue(props.items, item))
        .filter(Boolean) as CascadeTreeSelectOption[];
    };

    // 当前选项是否被直接选中
    const isOptionSelected = (option: CascadeTreeSelectOption) =>
      selectedValues.value.includes(optionHandler.value(option));

    // 根据单选/多选模式处理选中的值 -- 选中和取消选中：
    // - 单选：直接返回当前点击值；
    // - 多选：已选中则取消，未选中且未超过 max 时追加。
    const getModelValue = (value: Numeric) => {
      if (!isMultiple.value) {
        return value;
      }

      const values = selectedValues.value.slice();
      const index = values.indexOf(value);

      if (index !== -1) {
        values.splice(index, 1);
      } else if (values.length < +props.max) {
        values.push(value);
      }

      return values;
    };
    /*-----选中状态计算 end-----*/

    /*-----事件参数与交互处理 start-----*/

    // 构造事件参数
    const getEventParams = (
      option: CascadeTreeSelectOption,
      columnIndex: number,
      selectedValue: Numeric | Numeric[] | undefined,
      expandPath: Numeric[],
    ): CascadeTreeSelectEventParams => ({
      selectedValue, //本次点击后最新的选中值
      currentItem: option, //当前点击项
      columnIndex, //当前列索引
      fullPathItems: expandOptions.value.slice(0, columnIndex).concat(option), //表示本次点击对应的完整路径items
      selectedItems: getSelectedItems(selectedValue), //当前已选项
      expandPath, //展开路径
      isLeaf: !optionHandler.children(option).length, //是否叶子节点
    });

    // 点击选项-处理展开态和选中态：
    const onClickOption = (
      option: CascadeTreeSelectOption,
      columnIndex: number,
    ) => {
      // 禁用返回
      if (optionHandler.isDisabled(option)) {
        return;
      }

      const optionValue = optionHandler.value(option);
      const isLeaf = !optionHandler.children(option).length;
      // 只能点击叶子节点
      const shouldSelect = !props.selectLeafOnly || isLeaf;
      // 旧的展开路径
      const prevExpandPath = innerExpandPath.value.slice();
      // 点击时，会触发新的展开路径获取
      const nextExpandPath = columnHandler.getNextExpandPath(
        option,
        columnIndex,
      );
      // 获取新的选中值
      const nextModelValue = shouldSelect
        ? getModelValue(optionValue)
        : props.modelValue;
      // 构建事件返回参数
      const params = getEventParams(
        option,
        columnIndex,
        nextModelValue,
        nextExpandPath,
      );

      innerExpandPath.value = nextExpandPath;

      // 外层触发clickNav，内层触发clickItem
      if (columnHandler.isOuter(columnIndex)) {
        emit('clickNav', params);
      } else {
        emit('clickItem', params);
      }

      // expandPath 变化才通知外部
      if (!isSameValue(nextExpandPath, prevExpandPath)) {
        emit('update:expandPath', nextExpandPath);
      }

      // 只有满足可选条件且值真的变化时才触发 modelValue 和 change。
      if (shouldSelect && !isSameValue(nextModelValue, props.modelValue)) {
        emit('update:modelValue', nextModelValue);
        emit('change', params);
      }
    };
    /*-----事件参数与交互处理 end-----*/

    /*-----渲染辅助 start-----*/

    // 判断选项是否处于当前展开路径中
    const isOptionActive = (
      option: CascadeTreeSelectOption,
      columnIndex: number,
    ) => innerExpandPath.value[columnIndex] === optionHandler.value(option);

    // 判断当前列是否存在配置弱徽标的选项，用于交给样式控制多选单列宽度。
    // 渲染选项文字：
    // - option 插槽参数更完整，优先级最高；
    // - nav-text 插槽用于兼容只自定义文本的场景；
    // - 都没有传时回退到字段映射后的 text。
    const renderOptionText = (
      option: CascadeTreeSelectOption,
      selected: boolean,
      active: boolean,
      columnIndex: number,
    ) => {
      if (slots.option) {
        return slots.option({ option, selected, active, columnIndex });
      }

      if (slots['nav-text']) {
        return slots['nav-text'](option);
      }

      return optionHandler.text(option);
    };

    // 渲染单个选项，统一处理 active、selected、禁用、徽标和自定义插槽。
    const renderOption = (
      option: CascadeTreeSelectOption,
      columnIndex: number,
    ) => {
      // 是否在展开路径中
      const expanded = isOptionActive(option, columnIndex);
      const hasChildren = !!optionHandler.children(option).length;
      // active状态：外层列/双列的根节点
      const active =
        expanded &&
        (!isMultiple.value ||
          (hasChildren && columnHandler.isOuter(columnIndex)));

      // selected选中状态
      const selected = isOptionSelected(option);
      // 禁用状态
      const disabled = optionHandler.isDisabled(option);
      // 弱徽标
      const weakBadge = badgeHandler.weak(option);
      // 橙点显示
      const dot = badgeHandler.shouldShowDot(option, columnIndex, weakBadge);
      // 左侧滑块的条件
      const indicator =
        (active || selected) && columnHandler.isOuter(columnIndex);
      // 活动的颜色
      const color =
        option.color || (active || selected ? props.activeColor : undefined);
      const style = color ? { color } : undefined;

      return (
        <div
          role="tab"
          class={[
            bem('item', {
              active,
              selected,
              disabled,
              indicator,
              multiple: isMultiple.value,
              'with-badge': isDef(weakBadge),
            }),
            optionHandler.className(option),
          ]}
          style={style}
          tabindex={disabled ? undefined : 0}
          aria-selected={expanded || selected}
          aria-disabled={disabled || undefined}
          onClick={() => onClickOption(option, columnIndex)}
        >
          <span class={bem('label')}>
            {/* 渲染文本 */}
            <span class={['van-ellipsis', bem('text')]}>
              {renderOptionText(option, selected, active, columnIndex)}
            </span>
            {/* 圆点 */}
            {dot ? <span class={bem('dot')} /> : null}
          </span>
          {/* 徽标 */}
          {isDef(weakBadge) ? (
            <Badge class={bem('badge')} content={weakBadge} max={99} />
          ) : null}
        </div>
      );
    };

    // 渲染一列级联数据，列宽不在 TS 中计算，统一交给样式类控制。
    const renderColumn = (
      options: CascadeTreeSelectOption[],
      columnIndex: number,
    ) => (
      <div
        role="tablist"
        class={bem('column', {
          single: columns.value.length === 1,
          double: columns.value.length > 1,
          multiple: isMultiple.value,
          // 多选单列且存在配置弱徽标时，使用更宽的单列宽度变量。
          'with-badge':
            isMultiple.value &&
            columns.value.length === 1 &&
            badgeHandler.hasWeak(options),
          outer: columnHandler.isOuter(columnIndex),
          inner: !columnHandler.isOuter(columnIndex),
        })}
      >
        {slots['column-top']?.({ options, columnIndex })}
        {options.map((option) => renderOption(option, columnIndex))}
        {slots['column-bottom']?.({ options, columnIndex })}
      </div>
    );

    // 根节点样式
    const rootStyle = computed<CSSProperties>(() => {
      const style: CSSProperties = {
        height: addUnit(props.height),
      };

      if (props.activeColor) {
        (style as Record<string, string>)[
          '--van-cascade-tree-select-active-color'
        ] = props.activeColor;
      }

      return style;
    });
    /*-----渲染辅助 end-----*/

    return () => (
      <div class={bem()} style={rootStyle.value}>
        <div class={bem('nav')}>
          {columns.value.map((options, columnIndex) =>
            renderColumn(options, columnIndex),
          )}
        </div>
        {slots.content ? (
          <div class={bem('content')}>
            {/* content 插槽用于渲染右侧自定义内容：
              columns列数据，expandPath展开路径，expandOptions展开项配置，selectedValues选中值，selectedItems选中项配置。
            */}
            {slots.content({
              columns: columns.value,
              expandPath: innerExpandPath.value,
              expandOptions: expandOptions.value,
              selectedValues: selectedValues.value,
              selectedItems: getSelectedItems(props.modelValue),
            })}
          </div>
        ) : null}
      </div>
    );
  },
});
