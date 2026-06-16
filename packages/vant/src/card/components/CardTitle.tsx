import { defineComponent, type PropType, type ExtractPropTypes } from 'vue';

import { isDef, numericProp, truthProp, createNamespace } from '../../utils';
import { Tag } from '../../tag';
import { Icon } from '../../icon';
import { Image } from '../../image';
import { Badge } from '../../badge';
import { Checkbox } from '../../checkbox';
import type {
  CardAvatarSize,
  CardStatusTagProps,
  CardTagOption,
} from '../card-types';
import {
  getEllipsisClass,
  getLineClampStyle,
  makeTextRowsProp,
  normalizeTextRows,
} from '../utils';

const [name, bem] = createNamespace('card');

export const cardTitleProps = {
  show: truthProp,
  title: String,
  subtitle: String,
  titleRows: makeTextRowsProp(2),
  subtitleRows: makeTextRowsProp(1),
  avatar: String,
  avatarSize: String as PropType<CardAvatarSize>,
  statusTagProps: Object as PropType<CardStatusTagProps>,
  isLink: Boolean,
  badge: numericProp,
  badgeMax: numericProp,
  badgeDot: Boolean,
  tags: Array as PropType<CardTagOption[]>,
  selectable: Boolean,
  selected: Boolean,
  selectDisabled: Boolean,
};

export type CardTitleProps = ExtractPropTypes<typeof cardTitleProps>;

export default defineComponent({
  name,

  props: cardTitleProps,

  emits: ['clickTitle', 'update:selected', 'select'],

  setup(props, { slots, emit }) {
    // 右侧是否需要预留区域
    const hasTitleExtra = () =>
      !!(
        props.isLink ||
        isDef(props.badge) ||
        props.badgeDot ||
        slots['title-action']
      );

    const hasStatusTag = () => !!(props.statusTagProps || slots['status-tag']);

    // 仅 link 箭头触发 click-title
    const onClickLink = (event: MouseEvent) => {
      event.stopPropagation();
      if (props.isLink) {
        emit('clickTitle', event);
      }
    };

    // 右上角状态角标
    const renderStatusTag = () => {
      if (!hasStatusTag()) return null;

      const tagProps = { mark: true, ...props.statusTagProps };

      return (
        <div class={bem('status-tag')}>
          <Tag {...tagProps}>
            {slots['status-tag']?.() ?? props.statusTagProps?.text}
          </Tag>
        </div>
      );
    };

    const renderAvatar = () => {
      // 优先使用 avatar 插槽
      if (slots.avatar) {
        return (
          <div class={bem('avatar', props.avatarSize)}>{slots.avatar()}</div>
        );
      }
      if (props.avatar) {
        return (
          <div class={bem('avatar', props.avatarSize)}>
            <Image
              src={props.avatar}
              fit="cover"
              round
              width="100%"
              height="100%"
            />
          </div>
        );
      }
    };

    const renderTitleText = () => {
      // 优先使用 title 插槽
      if (slots.title) return slots.title();
      if (!props.title) return null;

      const rows = normalizeTextRows(props.titleRows, 2);
      // 1~3 行：全局省略类（van-ellipsis / van-multi-ellipsis--l2|l3）
      const cls = getEllipsisClass(rows);
      // 4 行及以上：全局类未预置，用 -webkit-line-clamp 内联样式
      const style = getLineClampStyle(rows);

      return (
        <div class={[bem('title-text'), cls]} style={style}>
          {props.title}
        </div>
      );
    };

    const renderSubtitle = () => {
      // 优先使用 subtitle 插槽
      if (slots.subtitle) return slots.subtitle();
      if (!props.subtitle) return null;

      const rows = normalizeTextRows(props.subtitleRows, 1);
      const cls = getEllipsisClass(rows);
      const style = getLineClampStyle(rows);

      return (
        <div class={[bem('subtitle'), cls]} style={style}>
          {props.subtitle}
        </div>
      );
    };

    const renderTags = () => {
      // tags 插槽优先于 props.tags
      if (slots.tags) {
        return <div class={bem('tags')}>{slots.tags()}</div>;
      }
      if (!props.tags?.length) return null;

      return (
        <div class={bem('tags')}>
          {props.tags.map((tag, index) => (
            <Tag
              key={index}
              type={tag.type}
              plain={tag.plain}
              round={tag.round}
              color={tag.color}
              class={bem('tag-item')}
            >
              {tag.text}
            </Tag>
          ))}
        </div>
      );
    };

    const renderTitleBadge = () => {
      // dot 或 badge 有值才显示
      const showBadge =
        props.badgeDot || (isDef(props.badge) && props.badge !== '');
      if (!showBadge) return null;

      return (
        <div class={bem('title-badge')}>
          <Badge
            dot={props.badgeDot}
            content={props.badge}
            max={props.badgeMax}
            color="var(--van-card-badge-background)"
          />
        </div>
      );
    };

    const renderSelect = () => {
      if (!props.selectable) return null;

      return (
        <div class={bem('select', 'title')}>
          <Checkbox
            shape="square"
            modelValue={props.selected}
            disabled={props.selectDisabled}
            onUpdate:modelValue={(value: boolean) => {
              // 透传给父组件统一处理
              emit('update:selected', value);
              emit('select', value);
            }}
          />
        </div>
      );
    };

    const renderTitleExtra = () => {
      // 右侧扩展区：自定义 action + 箭头
      const showAction = !!slots['title-action'];
      const showLink = props.isLink;

      if (!showAction && !showLink) {
        return null;
      }

      return (
        <div class={bem('title-extra')}>
          {showAction && (
            <div class={bem('title-action-wrap')}>
              <div class={bem('title-action')}>{slots['title-action']!()}</div>
            </div>
          )}
          {showLink && (
            <div class={bem('title-link-wrap')} onClick={onClickLink}>
              <Icon name="arrow" class={bem('title-link')} />
            </div>
          )}
        </div>
      );
    };

    return () => {
      // show=false 时不渲染标题区
      if (!props.show) return null;

      const avatar = renderAvatar();
      const largeAvatar = props.avatarSize === 'large' && avatar;

      return (
        <div
          class={bem('title', {
            'has-extra': hasTitleExtra(),
            'has-avatar': !!avatar,
            'avatar-large': largeAvatar, // 大头像用双栏布局
            selectable: props.selectable,
          })}
        >
          {renderStatusTag()}
          <div class={bem('title-inner')}>
            {renderSelect()}
            {avatar}
            <div
              class={bem('title-content', {
                'has-extra': hasTitleExtra(),
              })}
            >
              {renderTitleText()}
              {renderSubtitle()}
              {renderTags()}
            </div>
            {renderTitleBadge()}
            {renderTitleExtra()}
          </div>
        </div>
      );
    };
  },
});
