import { Tag } from '..';
import { mount } from '../../../test';

test('should emit close event when clicking the close icon', () => {
  const wrapper = mount(Tag, {
    props: {
      closeable: true,
    },
  });

  wrapper.find('.van-tag__close').trigger('click');
  expect(wrapper.emitted('close')).toHaveLength(1);
});

test('should hide tag when the show prop is false', () => {
  const wrapper = mount(Tag, {
    props: {
      show: false,
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should not trigger click event when clicking the close icon', () => {
  const onClick = rs.fn();
  const wrapper = mount(Tag, {
    props: {
      onClick,
      closeable: true,
    },
  });

  wrapper.find('.van-tag__close').trigger('click');
  expect(onClick).toHaveBeenCalledTimes(0);

  wrapper.trigger('click');
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('should render border-color correctly', () => {
  const wrapper = mount(Tag, {
    props: {
      plain: true,
      color: 'red',
      textColor: 'blue',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should render info type', () => {
  const wrapper = mount(Tag, {
    props: {
      type: 'info',
    },
  });

  expect(wrapper.find('.van-tag').classes()).toContain('van-tag--info');
});

test('should render left icon', () => {
  const wrapper = mount(Tag, {
    props: {
      icon: 'search',
    },
  });

  expect(wrapper.find('.van-tag__icon').exists()).toBeTruthy();
});

test('should render currency tag', () => {
  const wrapper = mount(Tag, {
    props: {
      currency: true,
    },
  });

  expect(wrapper.find('.van-tag').classes()).toContain('van-tag--currency');
});

test('should render currency tag preset by currency-code', () => {
  const wrapper = mount(Tag, {
    props: {
      currency: true,
      currencyCode: 'usd',
    },
  });

  expect(wrapper.find('.van-tag').classes()).toContain('van-tag--currency');
  expect(wrapper.text()).toContain('美元');
  expect(wrapper.find('.van-icon').exists()).toBeTruthy();
});

test('should render preset tag', () => {
  const wrapper = mount(Tag, {
    props: {
      preset: 'risk-medium',
    },
  });

  expect(wrapper.find('.van-tag').classes()).toContain(
    'van-tag--preset-risk-medium',
  );
});

test('should wrap stamp text after five characters with four on first line', () => {
  const wrapper = mount(Tag, {
    props: { stampType: 'success' },
    slots: { default: () => '一二三四五六' },
  });

  const lines = wrapper.findAll('.van-tag__stamp-text-line');
  expect(lines).toHaveLength(2);
  expect(lines[0].text()).toBe('一二三四');
  expect(lines[1].text()).toBe('五六');
  expect(wrapper.find('.van-tag__stamp-text').classes()).toContain(
    'van-tag__stamp-text--wrap-s',
  );
});

test('should keep seven characters on two lines without ellipsis', () => {
  const wrapper = mount(Tag, {
    props: { stampType: 'success' },
    slots: { default: () => '一二三四五六七' },
  });

  const lines = wrapper.findAll('.van-tag__stamp-text-line');
  expect(lines).toHaveLength(2);
  expect(lines[0].text()).toBe('一二三四');
  expect(lines[1].text()).toBe('五六七');
  expect(wrapper.find('.van-tag__stamp-text').classes()).toContain(
    'van-tag__stamp-text--wrap-m',
  );
  expect(lines[1].text()).not.toContain('…');
});

test('should render stamp tag', () => {
  const wrapper = mount(Tag, {
    props: {
      stampType: 'success',
    },
    slots: {
      default: () => '已通过',
    },
  });

  const tag = wrapper.find('.van-tag');
  expect(tag.classes()).toContain('van-tag--stamp');
  expect(tag.classes()).toContain('van-tag--stamp-success');
  expect(wrapper.find('.van-tag__stamp-frame').exists()).toBeTruthy();
  expect(wrapper.find('.van-tag__stamp-text').text()).toBe('已通过');
});

test('should render mark tag with plain', () => {
  const wrapper = mount(Tag, {
    props: {
      mark: true,
      plain: true,
      type: 'success',
    },
  });

  const tag = wrapper.find('.van-tag');
  expect(tag.classes()).toContain('van-tag--mark');
  expect(tag.classes()).toContain('van-tag--plain');
});
