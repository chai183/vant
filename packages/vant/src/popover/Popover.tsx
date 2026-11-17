import {
  ref,
  watch,
  nextTick,
  onMounted,
  watchEffect,
  onBeforeUnmount,
  defineComponent,
  type PropType,
  type CSSProperties,
  type TeleportProps,
  type ExtractPropTypes,
} from 'vue';

// Popper.js 用于气泡的定位和跟随
import { Instance, createPopper, offsetModifier } from '@vant/popperjs';

// Utils
import {
  pick,
  extend,
  addUnit,
  inBrowser,
  truthProp,
  numericProp,
  unknownProp,
  BORDER_RIGHT,
  BORDER_BOTTOM,
  makeArrayProp,
  makeStringProp,
  createNamespace,
  type ComponentInstance,
} from '../utils';

// Composables
import { useClickAway } from '@vant/use'; // 点击外部区域检测
import { useScopeId } from '../composables/use-scope-id';
import { useSyncPropRef } from '../composables/use-sync-prop-ref'; // 同步 Prop 到内部 Ref

// Components
import { Icon } from '../icon';
import { Popup } from '../popup';

// Types
import {
  PopoverTheme,
  PopoverAction,
  PopoverActionsDirection,
  PopoverTrigger,
  PopoverPlacement,
} from './types';

// 创建命名空间
const [name, bem] = createNamespace('popover');

// Popup 组件透传的 Props 列表
const popupProps = [
  'overlay',
  'duration',
  'teleport',
  'overlayStyle',
  'overlayClass',
  'closeOnClickOverlay',
] as const;

export const popoverProps = {
  show: Boolean, // 是否显示气泡
  theme: makeStringProp<PopoverTheme>('light'), // 主题：light / dark
  message: numericProp, // 消息文本（纯文本模式）
  width: numericProp, // 内容宽度
  height: numericProp, // 内容高度
  color: String, // 文字颜色
  background: String, // 背景色
  contentClass: unknownProp, // 内容区自定义 class
  contentStyle: Object as PropType<CSSProperties>, // 内容区自定义样式
  overlay: Boolean, // 是否显示遮罩层（透传到 Popup）
  actions: makeArrayProp<PopoverAction>(), // 操作项列表
  selectedIndex: numericProp, // 当前选中项索引（支持受控）
  referenceText: Boolean, // 是否使用操作项文本作为触发器文本
  actionsDirection: makeStringProp<PopoverActionsDirection>('vertical'), // 操作项排列方向
  trigger: makeStringProp<PopoverTrigger>('click'), // 触发方式：click / longpress
  duration: numericProp, // 动画时长（透传到 Popup）
  showArrow: truthProp, // 是否显示箭头
  placement: makeStringProp<PopoverPlacement>('bottom'), // 气泡位置
  iconPrefix: String, // 图标前缀
  overlayClass: unknownProp, // 遮罩层 class（透传）
  overlayStyle: Object as PropType<CSSProperties>, // 遮罩层样式（透传）
  closeOnClickAction: truthProp, // 点击操作项后是否关闭
  closeOnClickOverlay: truthProp, // 点击遮罩层是否关闭
  closeOnClickOutside: truthProp, // 点击外部是否关闭
  offset: {
    type: Array as unknown as PropType<[number, number]>,
    default: () => [0, 8], // 气泡与触发器的偏移量 [横, 纵]
  },
  teleport: {
    type: [String, Object] as PropType<TeleportProps['to']>,
    default: 'body', // 弹出层挂载目标（透传到 Popup）
  },
};

export type PopoverProps = ExtractPropTypes<typeof popoverProps>;

