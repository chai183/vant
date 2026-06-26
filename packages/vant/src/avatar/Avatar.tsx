import { computed, defineComponent, type ExtractPropTypes } from 'vue';
import {
  addUnit,
  createNamespace,
  getSizeStyle,
  makeNumericProp,
  makeStringProp,
  numericProp,
} from '../utils';
import { PRESET_AVATAR } from './presets';
import type { AvatarSize, AvatarSizeProp, AvatarType } from './types';

const [name, bem] = createNamespace('avatar');

const PRESET_SIZES: AvatarSize[] = [
  'large',
  'medium_l',
  'medium',
  'small',
  'mini',
];

const SIZE_PX: Record<AvatarSize, number> = {
  large: 60,
  medium_l: 48,
  medium: 44,
  small: 32,
  mini: 20,
};

const TEXT_FONT_SIZE_PX: Record<AvatarSize, number> = {
  large: 28,
  medium_l: 22,
  medium: 20,
  small: 14.5,
  mini: 10,
};

function isPresetSize(size: AvatarSizeProp): size is AvatarSize {
  return PRESET_SIZES.includes(size as AvatarSize);
}

export const avatarProps = {
  size: makeNumericProp<AvatarSizeProp>('large'),
  type: makeStringProp<AvatarType>('default'),
  /** 自定义图片或 SVG 地址；设置后优先于 type 占位图 */
  src: String,
  alt: String,
  /** 文字头像内容，仅展示第一个字符 */
  text: String,
  /** 文字头像字号，默认单位为 px；未设置时按 size 预设字号 */
  fontSize: numericProp,
};

export type AvatarProps = ExtractPropTypes<typeof avatarProps>;

export default defineComponent({
  name,

  props: avatarProps,

  setup(props, { slots }) {
    const sizeStyle = computed(() => {
      if (isPresetSize(props.size)) {
        const px = SIZE_PX[props.size];
        return {
          width: `${px}px`,
          height: `${px}px`,
        };
      }
      return getSizeStyle(props.size) || {};
    });

    const sizeClass = computed(() =>
      isPresetSize(props.size) ? props.size : undefined,
    );

    const isTextMode = computed(
      () =>
        !slots.default && !props.src && (props.type === 'text' || !!props.text),
    );

    const displayText = computed(() => (props.text || '').slice(0, 1));

    const textStyle = computed(() => {
      if (props.fontSize) {
        return { fontSize: addUnit(props.fontSize) };
      }
      if (isPresetSize(props.size)) {
        return { fontSize: `${TEXT_FONT_SIZE_PX[props.size]}px` };
      }
      return undefined;
    });

    const renderInner = () => {
      if (slots.default) {
        return slots.default();
      }

      if (props.src) {
        return <img class={bem('img')} src={props.src} alt={props.alt || ''} />;
      }

      if (props.type === 'text' || props.text) {
        return (
          <span class={bem('text')} style={textStyle.value}>
            {displayText.value}
          </span>
        );
      }

      const key = props.type as Exclude<AvatarType, 'text'>;
      const preset = PRESET_AVATAR[key] ?? PRESET_AVATAR.default;
      return <img class={bem('img')} src={preset} alt={props.alt || ''} />;
    };

    return () => (
      <div
        class={bem([sizeClass.value, { text: isTextMode.value }])}
        style={sizeStyle.value}
      >
        {renderInner()}
      </div>
    );
  },
});
