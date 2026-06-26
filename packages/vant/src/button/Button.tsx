import {
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

// Utils
import {
  extend,
  isDef,
  addUnit,
  numericProp,
  preventDefault,
  makeStringProp,
  createNamespace,
} from '../utils';
import { useRoute, routeProps } from '../composables/use-route';

// Components
import { Icon } from '../icon';
import { Loading, LoadingType } from '../loading';

// Types
import {
  ButtonSize,
  ButtonType,
  ButtonNativeType,
  ButtonIconPosition,
} from './types';

const [name, bem] = createNamespace('button');

export const buttonProps = extend({}, routeProps, {
  tag: makeStringProp<keyof HTMLElementTagNameMap>('button'),
  text: String,
  icon: String,
  type: makeStringProp<ButtonType>('primary'),
  size: makeStringProp<ButtonSize>('large'),
  color: String,
  block: Boolean,
  plain: Boolean,
  round: Boolean,
  square: Boolean,
  borderless: Boolean,
  textButton: Boolean,
  textSecondary: Boolean,
  loading: Boolean,
  disabled: Boolean,
  iconPrefix: String,
  nativeType: makeStringProp<ButtonNativeType>('button'),
  loadingSize: numericProp,
  loadingText: String,
  loadingType: String as PropType<LoadingType>,
  iconPosition: makeStringProp<ButtonIconPosition>('left'),
  width: numericProp,
  height: numericProp,
  radius: numericProp,
  fontSize: numericProp,
  textColor: String,
  paddingLeft: numericProp,
  paddingRight: numericProp,
});

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;

export default defineComponent({
  name,

  props: buttonProps,

  emits: ['click'],

  setup(props, { emit, slots }) {
    const route = useRoute();

    const renderLoadingIcon = () => {
      if (slots.loading) {
        return slots.loading();
      }

      return (
        <Loading
          size={props.loadingSize}
          type={props.loadingType}
          class={bem('loading')}
        />
      );
    };

    const renderIcon = () => {
      if (props.loading) {
        return renderLoadingIcon();
      }

      if (slots.icon) {
        return <div class={bem('icon')}>{slots.icon()}</div>;
      }

      if (props.icon) {
        return (
          <Icon
            name={props.icon}
            class={bem('icon')}
            classPrefix={props.iconPrefix}
          />
        );
      }
    };

    const renderText = () => {
      let text;
      if (props.loading) {
        text = props.loadingText;
      } else {
        text = slots.default ? slots.default() : props.text;
      }

      if (text) {
        return <span class={bem('text')}>{text}</span>;
      }
    };

    const getStyle = () => {
      const {
        color,
        plain,
        textButton,
        width,
        height,
        radius,
        fontSize,
        textColor,
        paddingLeft,
        paddingRight,
      } = props;
      const style: CSSProperties = {};
      const styleRecord = style as Record<string, string | undefined>;

      if (isDef(width)) {
        style.width = addUnit(width);
      }
      if (isDef(height)) {
        const value = addUnit(height);
        styleRecord['--van-button-custom-height'] = value;
        style.height = value;
        if (props.size === 'large') {
          style.maxHeight = value;
        }
      }
      if (isDef(radius) && !textButton) {
        const value = addUnit(radius);
        styleRecord['--van-button-custom-radius'] = value;
        style.borderRadius = value;
      }
      if (isDef(fontSize)) {
        const value = addUnit(fontSize);
        styleRecord['--van-button-custom-font-size'] = value;
        style.fontSize = value;
      }
      if (textColor) {
        styleRecord['--van-button-custom-content-color'] = textColor;
      }
      if (isDef(paddingLeft)) {
        style.paddingLeft = addUnit(paddingLeft);
      }
      if (isDef(paddingRight)) {
        style.paddingRight = addUnit(paddingRight);
      }

      if (color) {
        if (textButton) {
          if (plain) {
            styleRecord['--van-button-text-plain-color'] = color;
          } else {
            styleRecord['--van-button-text-color'] = color;
          }
        } else {
          style.color = plain ? color : 'white';

          if (!plain) {
            // Use background instead of backgroundColor to make linear-gradient work
            style.background = color;
          }

          // hide border when color is linear-gradient
          styleRecord['--van-button-custom-border-color'] = color.includes(
            'gradient',
          )
            ? 'transparent'
            : color;
        }
      }

      return Object.keys(style).length ? style : undefined;
    };

    const onClick = (event: MouseEvent) => {
      if (props.loading) {
        preventDefault(event);
      } else if (!props.disabled) {
        emit('click', event);
        route();
      }
    };

    const renderExtra = () => {
      if (props.size === 'large' && slots.extra) {
        return <div class={bem('extra')}>{slots.extra()}</div>;
      }
    };

    return () => {
      const {
        tag,
        type,
        size,
        block,
        plain,
        textButton,
        textSecondary,
        loading,
        disabled,
        nativeType,
        iconPosition,
        borderless,
      } = props;

      const hasIcon = !!(props.icon || slots.icon);
      const hasExtra = size === 'large' && !!slots.extra;

      const classes = [
        bem([
          type,
          size,
          {
            plain,
            text: textButton,
            'text-secondary': textSecondary,
            block,
            loading,
            disabled,
            borderless,
            'with-icon': size === 'small' && hasIcon,
            'with-extra': hasExtra,
          },
        ]),
      ];

      return (
        <tag
          type={nativeType}
          class={classes}
          style={getStyle()}
          disabled={disabled}
          onClick={onClick}
        >
          <div class={bem('content')}>
            {iconPosition === 'left' && renderIcon()}
            {renderText()}
            {iconPosition === 'right' && renderIcon()}
          </div>
          {renderExtra()}
        </tag>
      );
    };
  },
});
