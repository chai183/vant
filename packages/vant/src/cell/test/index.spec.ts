import { Cell } from '..';
import { mount } from '../../../test';

test('should render value slot correctly', () => {
  const wrapper = mount(Cell, {
    slots: {
      value: () => 'Custom Value',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render title slot correctly', () => {
  const wrapper = mount(Cell, {
    slots: {
      title: () => 'Custom Title',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render array title correctly', () => {
  const wrapper = mount(Cell, {
    props: {
      title: ['Main Title', 'Sub Title'],
      value: 'Content',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should highlight title, value and label when using highlight prop', () => {
  const wrapper = mount(Cell, {
    props: {
      title: 'Keyword title',
      value: 'Keyword value',
      label: 'Keyword label',
      highlight: ['Keyword'],
    },
  });

  const tags = wrapper.findAll('.van-cell__highlight');

  expect(tags).toHaveLength(3);
  expect(tags.map((tag) => tag.text())).toEqual([
    'Keyword',
    'Keyword',
    'Keyword',
  ]);
  expect(wrapper.text()).toContain('Keyword title');
  expect(wrapper.text()).toContain('Keyword value');
  expect(wrapper.text()).toContain('Keyword label');
});

test('should highlight array title when using highlight prop', () => {
  const wrapper = mount(Cell, {
    props: {
      title: ['Main Title', 'Sub Title'],
      highlight: ['Title'],
    },
  });

  const tags = wrapper.findAll('.van-cell__title-text .van-cell__highlight');

  expect(tags).toHaveLength(2);
  expect(tags.map((tag) => tag.text())).toEqual(['Title', 'Title']);
});

test('should pass highlightProps to Highlight component', () => {
  const wrapper = mount(Cell, {
    props: {
      title: 'Keyword keyword',
      highlight: ['keyword'],
      highlightProps: {
        caseSensitive: true,
        highlightClass: 'custom-highlight',
        unhighlightClass: 'custom-unhighlight',
      },
    },
  });

  const tags = wrapper.findAll('.van-cell__highlight');

  expect(tags).toHaveLength(1);
  expect(tags[0].classes()).toContain('custom-highlight');
  expect(tags[0].text()).toBe('keyword');
  expect(wrapper.find('.custom-unhighlight').text()).toBe('Keyword');
});

test('should render label slot correctly', () => {
  const wrapper = mount(Cell, {
    props: {
      title: 'Title',
    },
    slots: {
      label: () => 'Custom Label',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render icon slot correctly', () => {
  const wrapper = mount(Cell, {
    slots: {
      icon: () => 'Custom Icon',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render left avatar when using avatar prop', () => {
  const wrapper = mount(Cell, {
    props: {
      title: 'Title',
      avatar: {
        type: 'text',
        text: 'A',
        size: 'small',
      },
    },
  });

  expect(wrapper.find('.van-cell__left-avatar').exists()).toBeTruthy();
  expect(wrapper.find('.van-avatar__text').text()).toBe('A');
});

test('should prefer avatar over icon when both are set', () => {
  const wrapper = mount(Cell, {
    props: {
      title: 'Title',
      icon: 'location-o',
      avatar: {
        type: 'text',
        text: 'A',
        size: 'small',
      },
    },
  });

  expect(wrapper.find('.van-cell__left-avatar').exists()).toBeTruthy();
  expect(wrapper.find('.van-cell__left-icon').exists()).toBeFalsy();
});

test('should render extra slot correctly', () => {
  const wrapper = mount(Cell, {
    slots: {
      extra: () => 'Custom Extra',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should change arrow direction when using arrow-direction prop', () => {
  const wrapper = mount(Cell, {
    props: {
      isLink: true,
      arrowDirection: 'down',
    },
  });

  expect(wrapper.find('.van-cell__right-icon').html()).toMatchSnapshot();
});

test('should change title style when using title-style prop', () => {
  const wrapper = mount(Cell, {
    props: {
      title: 'title',
      titleStyle: {
        color: 'red',
      },
    },
  });

  const title = wrapper.find('.van-cell__title');
  expect(title.style.color).toEqual('red');
});

test('should change icon class prefix when using icon-prefix prop', () => {
  const wrapper = mount(Cell, {
    props: {
      icon: 'success',
      iconPrefix: 'my-icon',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should allow to disable clickable when using is-link prop', () => {
  const wrapper = mount(Cell, {
    props: {
      isLink: true,
      clickable: false,
    },
  });
  expect(wrapper.classes()).not.toContain('van-cell--clickable');
});

test('should render tag prop correctly', () => {
  const wrapper = mount(Cell, {
    props: {
      tag: 'a',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});
