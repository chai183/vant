import {
  computed,
  defineComponent,
  getCurrentInstance,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

// Utils
import { createNamespace, extend, isObject, numericProp } from '../utils';
import { TABBAR_KEY } from '../tabbar/Tabbar';

// Composables
import { useParent } from '@vant/use';
import { routeProps, useRoute } from '../composables/use-route';

// Components
import { Icon } from '../icon';
import { Badge, type BadgeProps } from '../badge';

const [name, bem] = createNamespace('tabbar-item');

export const tabbarItemProps = extend({}, routeProps, {
  dot: Boolean,
  icon: String,
  name: numericProp,
  badge: numericProp,
  badgeProps: Object as PropType<Partial<BadgeProps>>,
  iconPrefix: String,
});

export type TabbarItemProps = ExtractPropTypes<typeof tabbarItemProps>;

export default defineComponent({
  name,

  props: tabbarItemProps,

  emits: ['click'],

  setup(props, { emit, slots }) {
    const route = useRoute();
    // 组件实例
    const vm = getCurrentInstance()!.proxy!;
    const { parent, index } = useParent(TABBAR_KEY);

    if (!parent) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[Vant] <TabbarItem> must be a child component of <Tabbar>.',
        );
      }
      return;
    }

    const active = computed(() => {
      const { route, modelValue } = parent.props;
      // 路由模式匹配
      if (route && '$route' in vm) {
        const { $route } = vm;
        const { to } = props;
        const config = isObject(to) ? to : { path: to };
        return $route.matched.some((val) => {
          const pathMatched = 'path' in config && config.path === val.path;
          const nameMatched = 'name' in config && config.name === val.name;
          return pathMatched || nameMatched;
        });
      }
      // 判断name或index和当前值的对比
      return (props.name ?? index.value) === modelValue;
    });

    // 点击的时候 触发tabbar回调更新值
    const onClick = (event: MouseEvent) => {
      if (!active.value) {
        parent.setActive(props.name ?? index.value, route);
      }
      emit('click', event);
    };

    const renderIcon = () => {
      if (slots.icon) {
        return slots.icon({ active: active.value });
      }
      if (props.icon) {
        return <Icon name={props.icon} classPrefix={props.iconPrefix} />;
      }
    };

    return () => {
      // 红点，徽标值
      const { dot, badge } = props;
      // 选中/未选中 颜色
      const { activeColor, inactiveColor, showShadow } = parent.props;
      const color = active.value ? activeColor : inactiveColor;

      return (
        <div
          role="tab"
          class={bem({ active: active.value, shaow: showShadow })}
          style={{ color }}
          tabindex={0}
          aria-selected={active.value}
          onClick={onClick}
        >
          <Badge
            v-slots={{ default: renderIcon }}
            dot={dot}
            class={bem('icon')}
            content={badge}
            {...props.badgeProps}
          />
          <div class={bem('text')}>
            {slots.default?.({ active: active.value })}
          </div>
        </div>
      );
    };
  },
});