export default defineComponent({
  name,

  props: popoverProps,

  emits: ['select', 'touchstart', 'update:show', 'update:selectedIndex'],

  setup(props, { emit, slots, attrs }) {
    // ==================== 状态与 Refs ====================
    let popper: Instance | null; // Popper.js 定位实例

    const popupRef = ref<HTMLElement>(); // Popup 弹出层的 DOM 引用
    const wrapperRef = ref<HTMLElement>(); // 触发器的包裹元素引用
    const popoverRef = ref<ComponentInstance>(); // Popup 组件实例引用
    const innerSelectedIndex = ref(0); // 内部选中的操作项索引

    // 同步 show prop 到内部 ref，支持双向绑定
    const show = useSyncPropRef(
      () => props.show,
      (value) => emit('update:show', value),
    );

    // 获取当前选中的索引（优先使用外部受控值）
    const getSelectedIndex = () =>
      props.selectedIndex != null
        ? +props.selectedIndex
        : innerSelectedIndex.value;

    // 设置选中索引（内部更新 + 向外同步）
    const setSelectedIndex = (index: number) => {
      innerSelectedIndex.value = index;
      emit('update:selectedIndex', index);
    };

    // 监听外部 selectedIndex 变化，同步到内部
    watch(
      () => props.selectedIndex,
      (value) => {
        if (value != null) {
          innerSelectedIndex.value = +value;
        }
      },
    );

    // 获取触发器展示的相关信息（索引、操作项、文本）
    const getReferenceScope = () => {
      const index = getSelectedIndex();
      const action = props.actions[index] ?? props.actions[0];

      return {
        index,
        action,
        text: action?.text ?? '',
      };
    };

    // ==================== Popper 定位相关 ====================
    // 构建 Popper 配置选项
    const getPopoverOptions = () => ({
      placement: props.placement,
      modifiers: [
        {
          name: 'computeStyles',
          options: {
            adaptive: false,
            gpuAcceleration: false,
          },
        },
        extend({}, offsetModifier, {
          options: {
            offset: props.offset,
          },
        }),
      ],
    });

    // 创建 Popper 定位实例
    const createPopperInstance = () => {
      if (wrapperRef.value && popoverRef.value) {
        return createPopper(
          wrapperRef.value, // 触发器元素（reference）
          popoverRef.value.popupRef.value, // 弹出层元素（popper）
          getPopoverOptions(),
        );
      }
      return null;
    };

    // 更新气泡位置（首次创建或后续更新）
    const updateLocation = () => {
      nextTick(() => {
        if (!show.value) {
          return;
        }

        if (!popper) {
          // 首次显示：创建 Popper 实例
          popper = createPopperInstance();
          // 监听动画/过渡结束事件，动画完成后重新定位
          if (inBrowser) {
            window.addEventListener('animationend', updateLocation);
            window.addEventListener('transitionend', updateLocation);
          }
        } else {
          // 已存在实例：更新定位配置
          popper.setOptions(getPopoverOptions());
        }
      });
    };

    // ==================== 交互方法 ====================
    // 更新显示状态
    const updateShow = (value: boolean) => {
      show.value = value;
    };

    // 点击触发器（click 模式下切换显示）
    const onClickWrapper = () => {
      if (props.trigger === 'click') {
        show.value = !show.value;
      }
    };

    // 点击操作项
    const onClickAction = (action: PopoverAction, index: number) => {
      if (action.disabled) {
        return;
      }

      setSelectedIndex(index);
      emit('select', action, index);

      if (props.closeOnClickAction) {
        show.value = false;
      }
    };

    // 点击外部区域时的处理
    const onClickAway = () => {
      if (
        show.value &&
        props.closeOnClickOutside &&
        (!props.overlay || props.closeOnClickOverlay)
      ) {
        show.value = false;
      }
    };

    // ==================== 辅助判断 ====================
    // 是否为纯文本模式（有 message 且无自定义插槽）
    const hasMessage = () => props.message != null && props.message !== '';
    const isTextMode = () => !slots.default && !slots.content && hasMessage();

    // ==================== 样式相关 ====================
    // 构建内容区样式
    const getContentStyle = (): CSSProperties => {
      const style: CSSProperties = extend({}, props.contentStyle);

      if (props.width != null) {
        style.width = addUnit(props.width);
      }
      if (props.height != null) {
        style.height = addUnit(props.height);
      }
      if (props.color) {
        style.color = props.color;
      }
      if (props.background) {
        style.background = props.background;
      }

      return style;
    };

    // 构建气泡层样式（背景色通过 CSS 变量传递）
    const getPopoverStyle = (): CSSProperties | undefined => {
      if (!props.background) {
        return undefined;
      }

      return {
        '--van-popover-content-background': props.background,
        '--van-popover-light-background': props.background,
      } as CSSProperties;
    };

    // ==================== 渲染函数 ====================
    // 渲染纯文本消息
    const renderMessage = () => {
      const scope = { message: props.message };

      if (slots.message) {
        return slots.message(scope);
      }

      return <div class={bem('message')}>{props.message}</div>;
    };

    // 渲染气泡主体内容（优先级：default > content > message > actions）
    const renderBody = () => {
      if (slots.default) {
        return slots.default();
      }

      if (slots.content) {
        return slots.content({ message: props.message });
      }

      if (isTextMode()) {
        return renderMessage();
      }

      return props.actions.map(renderAction);
    };

    // 渲染单个操作项的内容（图标 + 文本）
    const renderActionContent = (action: PopoverAction, index: number) => {
      if (slots.action) {
        return slots.action({ action, index });
      }

      return [
        action.icon && (
          <Icon
            name={action.icon}
            classPrefix={props.iconPrefix}
            class={bem('action-icon')}
          />
        ),
        <div
          class={[
            bem('action-text'),
            { [BORDER_BOTTOM]: props.actionsDirection === 'vertical' },
          ]}
        >
          {action.text}
        </div>,
      ];
    };

    // 渲染单个操作项（带点击、无障碍属性）
    const renderAction = (action: PopoverAction, index: number) => {
      const { icon, color, disabled, className } = action;
      return (
        <div
          role="menuitem"
          class={[
            bem('action', { disabled, 'with-icon': icon }),
            { [BORDER_RIGHT]: props.actionsDirection === 'horizontal' },
            className,
          ]}
          style={{ color }}
          tabindex={disabled ? undefined : 0} // 可聚焦
          aria-disabled={disabled || undefined} // 无障碍禁用状态
          onClick={() => onClickAction(action, index)}
        >
          {renderActionContent(action, index)}
        </div>
      );
    };

    // 渲染触发器（reference）
    const renderReference = () => {
      const scope = getReferenceScope();

      if (slots.reference) {
        return slots.reference(scope);
      }

      if (props.referenceText && props.actions.length) {
        return (
          <span class={bem('reference-text')}>
            {scope.text}
            <Icon
              name="arrow-down"
              class={bem('reference-icon', { expanded: show.value })}
            />
          </span>
        );
      }
    };

    // ==================== 生命周期 ====================
    onMounted(() => {
      updateLocation(); // 初始化定位
      watchEffect(() => {
        // 响应式同步 popupRef
        popupRef.value = popoverRef.value?.popupRef.value;
      });
    });

    onBeforeUnmount(() => {
      if (popper) {
        if (inBrowser) {
          window.removeEventListener('animationend', updateLocation);
          window.removeEventListener('transitionend', updateLocation);
        }
        popper.destroy(); // 销毁 Popper 实例，释放内存
        popper = null;
      }
    });

    // 监听 show / offset / placement 变化，更新定位
    watch(() => [show.value, props.offset, props.placement], updateLocation);

    // 检测点击外部区域（touchstart 事件）
    useClickAway([wrapperRef, popupRef], onClickAway, {
      eventName: 'touchstart',
    });

    // ==================== 根渲染逻辑 ====================
    return () => {
      const textMode = isTextMode();

      return (
        <>
          {/* 触发器区域 */}
          <span
            ref={wrapperRef}
            class={bem('wrapper')}
            onClick={onClickWrapper}
          >
            {renderReference()}
          </span>

          {/* 弹出气泡层 */}
          <Popup
            ref={popoverRef}
            show={show.value}
            class={bem([
              props.theme,
              {
                'custom-color': !!props.background,
                text: textMode,
              },
            ])}
            style={getPopoverStyle()}
            position={''} // 不设置 position，由 Popper 控制
            transition="van-popover-zoom" // 缩放动画
            lockScroll={false} // 不锁定滚动
            onUpdate:show={updateShow}
            {...attrs} // 透传 attrs
            {...useScopeId()} // 支持 scoped CSS
            {...pick(props, popupProps)} // 透传 Popup 相关 props
          >
            {props.showArrow && <div class={bem('arrow')} />}
            <div
              role={textMode ? 'tooltip' : 'menu'} // 无障碍角色
              class={[
                bem('content', {
                  text: textMode,
                  [props.actionsDirection]: !textMode,
                }),
                props.contentClass,
              ]}
              style={getContentStyle()}
            >
              {renderBody()}
            </div>
          </Popup>
        </>
      );
    };
  },
});
