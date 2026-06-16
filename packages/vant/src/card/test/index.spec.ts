import { h } from 'vue';
import { Card } from '..';
import { mount } from '../../../test';

test('should not render body wrapper when there is no content', () => {
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      subtitle: 'Subtitle',
    },
  });

  expect(wrapper.find('.van-card__body').exists()).toBe(false);
  expect(wrapper.classes()).toContain('van-card--no-body');
});

test('should render default business card', () => {
  const wrapper = mount(Card, {
    props: {
      type: 'default',
      title: 'Title',
      subtitle: 'Subtitle',
    },
  });

  expect(wrapper.find('.van-card__title-text').text()).toBe('Title');
  expect(wrapper.find('.van-card__subtitle').text()).toBe('Subtitle');
});

test('should emit click-title when is-link', () => {
  const onClickTitle = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      isLink: true,
      onClickTitle,
    },
  });

  wrapper.find('.van-card__title-link-wrap').trigger('click');
  expect(onClickTitle).toHaveBeenCalledTimes(1);
});

test('should not emit click-title when click title content', () => {
  const onClickTitle = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      isLink: true,
      onClickTitle,
    },
  });

  wrapper.find('.van-card__title-text').trigger('click');
  expect(onClickTitle).not.toHaveBeenCalled();
});

test('should render body link when is-link without title', () => {
  const wrapper = mount(Card, {
    props: {
      showTitle: false,
      isLink: true,
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1' }],
    },
  });

  expect(wrapper.find('.van-card__body--link').exists()).toBe(true);
  expect(wrapper.find('.van-card__body-link-wrap').exists()).toBe(true);
  expect(wrapper.find('.van-card__title').exists()).toBe(false);
});

test('should emit click-title when click body link icon', () => {
  const onClickTitle = rs.fn();
  const wrapper = mount(Card, {
    props: {
      showTitle: false,
      isLink: true,
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1' }],
      onClickTitle,
    },
  });

  wrapper.find('.van-card__body-link-wrap').trigger('click');
  expect(onClickTitle).toHaveBeenCalledTimes(1);
});

test('should not emit click-title when click body content', () => {
  const onClickTitle = rs.fn();
  const wrapper = mount(Card, {
    props: {
      showTitle: false,
      isLink: true,
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1' }],
      onClickTitle,
    },
  });

  wrapper.find('.van-card__text-list-label').trigger('click');
  expect(onClickTitle).not.toHaveBeenCalled();
});

test('should not emit click-title when click text-list button on body link', () => {
  const onClickTitle = rs.fn();
  const onClickContentAction = rs.fn();
  const wrapper = mount(Card, {
    props: {
      showTitle: false,
      isLink: true,
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1', buttonText: 'Action' }],
      onClickTitle,
      onClickContentAction,
    },
  });

  wrapper.find('.van-card__text-list-btn').trigger('click');
  expect(onClickContentAction).toHaveBeenCalledTimes(1);
  expect(onClickTitle).not.toHaveBeenCalled();
});

test('should not emit click-title when click text-list action on body link', () => {
  const onClickTitle = rs.fn();
  const onClickContentAction = rs.fn();
  const wrapper = mount(Card, {
    props: {
      showTitle: false,
      isLink: true,
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1' }],
      onClickTitle,
      onClickContentAction,
    },
    slots: {
      'text-list-action-0': ({
        onActionClick,
      }: {
        onActionClick: () => void;
      }) =>
        h('button', { class: 'action-trigger', onClick: onActionClick }, 'Go'),
    },
  });

  wrapper.find('.action-trigger').trigger('click');
  expect(onClickContentAction).toHaveBeenCalledTimes(1);
  expect(onClickTitle).not.toHaveBeenCalled();
});

test('should emit click-title when click title link icon', () => {
  const onClickTitle = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      isLink: true,
      onClickTitle,
    },
  });

  wrapper.find('.van-card__title-link-wrap').trigger('click');
  expect(onClickTitle).toHaveBeenCalledTimes(1);
});

test('should toggle selected but not click-title when click selectable card with is-link', async () => {
  const onClickTitle = rs.fn();
  const onUpdateSelected = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      isLink: true,
      selectable: true,
      selected: false,
      onClickTitle,
      'onUpdate:selected': onUpdateSelected,
    },
  });

  await wrapper.find('.van-card__title-text').trigger('click');
  expect(onUpdateSelected).toHaveBeenCalledWith(true);
  expect(onClickTitle).not.toHaveBeenCalled();
});

test('should emit click-title but not toggle selected when click link on selectable card', async () => {
  const onClickTitle = rs.fn();
  const onUpdateSelected = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      isLink: true,
      selectable: true,
      selected: false,
      onClickTitle,
      'onUpdate:selected': onUpdateSelected,
    },
  });

  await wrapper.find('.van-card__title-link-wrap').trigger('click');
  expect(onClickTitle).toHaveBeenCalledTimes(1);
  expect(onUpdateSelected).not.toHaveBeenCalled();
});

