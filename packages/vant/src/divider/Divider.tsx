import { defineComponent, type ExtractPropTypes } from 'vue';
import { makeStringProp, createNamespace } from '../utils';

const [name, bem] = createNamespace('divider');

export type DividerContentPosition = 'left' | 'center' | 'right';

export const dividerProps = {
  dashed: Boolean,
  hairline: Boolean,
  vertical: Boolean,
  borderless: Boolean,
  contentPosition: makeStringProp<DividerContentPosition>('center'),
};

export type DividerProps = ExtractPropTypes<typeof dividerProps>;

export default defineComponent({
  name,

  props: dividerProps,

  setup(props, { slots }) {
    return () => (
      <div
        role="separator"
        class={bem({
          dashed: props.dashed,
          hairline: props.hairline,
          vertical: props.vertical,
          borderless: props.borderless,
          [`content-${props.contentPosition}`]:
            !!slots.default && !props.vertical && !props.borderless,
        })}
      >
        {!props.vertical && slots.default?.()}
      </div>
    );
  },
});
