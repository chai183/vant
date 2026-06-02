import { computed, defineComponent, type ExtractPropTypes } from 'vue';
import { makeStringProp, createNamespace } from '../utils';
import { PRESET_AVATAR } from './presets';
import type { AvatarSize, AvatarType } from './types';

const [name, bem] = createNamespace('avatar');

const SIZE_PX: Record<AvatarSize, number> = {
  large: 60,
  medium: 44,
  small: 32,
  mini: 20,
};

export const avatarProps = {
  size: makeStringProp<AvatarSize>('medium'),
  type: makeStringProp<AvatarType>('default'),
  /** 自定义图片或 SVG 地址；设置后优先于 type 占位图 */
  src: String,
  alt: String,
  /** 文字头像内容，最多展示 3 个字符 */
  text: String,
};

export type AvatarProps = ExtractPropTypes<typeof avatarProps>;

export default defineComponent({
  name,

  props: avatarProps,

  setup(props, { slots }) {
    const px = computed(() => SIZE_PX[props.size]);

    const isTextMode = computed(
      () =>
        !slots.default &&
        !props.src &&
        (props.type === 'text' || !!props.text),
    );

    const displayText = computed(() => {
      const t = props.text || '';
      return t.length > 3 ? t.slice(0, 3) : t;
    });

    const renderInner = () => {
      if (slots.default) {
        return slots.default();
      }

      if (props.src) {
        return (
          <img class={bem('img')} src={props.src} alt={props.alt || ''} />
        );
      }

      if (props.type === 'text' || props.text) {
        return <span class={bem('text')}>{displayText.value}</span>;
      }

      const key = props.type as Exclude<AvatarType, 'text'>;
      const preset = PRESET_AVATAR[key] ?? PRESET_AVATAR.default;
      return <img class={bem('img')} src={preset} alt={props.alt || ''} />;
    };

    return () => (
      <div
        class={bem([props.size, { text: isTextMode.value }])}
        style={{
          width: `${px.value}px`,
          height: `${px.value}px`,
        }}
      >
        {renderInner()}
      </div>
    );
  },
});