test('should not emit click-title when click title-action', () => {
  const onClickTitle = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      isLink: true,
      onClickTitle,
    },
    slots: {
      'title-action': () =>
        h('button', { class: 'title-action-btn' }, 'Manage'),
    },
  });

  wrapper.find('.title-action-btn').trigger('click');
  expect(onClickTitle).not.toHaveBeenCalled();
});

test('should render text-list content', () => {
  const wrapper = mount(Card, {
    props: {
      contentType: 'text-list',
      contentItems: [
        { label: 'Label', value: 'Value' },
        { label: 'Label2', value: 'Value2' },
      ],
    },
  });

  expect(wrapper.findAll('.van-card__text-list-row')).toHaveLength(2);
});

test('should render text-list value without ellipsis when valueRows is auto', () => {
  const wrapper = mount(Card, {
    props: {
      contentType: 'text-list',
      contentItems: [
        {
          label: 'Label',
          value: 'Long value',
          valueRows: 'auto',
        },
      ],
    },
  });

  const value = wrapper.find('.van-card__text-list-value');

  expect(value.classes()).not.toContain('van-ellipsis');
  expect(value.classes()).not.toContain('van-multi-ellipsis--l2');
  expect(value.attributes('style')).toBeUndefined();
});

test('should collapse text-list rows', async () => {
  const wrapper = mount(Card, {
    props: {
      contentType: 'text-list',
      collapsible: true,
      collapseRows: 1,
      contentItems: [
        { label: 'A', value: '1' },
        { label: 'B', value: '2' },
      ],
    },
  });

  expect(wrapper.findAll('.van-card__text-list-row')).toHaveLength(1);
  await wrapper.find('.van-card__collapse-toggle').trigger('click');
  expect(wrapper.findAll('.van-card__text-list-row')).toHaveLength(2);
});

test('should render per-row text-list action slot', () => {
  const wrapper = mount(Card, {
    props: {
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1', actionSlot: 'custom' }],
    },
    slots: {
      'text-list-action-custom': () => 'Custom Action',
    },
  });

  expect(wrapper.find('.van-card__text-list-action').text()).toBe(
    'Custom Action',
  );
});

test('should emit click-content-action from slot onActionClick', () => {
  const onClickContentAction = rs.fn();
  const wrapper = mount(Card, {
    props: {
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1' }],
      onClickContentAction,
    },
    slots: {
      'text-list-action-0': ({
        onActionClick,
      }: {
        onActionClick: () => void;
      }) =>
        h('span', { class: 'action-trigger', onClick: onActionClick }, 'Go'),
    },
  });

  wrapper.find('.action-trigger').trigger('click');
  expect(onClickContentAction).toHaveBeenCalled();
});

test('should render footer buttons and emit click-button', () => {
  const onClickButton = rs.fn();
  const wrapper = mount(Card, {
    props: {
      showFooterButtons: true,
      footerButtons: [{ text: 'Btn', name: 'ok' }],
      onClickButton,
    },
  });

  wrapper.find('.van-card__footer-btn').trigger('click');
  expect(onClickButton).toHaveBeenCalled();
});

test('should apply custom color to footer buttons', () => {
  const wrapper = mount(Card, {
    props: {
      showFooterButtons: true,
      footerButtonType: 'outline',
      footerButtons: [
        { text: 'A', color: '#07c160' },
        { text: 'B', color: '#ee0a24' },
      ],
    },
  });

  const buttons = wrapper.findAll('.van-card__footer-btn');
  expect(buttons[0].attributes('style')).toContain('#07c160');
  expect(buttons[1].attributes('style')).toContain('#ee0a24');
});

test('should apply text color only for text footer buttons', () => {
  const wrapper = mount(Card, {
    props: {
      showFooterButtons: true,
      footerButtonType: 'text',
      footerButtons: [{ text: 'A', color: '#1989fa' }],
    },
  });

  const style = wrapper.find('.van-card__footer-btn').attributes('style') || '';
  expect(style).toMatch(/1989fa|25,\s*137,\s*250/);
  expect(style).not.toContain('border-color');
});

test('should wrap text footer buttons to three per row', () => {
  const wrapper = mount(Card, {
    props: {
      showFooterButtons: true,
      footerButtonType: 'text',
      footerButtons: [
        { text: '1' },
        { text: '2' },
        { text: '3' },
        { text: '4' },
      ],
    },
  });

  expect(wrapper.findAll('.van-card__footer-button-row')).toHaveLength(2);
  expect(
    wrapper
      .findAll('.van-card__footer-button-row')[0]
      .findAll('.van-card__footer-btn'),
  ).toHaveLength(3);
  expect(
    wrapper
      .findAll('.van-card__footer-button-row')[1]
      .findAll('.van-card__footer-btn'),
  ).toHaveLength(1);
});

test('should render image-large card', () => {
  const wrapper = mount(Card, {
    props: {
      type: 'image-large',
      image: 'https://example.com/a.png',
      title: 'Image Title',
    },
  });

  expect(wrapper.classes()).toContain('van-card--image-large');
  expect(wrapper.find('.van-card__image-header').exists()).toBeTruthy();
});

