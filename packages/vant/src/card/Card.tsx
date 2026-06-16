import {
  computed,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

import {
  numericProp,
  truthProp,
  makeStringProp,
  makeNumberProp,
  createNamespace,
} from '../utils';
import { Image } from '../image';
import type { ImageFit } from '../image';
import { Icon } from '../icon';
import { Checkbox } from '../checkbox';
import CardTitle from './components/CardTitle';
import CardTextList from './components/CardTextList';
import CardFooter from './components/CardFooter';
import type {
  CardType,
  CardContentType,
  CardTextListItem,
  CardFooterButton,
  CardTagOption,
  CardStatusTagProps,
  CardFooterButtonType,
  CardFooterNoteLayout,
  CardAvatarSize,
} from './card-types';
import {
  getEllipsisClass,
  getLineClampStyle,
  isEmptySlotContent,
  makeTextRowsProp,
  normalizeTextRows,
  pickTextListSlots,
  shouldIgnoreSelectToggle,
} from './utils';

const [name, bem] = createNamespace('card');

export const cardProps = {
  // --- 卡片形态 ---
  type: makeStringProp<CardType>('default'), // default | image-large | image-double | image-right
  // --- 标题区 ---
  showTitle: truthProp,
  title: String,
  subtitle: String,
  titleRows: makeTextRowsProp(2),
  subtitleRows: makeTextRowsProp(1),
  avatar: String,
  avatarSize: makeStringProp<CardAvatarSize>('small'), // small 20px | large 44px
  statusTagProps: Object as PropType<CardStatusTagProps>, // 透传 Tag，文案用 #status-tag
  isLink: Boolean, // 展示 link 箭头；仅点击箭头触发 click-title
  badge: numericProp,
  badgeMax: numericProp,
  badgeDot: Boolean,
  tags: Array as PropType<CardTagOption[]>,
  // --- 可选态 ---
  selectable: Boolean,
  selected: Boolean,
  selectDisabled: Boolean,
  // --- 内容区 ---
  contentType: String as PropType<CardContentType>, // 预制：text-list
  contentItems: Array as PropType<CardTextListItem[]>,
  collapsible: Boolean, // 仅 text-list 有效
  collapseRows: makeNumberProp(3),
  expandText: makeStringProp('展开'),
  collapseText: makeStringProp('收起'),
  // --- 底部区 ---
  showFooterButtons: Boolean,
  footerButtonType: makeStringProp<CardFooterButtonType>('text'), // text | outline
  footerButtons: Array as PropType<CardFooterButton[]>,
  footerNoteLayout: String as PropType<CardFooterNoteLayout>, // center | split | left
  footerNoteLeft: String,
  footerNoteRight: String,
  footerNote: String,
  // --- 图文卡 ---
  image: String,
  imageFit: makeStringProp<ImageFit>('cover'), // 默认撑满图片区域
  imageRatio: makeNumberProp(0.5), // 大图高度 = 宽度 × ratio
  imageTitleRows: makeTextRowsProp(2), // image-right 标题行数；auto 为全展示
};

export type CardProps = ExtractPropTypes<typeof cardProps>;

export default defineComponent({
  name,

  props: cardProps,

  emits: [
    'clickTitle',
    'clickButton',
    'clickContentAction',
    'update:selected',
    'select',
  ],

  setup(props, { slots, emit }) {
    // 是否是图文卡
    const isImageType = computed(() =>
      ['image-large', 'image-double', 'image-right'].includes(props.type),
    );

    // 标题 props 聚合，供 CardTitle 复用
    const titleProps = computed(() => ({
      show: props.showTitle,
      title: props.title,
      subtitle: props.subtitle,
      titleRows: props.titleRows,
      subtitleRows: props.subtitleRows,
      avatar: props.avatar,
      avatarSize: props.avatarSize,
      statusTagProps: props.statusTagProps,
      isLink: props.isLink,
      badge: props.badge,
      badgeMax: props.badgeMax,
      badgeDot: props.badgeDot,
      tags: props.tags,
      selectable: props.selectable,
      selected: props.selected,
      selectDisabled: props.selectDisabled,
    }));

    // 统一抛出选中变化事件
    const onSelectChange = (value: boolean) => {
      emit('update:selected', value);
      emit('select', value);
    };

    // selectable：整卡点击切换选中，交互控件与 link 箭头不参与
    const onClickCard = (event: MouseEvent) => {
      if (!props.selectable || props.selectDisabled) {
        return;
      }
      if (shouldIgnoreSelectToggle(event.target)) {
        return;
      }
      onSelectChange(!props.selected);
    };

    // 渲染勾选框。标题区和内容区共用。
    const renderSelect = (placement: 'title' | 'body') => {
      if (!props.selectable) return null;

      return (
        <div class={bem('select', placement)}>
          <Checkbox
            shape="square"
            modelValue={props.selected}
            disabled={props.selectDisabled}
            onUpdate:modelValue={onSelectChange}
          />
        </div>
      );
    };

    const showSelectInBody = computed(
      () => props.selectable && !props.showTitle,
    );

    // 没有标题时，箭头放在内容区
    const showLinkInBody = computed(() => {
      if (!props.isLink || props.showTitle) {
        return false;
      }
      if (slots.default) {
        return !isEmptySlotContent(slots.default());
      }
      return !!(
        props.contentType === 'text-list' && props.contentItems?.length
      );
    });

    // 内容优先用 default 插槽
    // 没有插槽时再走 text-list
    const resolveBodyContent = () => {
      if (slots.default) {
        const content = slots.default();
        if (isEmptySlotContent(content)) {
          return null;
        }
        return content;
      }

      if (props.contentType === 'text-list' && props.contentItems?.length) {
        return (
          <CardTextList
            items={props.contentItems}
            collapsible={props.collapsible}
            collapseRows={props.collapseRows}
            expandText={props.expandText}
            collapseText={props.collapseText}
            onClickContentAction={(payload) =>
              emit('clickContentAction', payload)
            }
            v-slots={pickTextListSlots(slots)}
          />
        );
      }

      return null;
    };

    const onClickBodyLink = (event: MouseEvent) => {
      event.stopPropagation();
      emit('clickTitle', event);
    };

    const renderBodyLink = () => {
      if (!showLinkInBody.value) {
        return null;
      }

      return (
        <div class={bem('body-link-wrap')} onClick={onClickBodyLink}>
          <Icon name="arrow" class={bem('body-link')} />
        </div>
      );
    };

    const renderBody = () => {
      const content = resolveBodyContent();
      // 无内容不渲染 body
      if (!content) {
        return null;
      }

      const bodyCls = bem('body', {
        selectable: showSelectInBody.value,
        link: showLinkInBody.value,
      });

      return (
        <div class={bodyCls}>
          {showSelectInBody.value && (
            <div class={bem('select-col')}>{renderSelect('body')}</div>
          )}
          {showSelectInBody.value ? (
            <div class={bem('body-inner')}>{content}</div>
          ) : (
            content
          )}
          {renderBodyLink()}
        </div>
      );
    };

    // 图文卡底部注释不需要上边线
    const renderFooter = (plainNote?: boolean) => (
      <CardFooter
        showButtons={props.showFooterButtons}
        buttonType={props.footerButtonType}
        buttons={props.footerButtons}
        noteLayout={props.footerNoteLayout}
        noteLeft={props.footerNoteLeft}
        noteRight={props.footerNoteRight}
        note={props.footerNote}
        plainNote={plainNote}
        onClickButton={(payload) => emit('clickButton', payload)}
        v-slots={{
          buttons: slots.buttons,
          'footer-note': slots['footer-note'],
        }}
      />
    );
    // 图文卡标题区域
    const renderImageHeader = () => {
      // 无图片内容时跳过头图
      if (!props.image && !slots.image) return null;

      const ratio = props.imageRatio;

      // 左文右图用单独头部布局
      if (props.type === 'image-right') {
        const rows = normalizeTextRows(
          props.imageTitleRows ?? props.titleRows,
          2,
        );
        const cls = getEllipsisClass(rows);
        const style = getLineClampStyle(rows);

        return (
          <div
            class={bem('image-right-header', {
              selectable: props.selectable && props.showTitle,
            })}
          >
            <div class={bem('image-right-text-wrap')}>
              {props.selectable && props.showTitle && renderSelect('title')}
              <div class={[bem('image-right-text'), cls]} style={style}>
                {slots.title ? slots.title() : props.title}
              </div>
            </div>
            <div class={bem('image-right-thumb')}>
              {slots.image ? (
                slots.image()
              ) : (
                <Image
                  src={props.image}
                  fit={props.imageFit}
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          </div>
        );
      }

      // 其余图文卡：顶部通栏图
      // 用 padding-bottom 维护比例
      return (
        <div class={bem('image-header', props.type)}>
          <div
            class={bem('image-wrap')}
            style={{ paddingBottom: `${ratio * 100}%` }}
          >
            <div class={bem('image-inner')}>
              {slots.image ? (
                slots.image()
              ) : (
                <Image
                  src={props.image}
                  fit={props.imageFit}
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderImageCardTitle = () => {
      // image-right 的标题已在头部渲染
      if (props.type === 'image-right') return null;

      return (
        <div class={bem('image-title')}>
          <CardTitle
            {...titleProps.value}
            show={props.showTitle}
            onClickTitle={(event: MouseEvent) => emit('clickTitle', event)}
            onUpdate:selected={onSelectChange}
            v-slots={{
              title: slots.title,
              subtitle: slots.subtitle,
              tags: slots.tags,
              avatar: slots.avatar,
              'title-action': slots['title-action'],
              'status-tag': slots['status-tag'],
            }}
          />
        </div>
      );
    };

    // 基础卡
    const renderDefaultCard = () => (
      <>
        <CardTitle
          {...titleProps.value}
          onClickTitle={(event: MouseEvent) => emit('clickTitle', event)}
          onUpdate:selected={onSelectChange}
          v-slots={{
            title: slots.title,
            subtitle: slots.subtitle,
            tags: slots.tags,
            avatar: slots.avatar,
            'title-action': slots['title-action'],
            'status-tag': slots['status-tag'],
          }}
        />
        {renderBody()}
        {renderFooter()}
      </>
    );

    // 图文卡结构
    const renderImageCard = () => (
      <>
        {renderImageHeader()}
        {props.type !== 'image-right' && renderImageCardTitle()}
        {renderBody()}
        {renderFooter(isImageType.value)}
      </>
    );

    return () => {
      // 用于控制 no-body 样式
      const hasBody = resolveBodyContent() != null;

      return (
        <div
          class={bem({
            [props.type]: true,
            'no-body': !hasBody,
            selectable: props.selectable,
          })}
          onClick={onClickCard}
        >
          {isImageType.value ? renderImageCard() : renderDefaultCard()}
        </div>
      );
    };
  },
});
