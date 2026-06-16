import {
  ref,
  computed,
  defineComponent,
  type ExtractPropTypes,
  type InjectionKey,
  type Ref,
} from 'vue';
import { makeStringProp, makeNumericProp, createNamespace } from '../utils';
import { useChildren } from '@vant/use';
import { Icon } from '../icon';

const [name, bem] = createNamespace('steps');

export type StepsDirection = 'horizontal' | 'vertical';

export const stepsProps = {
  active: makeNumericProp(0),
  direction: makeStringProp<StepsDirection>('horizontal'),
  activeIcon: String,
  iconPrefix: String,
  finishIcon: String,
  activeColor: String,
  inactiveIcon: String,
  inactiveColor: String,
  collapsible: Boolean,
  reverse: Boolean,
};

export type StepsProps = ExtractPropTypes<typeof stepsProps>;

export type StepsProvide = {
  props: StepsProps;
  onClickStep: (index: number) => void;
  stepCount: Ref<number>;
  collapsed: Ref<boolean>;
  isStepError: (index: number) => boolean;
};

export const STEPS_KEY: InjectionKey<StepsProvide> = Symbol(name);

export default defineComponent({
  name,

  props: stepsProps,

  emits: ['clickStep'],

  setup(props, { emit, slots }) {
    const { linkChildren, children } = useChildren(STEPS_KEY);
    const collapsed = ref(false);

    const stepCount = computed(() => children.length);

    // 向子组件派发步骤点击事件
    const onClickStep = (index: number) => emit('clickStep', index);

    // 判断指定步骤是否为异常状态
    const isStepError = (index: number) => {
      const child = children[index] as { props?: { status?: string } };
      return child?.props?.status === 'error';
    };

    // 切换竖向可折叠步骤条的展开/收起状态
    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value;
    };

    linkChildren({
      props,
      onClickStep,
      stepCount,
      collapsed,
      isStepError,
    });

    // 横向 3~5 步时应用对应宽度样式
    const countClass = computed(() => {
      const count = stepCount.value;
      if (count >= 3 && count <= 5) {
        return `count-${count}`;
      }
      return '';
    });

    // 竖向且已收起
    const isVerticalCollapsed = computed(
      () =>
        props.collapsible && props.direction === 'vertical' && collapsed.value,
    );

    // 折叠态上方预留渐变连线空间（正序 prev 向上 / 倒序 next 向上）
    const showCollapsedPaddingTop = computed(() => {
      if (!isVerticalCollapsed.value) {
        return false;
      }
      const active = +props.active;
      const count = stepCount.value;
      if (props.reverse) {
        return active < count - 1;
      }
      return active > 0;
    });

    // 折叠态下方预留渐变连线空间（倒序 prev 向下）
    const showCollapsedPaddingBottom = computed(() => {
      if (!isVerticalCollapsed.value) {
        return false;
      }
      const active = +props.active;
      if (props.reverse) {
        return active > 0;
      }
      return false;
    });

    return () => (
      <div
        class={bem([
          props.direction,
          countClass.value,
          {
            reverse: props.reverse,
            collapsible: props.collapsible,
            collapsed: isVerticalCollapsed.value,
            'collapsed-top': showCollapsedPaddingTop.value,
            'collapsed-bottom': showCollapsedPaddingBottom.value,
          },
        ])}
      >
        {props.collapsible && props.direction === 'vertical' ? (
          <>
            <div class={bem('content')}>
              <div class={bem('items')}>{slots.default?.()}</div>
            </div>
            <div class={bem('collapse')} onClick={toggleCollapsed}>
              <span class={bem('collapse-text')}>
                {collapsed.value ? '展开' : '收起'}
              </span>
              <Icon
                class={bem('collapse-icon')}
                name={collapsed.value ? 'arrow-down' : 'arrow-up'}
              />
            </div>
          </>
        ) : (
          <div class={bem('items')}>{slots.default?.()}</div>
        )}
      </div>
    );
  },
});
