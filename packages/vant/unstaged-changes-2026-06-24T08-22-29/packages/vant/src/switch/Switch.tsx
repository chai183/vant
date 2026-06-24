import {
  defineComponent,
  type ExtractPropTypes,
  type CSSProperties,
} from 'vue';
import {
  addUnit,
  isDef,
  unitToPx,
  numericProp,
  unknownProp,
  createNamespace,
} from '../utils';
import { useCustomFieldValue } from '@vant/use';
import { Loading } from '../loading';

const [name, bem] = createNamespace('switch');

export const switchProps = {
  size: numericProp,
  loading: Boolean,
  disabled: Boolean,
  modelValue: unknownProp,
  activeColor: String,
  inactiveColor: String,
  activeValue: {
    type: unknownProp,
    default: true as unknown,
  },
  inactiveValue: {
    type: unknownProp,
    default: false as unknown,
  },
};

export type SwitchProps = ExtractPropTypes<typeof switchProps>;

export default defineComponent({
  name,

  props: switchProps,

  emits: ['change', 'update:modelValue'],

  setup(props, { emit, slots }) {
    const isChecked = () => props.modelValue === props.activeValue;

    const onClick = () => {
      if (!props.disabled && !props.loading) {
        const newValue = isChecked() ? props.inactiveValue : props.activeValue;
        emit('update:modelValue', newValue);
        emit('change', newValue);
      }
    };

    const renderNode = () => {
      if (!props.loading && slots.node) {
        return slots.node();
      }
    };

    const renderLoading = () => {
      if (props.loading) {
        return <Loading class={bem('loading')} />;
      }
    };

    useCustomFieldValue(() => props.modelValue);

    return () => {
      const { size, loading, disabled, activeColor, inactiveColor } = props;
      const checked = isChecked();
      const style: CSSProperties = {
        backgroundColor: checked ? activeColor : inactiveColor,
      };

      if (isDef(size)) {
        const nodeSizePx = unitToPx(size);
        style['--van-switch-node-size'] = addUnit(size);
        style['--van-switch-width'] = `${(nodeSizePx * 40) / 18}px`;
        style['--van-switch-height'] = `${(nodeSizePx * 22) / 18}px`;
      }

      return (
        <div
          role="switch"
          class={bem({
            on: checked,
            loading,
            disabled,
          })}
          style={style}
          tabindex={disabled ? undefined : 0}
          aria-checked={checked}
          onClick={onClick}
        >
          {renderLoading()}
          <div class={bem('node')}>{renderNode()}</div>
          {slots.background?.()}
        </div>
      );
    };
  },
});
