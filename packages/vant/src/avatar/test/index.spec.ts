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
  expect(wrapper.find('.van-avatar__text').text()).toBe('张三...');
});

test('should support custom size', () => {
  const wrapper = mount(Avatar, {
    props: {
      type: 'default',
      size: 48,
    },
  });
  expect(wrapper.attributes('style')).toContain('width: 48px');
  expect(wrapper.attributes('style')).toContain('height: 48px');
  expect(wrapper.classes()).not.toContain('van-avatar--large');
});

test('should support custom font size for text avatar', () => {
  const wrapper = mount(Avatar, {
    props: {
      type: 'text',
      text: '张',
      fontSize: 14,
    },
  });
  expect(wrapper.find('.van-avatar__text').attributes('style')).toContain(
    'font-size: 14px',
  );
});

test('should match snapshot for default type', () => {
  const wrapper = mount(Avatar, {
    props: { type: 'default', size: 'small' },
  });
  expect(wrapper.html()).toMatchSnapshot();
});
