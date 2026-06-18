import { computed, defineComponent, type PropType } from 'vue';

// Utils
import { BORDER, createNamespace } from '../utils';
import { STEPS_KEY } from '../steps/Steps';

// Composables
import { useParent } from '@vant/use';

// Components
import { Icon } from '../icon';

// Types
import type { StepStatus } from './types';

const [name, bem] = createNamespace('step');

export const stepProps = {
  description: String,
  status: String as PropType<'error'>,
};

export default defineComponent({
  name,

  props: stepProps,

  setup(props, { slots }) {
    const { parent, index } = useParent(STEPS_KEY);

    if (!parent) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Vant] <Step> must be a child component of <Steps>.');
      }
      return;
    }

    const parentProps = parent.props;

    // 根据 active 与 props.status 计算当前步骤状态
    const getStatus = (): StepStatus => {
      if (props.status === 'error') {
        return 'error';
      }
      const active = +parentProps.active;
      if (index.value < active) {
        return 'finish';
      }
      return index.value === active ? 'process' : 'waiting';
    };

    const isActive = () => getStatus() === 'process';

    // 计算连接线颜色（含异常态与 reverse 方向）
    const lineStyle = computed(() => {
      const activeColor = parentProps.activeColor || 'var(--van-primary-color)';
      const isVerticalReverse =
        parentProps.direction === 'vertical' && parentProps.reverse;

      if (isVerticalReverse) {
        if (index.value > 0 && parent.isStepError(index.value - 1)) {
          return { background: 'var(--van-step-error-color)' };
        }
        if (index.value > 0 && index.value <= +parentProps.active) {
          return { background: activeColor };
        }
      } else {
        if (parent.isStepError(index.value + 1)) {
          return { background: 'var(--van-step-error-color)' };
        }
        const status = getStatus();
        if (status === 'finish') {
          return { background: activeColor };
        }
      }

      if (parentProps.inactiveColor) {
        return { background: parentProps.inactiveColor };
      }
    });

    // 计算标题文字颜色
    const titleStyle = computed(() => {
      const status = getStatus();
      if (status === 'process') {
        return { color: parentProps.activeColor || 'var(--van-primary-color)' };
      }
      if (status === 'error') {
        return { color: 'var(--van-step-error-color)' };
      }
      if (status === 'waiting' && parentProps.inactiveColor) {
        return { color: parentProps.inactiveColor };
      }
    });

    // 竖向折叠时仅展示当前步骤
    const isHidden = computed(() => {
      if (
        parentProps.direction !== 'vertical' ||
        !parentProps.collapsible ||
        !parent.collapsed.value
      ) {
        return false;
      }
      return index.value !== +parentProps.active;
    });

    // 当前步骤处于竖向折叠激活态
    const isCollapsedActive = computed(
      () =>
        parentProps.direction === 'vertical' &&
        parentProps.collapsible &&
        parent.collapsed.value &&
        index.value === +parentProps.active,
    );

    const isReverse = computed(() => !!parentProps.reverse);

    // 折叠态是否展示指向上一步的渐变连线
    const showCollapsedPrev = computed(
      () => isCollapsedActive.value && +parentProps.active > 0,
    );

    // 折叠态是否展示指向下一步的渐变连线
    const showCollapsedNext = computed(
      () => isCollapsedActive.value && index.value < parent.stepCount.value - 1,
    );

    // 折叠渐变连线的起止颜色 CSS 变量
    const collapsedLineVars = computed(() => {
      if (!isCollapsedActive.value) {
        return undefined;
      }
      return {
        '--van-step-collapsed-line-start-prev':
          parentProps.activeColor || 'var(--van-primary-color)',
        '--van-step-collapsed-line-start-next':
          parentProps.inactiveColor || 'var(--van-step-line-color)',
      } as Record<string, string>;
    });

    const verticalStyle = computed(() => {
      const style: Record<string, string | undefined> = {
        display: isHidden.value ? 'none' : undefined,
      };
      const lineVars = collapsedLineVars.value;
      if (lineVars) {
        Object.assign(style, lineVars);
      }
      return style;
    });

    const onClickStep = () => parent.onClickStep(index.value);

    // 渲染数字圆圈（完成态显示勾）
    const renderNumberCircle = (status: StepStatus) => {
      const stepNumber = index.value + 1;

      if (status === 'finish') {
        return (
          <div class={bem('circle-num', 'finish')}>
            <Icon
              class={bem('circle-check')}
              name="success"
              color="var(--van-white)"
              classPrefix={parentProps.iconPrefix}
            />
          </div>
        );
      }

      return <div class={bem('circle-num', status)}>{stepNumber}</div>;
    };

    // 渲染步骤节点图标（支持插槽与自定义 icon）
    const renderCircle = () => {
      const status = getStatus();
      const { iconPrefix, finishIcon, activeIcon, activeColor, inactiveIcon } =
        parentProps;

      if (isActive()) {
        if (slots['active-icon']) {
          return slots['active-icon']();
        }
        if (activeIcon) {
          return (
            <Icon
              class={bem('icon', 'active')}
              name={activeIcon}
              color={activeColor}
              classPrefix={iconPrefix}
            />
          );
        }
        return renderNumberCircle(status);
      }

      if (status === 'finish' && (finishIcon || slots['finish-icon'])) {
        if (slots['finish-icon']) {
          return slots['finish-icon']();
        }
        return (
          <Icon
            class={bem('icon', 'finish')}
            name={finishIcon}
            color={activeColor}
            classPrefix={iconPrefix}
          />
        );
      }

      if (status === 'finish') {
        return renderNumberCircle(status);
      }

      if (slots['inactive-icon']) {
        return slots['inactive-icon']();
      }

      if (inactiveIcon) {
        return (
          <Icon
            class={bem('icon')}
            name={inactiveIcon}
            classPrefix={iconPrefix}
          />
        );
      }

      return renderNumberCircle(status);
    };

    // 渲染辅助描述文字
    const renderDescription = () => {
      const content = props.description || slots.description?.();
      if (!content) {
        return null;
      }
      return <div class={bem('description')}>{content}</div>;
    };

    // 横向步骤布局
    const renderHorizontal = (status: StepStatus) => (
      <div
        class={[BORDER, bem(['horizontal', status])]}
        style={{ display: isHidden.value ? 'none' : undefined }}
      >
        <div class={bem('circle-container')} onClick={onClickStep}>
          {renderCircle()}
        </div>
        <div class={bem('content')}>
          <div
            class={bem('title', { active: isActive() })}
            style={titleStyle.value}
            onClick={onClickStep}
          >
            {slots.default?.()}
          </div>
          {renderDescription()}
        </div>
        <div class={bem('line')} style={lineStyle.value} />
      </div>
    );

    // 竖向步骤布局（含折叠渐变连线）
    const renderVertical = (status: StepStatus) => (
      <div
        class={bem([
          'vertical',
          status,
          {
            'collapsed-active': isCollapsedActive.value,
            reverse: isReverse.value,
          },
        ])}
        style={verticalStyle.value}
      >
        {showCollapsedPrev.value && (
          <div class={bem('collapsed-line', 'prev')} />
        )}
        {showCollapsedNext.value && (
          <div class={bem('collapsed-line', 'next')} />
        )}
        <div class={bem('circle-container')} onClick={onClickStep}>
          {renderCircle()}
        </div>
        {!isCollapsedActive.value && (
          <div class={bem('line')} style={lineStyle.value} />
        )}
        <div class={bem('content')}>
          <div class={bem('left')}>
            <div
              class={bem('title', { active: isActive() })}
              style={titleStyle.value}
              onClick={onClickStep}
            >
              {slots.default?.()}
            </div>
            {renderDescription()}
          </div>
          {slots.extra && <div class={bem('right')}>{slots.extra()}</div>}
        </div>
      </div>
    );

    return () => {
      const status = getStatus();
      return parentProps.direction === 'vertical'
        ? renderVertical(status)
        : renderHorizontal(status);
    };
  },
});