test('should support custom image fit for image cards', () => {
  const wrapper = mount(Card, {
    props: {
      type: 'image-large',
      image: 'https://example.com/a.png',
      imageFit: 'contain',
    },
  });

  const image = wrapper.find('.van-card__image-inner img');
  expect(image.attributes('style')).toContain('object-fit: contain');
});

test('should render title texts without ellipsis when rows is auto', () => {
  const wrapper = mount(Card, {
    props: {
      title: 'Long title',
      subtitle: 'Long subtitle',
      titleRows: 'auto',
      subtitleRows: 'auto',
    },
  });

  const title = wrapper.find('.van-card__title-text');
  const subtitle = wrapper.find('.van-card__subtitle');

  expect(title.classes()).not.toContain('van-multi-ellipsis--l2');
  expect(title.attributes('style')).toBeUndefined();
  expect(subtitle.classes()).not.toContain('van-ellipsis');
  expect(subtitle.attributes('style')).toBeUndefined();
});

test('should render image-right title without ellipsis when imageTitleRows is auto', () => {
  const wrapper = mount(Card, {
    props: {
      type: 'image-right',
      image: 'x',
      title: 'Long image title',
      imageTitleRows: 'auto',
    },
  });

  const title = wrapper.find('.van-card__image-right-text');

  expect(title.classes()).not.toContain('van-multi-ellipsis--l2');
  expect(title.attributes('style')).toBeUndefined();
});

test('should render image-right title ellipsis class by imageTitleRows', () => {
  const wrapper = mount(Card, {
    props: {
      type: 'image-right',
      image: 'x',
      title: 'Long image title',
      imageTitleRows: 1,
    },
  });

  const title = wrapper.find('.van-card__image-right-text');

  expect(title.classes()).toContain('van-ellipsis');
  expect(title.classes()).not.toContain(
    'van-card__image-right-text--van-ellipsis',
  );
});

test('should render image-double with flex layout class', () => {
  const wrapper = mount(Card, {
    props: {
      type: 'image-double',
      image: 'x',
      title: 'T',
    },
  });

  expect(wrapper.classes()).toContain('van-card--image-double');
});

test('should render image card footer without top border', () => {
  const wrapper = mount(Card, {
    props: {
      type: 'image-large',
      image: 'x',
      title: 'T',
      footerNoteLayout: 'split',
      footerNoteLeft: 'L',
      footerNoteRight: 'R',
    },
  });

  expect(wrapper.find('.van-card__footer-note--no-border').exists()).toBe(true);
});

test('should render status tag slot', () => {
  const wrapper = mount(Card, {
    props: {
      title: 'T',
      statusTagProps: { type: 'primary' },
    },
    slots: {
      'status-tag': () => 'Hot',
    },
  });

  expect(wrapper.find('.van-card__status-tag').exists()).toBeTruthy();
});

test('should render selectable checkbox in title area', () => {
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      selectable: true,
    },
  });

  expect(wrapper.classes()).toContain('van-card--selectable');
  expect(
    wrapper.find('.van-card__title .van-card__select').exists(),
  ).toBeTruthy();
  expect(wrapper.find('.van-card__body--selectable').exists()).toBe(false);
});

test('should render selectable checkbox in body when no title', () => {
  const wrapper = mount(Card, {
    props: {
      showTitle: false,
      selectable: true,
      contentType: 'text-list',
      contentItems: [{ label: 'A', value: '1' }],
    },
  });

  expect(wrapper.find('.van-card__body--selectable').exists()).toBeTruthy();
  expect(
    wrapper.find('.van-card__body .van-card__select').exists(),
  ).toBeTruthy();
  expect(wrapper.find('.van-card__title').exists()).toBe(false);
});

test('should emit update:selected when toggle checkbox', async () => {
  const onUpdateSelected = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      selectable: true,
      selected: false,
      'onUpdate:selected': onUpdateSelected,
    },
  });

  await wrapper.find('.van-checkbox').trigger('click');
  expect(onUpdateSelected).toHaveBeenCalled();
});

test('should toggle selected when click selectable card', async () => {
  const onUpdateSelected = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      subtitle: 'Sub',
      selectable: true,
      selected: false,
      'onUpdate:selected': onUpdateSelected,
    },
  });

  await wrapper.find('.van-card__title-content').trigger('click');
  expect(onUpdateSelected).toHaveBeenCalledWith(true);
});

test('should not toggle selected when click footer button on selectable card', async () => {
  const onUpdateSelected = rs.fn();
  const wrapper = mount(Card, {
    props: {
      title: 'Title',
      selectable: true,
      selected: false,
      showFooterButtons: true,
      footerButtons: [{ text: 'Btn' }],
      'onUpdate:selected': onUpdateSelected,
    },
  });

  await wrapper.find('.van-card__footer-btn').trigger('click');
  expect(onUpdateSelected).not.toHaveBeenCalled();
});
