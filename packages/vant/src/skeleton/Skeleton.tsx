import { defineComponent, type PropType, type ExtractPropTypes } from 'vue';

// Utils
import {
  addUnit,
  truthProp,
  numericProp,
  makeStringProp,
  makeNumericProp,
  createNamespace,
  type Numeric,
} from '../utils';

// Components
import SkeletonTitle from '../skeleton-title';
import SkeletonAvatar from '../skeleton-avatar';
import SkeletonImage from '../skeleton-image';
import SkeletonParagraph, { DEFAULT_ROW_WIDTH } from '../skeleton-paragraph';

// Types
import type { SkeletonAvatarShape } from '../skeleton-avatar';

const [name, bem] = createNamespace('skeleton');
const DEFAULT_LAST_ROW_WIDTH = '60%';

export type SkeletonTemplateType = '' | 'grid' | 'cell' | 'media';

export const skeletonProps = {
  row: makeNumericProp(0),
  round: Boolean,
  title: Boolean,
  titleWidth: numericProp,
  avatar: Boolean,
  avatarSize: numericProp,
  avatarShape: makeStringProp<SkeletonAvatarShape>('round'),
  loading: truthProp,
  animate: truthProp,
  templateType: makeStringProp<SkeletonTemplateType>(''),
  gridCount: makeNumericProp(4),
  mediaCount: makeNumericProp(2),
  rowWidth: {
    type: [Number, String, Array] as PropType<Numeric | Numeric[]>,
    default: DEFAULT_ROW_WIDTH,
  },
};

export type SkeletonProps = ExtractPropTypes<typeof skeletonProps>;

export default defineComponent({
  name,

  inheritAttrs: false,

  props: skeletonProps,

  setup(props, { slots, attrs }) {
    const isRound = () => props.round || !!props.templateType;

    const renderAvatar = () => {
      if (props.avatar) {
        return (
          <SkeletonAvatar
            avatarShape={props.avatarShape}
            avatarSize={props.avatarSize}
          />
        );
      }
    };

    const renderTitle = () => {
      if (props.title) {
        return (
          <SkeletonTitle round={isRound()} titleWidth={props.titleWidth} />
        );
      }
    };

    const getRowWidth = (index: number) => {
      const { rowWidth } = props;

      if (rowWidth === DEFAULT_ROW_WIDTH && index === +props.row - 1) {
        return DEFAULT_LAST_ROW_WIDTH;
      }

      if (Array.isArray(rowWidth)) {
        return rowWidth[index];
      }

      return rowWidth;
    };

    const renderRows = () =>
      Array(+props.row)
        .fill('')
        .map((_, i) => (
          <SkeletonParagraph
            key={i}
            round={isRound()}
            rowWidth={addUnit(getRowWidth(i))}
          />
        ));

    const renderGrid = () => (
      <div class={bem('grid')}>
        {Array.from({ length: +props.gridCount }).map((_, index) => (
          <div key={index} class={bem('grid-item')}>
            <SkeletonAvatar avatarShape="round" />
            <SkeletonParagraph
              round
              rowWidth="var(--van-skeleton-grid-text-width)"
            />
          </div>
        ))}
      </div>
    );

    const renderCellRow = (avatarShape: SkeletonAvatarShape) => (
      <div class={bem('cell-row')}>
        <SkeletonAvatar avatarShape={avatarShape} />
        <div class={bem('cell-content')}>
          <SkeletonParagraph round />
          <SkeletonParagraph round rowWidth="50%" />
        </div>
      </div>
    );

    const renderCell = () => (
      <div class={bem('cell')}>
        <SkeletonParagraph round rowWidth="33.33%" />
        <SkeletonParagraph round />
        {renderCellRow('round')}
        {renderCellRow('square')}
      </div>
    );

    const renderMedia = () => (
      <div class={bem('media')}>
        {Array.from({ length: +props.mediaCount }).map((_, index) => (
          <div key={index} class={bem('media-item')}>
            <SkeletonImage imageShape="square" showIcon={false} />
            <SkeletonParagraph round />
            <div class={bem('media-row')}>
              <SkeletonParagraph
                round
                rowWidth="var(--van-skeleton-media-row-left-width)"
              />
              <SkeletonParagraph
                round
                rowWidth="var(--van-skeleton-media-row-right-width)"
              />
            </div>
          </div>
        ))}
      </div>
    );

    const renderPreset = () => {
      switch (props.templateType) {
        case 'grid':
          return renderGrid();
        case 'cell':
          return renderCell();
        case 'media':
          return renderMedia();
        default:
          return null;
      }
    };

    const renderContents = () => {
      if (slots.template) {
        return slots.template();
      }

      const preset = renderPreset();
      if (preset) {
        return preset;
      }

      return (
        <>
          {renderAvatar()}
          <div class={bem('content')}>
            {renderTitle()}
            {renderRows()}
          </div>
        </>
      );
    };

    return () => {
      if (!props.loading) {
        return slots.default?.();
      }

      return (
        <div
          class={bem([
            {
              animate: props.animate,
              round: isRound(),
            },
            props.templateType || undefined,
          ])}
          {...attrs}
        >
          {renderContents()}
        </div>
      );
    };
  },
});
