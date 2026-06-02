import { Avatar } from '..';
import { mount } from '../../../test';

test('should render img when src is set', () => {
  const wrapper = mount(Avatar, {
    props: {
      src: 'https://example.com/a.png',
      alt: 'x',
    },
  });
  expect(wrapper.find('.van-avatar__img').attributes('src')).toBe(
    'https://example.com/a.png',
  );
});

test('should render text when type is text', () => {
  const wrapper = mount(Avatar, {
    props: {
      type: 'text',
      text: '张',
    },
  });
  expect(wrapper.find('.van-avatar__text').text()).toBe('张');
  expect(wrapper.classes()).toContain('van-avatar--text');
});

test('should truncate text avatar to 3 characters', () => {
  const wrapper = mount(Avatar, {
    props: {
      type: 'text',
      text: '张三丰四',
    },
  });
  expect(wrapper.find('.van-avatar__text').text()).toBe('张三丰');
});

test('should match snapshot for default type', () => {
  const wrapper = mount(Avatar, {
    props: { type: 'default', size: 'small' },
  });
  expect(wrapper.html()).toMatchSnapshot();
});
