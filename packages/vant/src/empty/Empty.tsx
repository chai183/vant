import { defineComponent, type PropType, type ExtractPropTypes } from 'vue';
import {
  Numeric,
  getSizeStyle,
  makeStringProp,
  createNamespace,
} from '../utils';
import { EMPTY_IMAGES } from './presets';

const [name, bem] = createNamespace('empty');

export const emptyProps = {
  /** 图片类型：内置 default / error / search / network，或自定义图片 URL */
  image: makeStringProp('default'),
  imageSize: [Number, String, Array] as PropType<Numeric | [Numeric, Numeric]>,
  description: String,
  secondaryDescription: String,
  showImage: {
    type: Boolean,
    default: true,
  },
};

export type EmptyProps = ExtractPropTypes<typeof emptyProps>;

export default defineComponent({
  name,

  props: emptyProps,

  setup(props, { slots }) {
    const renderDescription = () => {
      const description = slots.description
        ? slots.description()
        : props.description;

      if (description) {
        return <p class={bem('description')}>{description}</p>;
      }
    };

    const renderSecondary = () => {
      const secondary = slots.secondary
        ? slots.secondary()
        : props.secondaryDescription;

      if (secondary) {
        return <p class={bem('secondary')}>{secondary}</p>;
      }
    };

    const renderBottom = () => {
      if (slots.default) {
        return <div class={bem('bottom')}>{slots.default()}</div>;
      }
    };

    const renderImage = () => {
      if (slots.image) {
        return slots.image();
      }

      const preset = EMPTY_IMAGES[props.image];
      if (preset) {
        return <img src={preset} alt="" />;
      }

      return <img src={props.image} alt="" />;
    };

    return () => (
      <div class={bem({ 'text-only': !props.showImage })}>
        {props.showImage && (
          <div class={bem('image')} style={getSizeStyle(props.imageSize)}>
            {renderImage()}
          </div>
        )}
        {renderDescription()}
        {renderSecondary()}
        {renderBottom()}
      </div>
    );
  },
});
