import { defineComponent, type ExtractPropTypes, type PropType } from 'vue';

import {
  truthProp,
  getSizeStyle,
  makeStringProp,
  createNamespace,
  type Numeric,
} from '../utils';

import { Icon } from '../icon';

const [name, bem] = createNamespace('skeleton-image');

export type SkeletonImageShape = 'square' | 'round';

export const skeletonImageProps = {
  imageSize: {
    type: [Number, String, Array] as PropType<Numeric | Numeric[]>,
  },
  imageShape: makeStringProp<SkeletonImageShape>('square'),
  showIcon: truthProp,
};

export type SkeletonImageProps = ExtractPropTypes<typeof skeletonImageProps>;

export default defineComponent({
  name,

  props: skeletonImageProps,

  setup(props) {
    return () => (
      <div
        class={bem([props.imageShape])}
        style={getSizeStyle(props.imageSize)}
      >
        {props.showIcon ? <Icon name={'photo'} class={bem('icon')} /> : null}
      </div>
    );
  },
});
