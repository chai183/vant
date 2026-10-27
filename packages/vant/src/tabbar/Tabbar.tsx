import {
  ref,
  defineComponent,
  type PropType,
  type InjectionKey,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  truthProp,
  numericProp,
  getZIndexStyle,
  createNamespace,
  callInterceptor,
  makeNumericProp,
  BORDER_TOP_BOTTOM,
  type Numeric,
  type Interceptor,
} from '../utils';

// Composables
import { useChildren } from '@vant/use';
import { usePlaceholder } from '../composables/use-placeholder';

const [name, bem] = createNamespace('tabbar');

export const tabbarProps = {
  route: Boolean,
  fixed: truthProp,
  border: truthProp,
  zIndex: numericProp,
  placeholder: Boolean,
  activeColor: String,
  beforeChange: Function as PropType<Interceptor>,
  inactiveColor: String,
  modelValue: makeNumericProp(0),
  safeAreaInsetBottom: {
    type: Boolean as PropType<boolean | null>,
    default: null,
  },
  showShadow: Boolean,
};

export type TabbarProps = ExtractPropTypes<typeof tabbarProps>;

export type TabbarProvide = {
  props: TabbarProps;
  setActive: (active: Numeric, afterChange: () => void) => void;
};

export const TABBAR_KEY: InjectionKey<TabbarProvide> = Symbol(name);

export default defineComponent({
  name,

  props: tabbarProps,

  emits: ['change', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const root = ref<HTMLElement>();
    // 注意此方法是vant内置，基于provide inject实现，给予子组件通信传值的
    const { linkChildren } = useChildren(TABBAR_KEY);
    const renderPlaceholder = usePlaceholder(root, bem);

    // 安全区域设置
    const enableSafeArea = () => props.safeAreaInsetBottom ?? props.fixed;

    const renderTabbar = () => {
      const { fixed, zIndex, border } = props;
      return (
        <div
          ref={root}
          role="tablist"
          style={getZIndexStyle(zIndex)}
          class={[
            bem({ fixed }),
            {
              [BORDER_TOP_BOTTOM]: border,
              'van-safe-area-bottom': enableSafeArea(),
            },
          ]}
        >
          {slots.default?.()}
        </div>
      );
    };

    const setActive = (active: Numeric, afterChange: () => void) => {
      // 此函数内部执行顺序：点击tabbar-item --> 调用beforeChange --> done()执行
      callInterceptor(props.beforeChange, {
        args: [active], //args里面传递的参数是给beforeChange使用的
        done() {
          emit('update:modelValue', active);
          emit('change', active);
          afterChange();
        },
      });
    };

    linkChildren({ props, setActive });

    return () => {
      if (props.fixed && props.placeholder) {
        return renderPlaceholder(renderTabbar);
      }
      return renderTabbar();
    };
  },
});
