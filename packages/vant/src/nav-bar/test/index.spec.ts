import { NavBar } from '..';
import { HAPTICS_FEEDBACK } from '../../utils';
import { mount, mockGetBoundingClientRect, later } from '../../../test';

test('should render left slot correctly', () => {
  const wrapper = mount(NavBar, {
    slots: {
      left: () => 'Custom Left',
    },
  });

  expect(wrapper.find('.van-nav-bar__left').html()).toMatchSnapshot();
  expect(
    wrapper.find('.van-nav-bar__left').classes(HAPTICS_FEEDBACK),
  ).toBeTruthy();
});

test('should render left slot correctly', () => {
  const wrapper = mount(NavBar, {
    slots: {
      right: () => 'Custom Right',
    },
  });

  expect(wrapper.find('.van-nav-bar__right').html()).toMatchSnapshot();
  expect(
    wrapper.find('.van-nav-bar__right').classes(HAPTICS_FEEDBACK),
  ).toBeTruthy();
});

test('should render title slot correctly', () => {
  const wrapper = mount(NavBar, {
    slots: {
      title: () => 'Custom Title',
    },
  });

  expect(wrapper.find('.van-nav-bar__title').html()).toMatchSnapshot();
});

test('should render placeholder element when using placeholder prop', async () => {
  const restore = mockGetBoundingClientRect({ height: 50 });
  const wrapper = mount(NavBar, {
    props: {
      fixed: true,
      placeholder: true,
    },
  });

  await later();
  expect(wrapper.html()).toMatchSnapshot();
  restore();
});

test('should emit clickLeft event when clicking left text', () => {
  const wrapper = mount(NavBar, {
    props: {
      leftText: 'left',
    },
  });

  wrapper.find('.van-nav-bar__left').trigger('click');
  expect(wrapper.emitted('clickLeft')).toBeTruthy();
});

test('should emit clickRight event when clicking right text', () => {
  const wrapper = mount(NavBar, {
    props: {
      rightText: 'right',
    },
  });

  wrapper.find('.van-nav-bar__right').trigger('click');
  expect(wrapper.find('.van-nav-bar__text').classes()).toContain(
    'van-nav-bar__text--right',
  );
  expect(wrapper.emitted('clickRight')).toBeTruthy();
});

test('should have safe-area-inset-top class when using safe-area-inset-top prop', () => {
  const wrapper = mount(NavBar, {
    props: {
      safeAreaInsetTop: true,
    },
  });

  expect(wrapper.classes()).toContain('van-safe-area-top');
});

test('should change z-index when using z-index prop', () => {
  const wrapper = mount(NavBar, {
    props: {
      zIndex: 100,
    },
  });
  expect((wrapper.element as HTMLElement).style.zIndex).toEqual('100');
});

test('should render slots correctly when set clickable to false', () => {
  const wrapper = mount(NavBar, {
    slots: {
      left: () => 'Custom Left',
      right: () => 'Custom Right',
    },
    props: {
      clickable: false,
    },
  });

  const leftDom = wrapper.find('.van-nav-bar__left');
  const rightDom = wrapper.find('.van-nav-bar__right');
  expect(leftDom.html()).toMatchSnapshot();
  expect(rightDom.html()).toMatchSnapshot();
  expect(leftDom.classes(HAPTICS_FEEDBACK)).toBeFalsy();
  expect(rightDom.classes(HAPTICS_FEEDBACK)).toBeFalsy();
});

test('should render and emit events when using left-buttons prop', async () => {
  const wrapper = mount(NavBar, {
    props: {
      leftButtons: [{}, {}],
    },
  });

  const actions = wrapper.findAll('.van-nav-bar__left .van-nav-bar__action');
  expect(actions).toHaveLength(2);
  expect(actions[0].find('.van-icon-arrow-left').exists()).toBeTruthy();
  expect(actions[1].find('.van-icon-cross').exists()).toBeTruthy();

  await actions[0].trigger('click');
  await actions[1].trigger('click');

  expect(wrapper.emitted('clickLeft')).toHaveLength(1);
  expect(wrapper.emitted('clickLeftButton')).toHaveLength(2);
  expect(wrapper.emitted('clickLeftButton')![1][1]).toBe(1);
});

test('should render at most two positions on each side', () => {
  const wrapper = mount(NavBar, {
    props: {
      leftText: 'Back',
      leftArrow: true,
      leftButtons: [{}, {}],
      rightText: 'More',
      rightButtons: [{ icon: 'search' }, { icon: 'ellipsis' }],
    },
  });

  expect(
    wrapper.findAll('.van-nav-bar__left .van-nav-bar__action'),
  ).toHaveLength(2);
  expect(
    wrapper.findAll('.van-nav-bar__right .van-nav-bar__action'),
  ).toHaveLength(1);
  expect(wrapper.find('.van-nav-bar__right .van-nav-bar__text').exists()).toBe(
    true,
  );
});

test('should render right button menu and emit select event', async () => {
  const menu = [
    { icon: 'search', text: 'Search' },
    { icon: 'cross', text: 'Close' },
  ];

  const wrapper = mount(NavBar, {
    props: {
      rightButtons: [
        {
          icon: 'ellipsis',
          menu,
        },
      ],
    },
  });

  await wrapper
    .find('.van-nav-bar__right .van-nav-bar__action')
    .trigger('click');

  expect(wrapper.classes()).toContain('van-nav-bar--menu-open');
  expect(wrapper.find('.van-nav-bar__menu-arrow').exists()).toBeTruthy();
  expect(wrapper.find('.van-nav-bar__menu').exists()).toBeTruthy();
  expect(wrapper.findAll('.van-nav-bar__menu-item')).toHaveLength(2);

  await wrapper.find('.van-nav-bar__menu-item').trigger('click');

  expect(wrapper.emitted('clickRightButton')).toBeTruthy();
  expect(wrapper.emitted('selectRightMenu')![0][0]).toMatchObject(menu[0]);
  expect(wrapper.find('.van-nav-bar__menu').exists()).toBeFalsy();
});

test('should render search input when using search prop without title', async () => {
  const wrapper = mount(NavBar, {
    props: {
      search: true,
      searchValue: 'foo',
      searchPlaceholder: 'Search',
    },
  });

  const input = wrapper.find('input');
  expect(input.exists()).toBeTruthy();
  expect(input.element.value).toBe('foo');
  expect(input.attributes('placeholder')).toBe('Search');

  await input.setValue('bar');

  expect(wrapper.emitted('update:searchValue')![0]).toEqual(['bar']);

  await wrapper.find('.van-field__left-icon').trigger('click');

  expect(wrapper.emitted('search')![0][0]).toBe('foo');
});

test('should render search input with left and right buttons', () => {
  const wrapper = mount(NavBar, {
    props: {
      search: true,
      leftButtons: [{ icon: 'arrow-left', text: 'Back' }, {}],
      rightButtons: [{ icon: 'search' }, { icon: 'ellipsis' }],
    },
  });

  const title = wrapper.find('.van-nav-bar__title');

  expect(wrapper.find('input').exists()).toBeTruthy();
  expect(title.classes()).toContain('van-nav-bar__title--search');
  expect(title.classes()).toContain('van-nav-bar__title--has-left');
  expect(title.classes()).toContain('van-nav-bar__title--has-right');
  expect(
    wrapper.findAll('.van-nav-bar__left .van-nav-bar__action'),
  ).toHaveLength(2);
  expect(
    wrapper.findAll('.van-nav-bar__right .van-nav-bar__action'),
  ).toHaveLength(2);
});

test('should pass search-props to inner Search component', () => {
  const wrapper = mount(NavBar, {
    props: {
      search: true,
      searchProps: {
        shape: 'round',
        leftIcon: 'scan',
        placeholder: 'Native Search',
      },
    },
  });

  expect(wrapper.find('.van-search__content--round').exists()).toBeTruthy();
  expect(wrapper.find('.van-icon-scan').exists()).toBeTruthy();
  expect(wrapper.find('input').attributes('placeholder')).toBe('Native Search');
});

test('should change background when using background prop', () => {
  const wrapper = mount(NavBar, {
    props: {
      background: 'red',
      leftText: 'Back',
      rightText: 'More',
    },
  });

  expect(wrapper.classes()).toContain('van-nav-bar--custom-background');
  expect((wrapper.element as HTMLElement).style.background).toEqual('red');
});

test('should render multiple button slots correctly', () => {
  const wrapper = mount(NavBar, {
    props: {
      leftButtons: [{}, {}],
      rightButtons: [{}, {}],
    },
    slots: {
      'left-action': () => 'Left 1',
      'left-extra-action': () => 'Left 2',
      'right-action': () => 'Right 1',
      'right-extra-action': () => 'Right 2',
    },
  });

  expect(wrapper.html()).toContain('Left 1');
  expect(wrapper.html()).toContain('Left 2');
  expect(wrapper.html()).toContain('Right 1');
  expect(wrapper.html()).toContain('Right 2');
});

test('should change button icon and action size when using button size', () => {
  const wrapper = mount(NavBar, {
    props: {
      rightButtons: [{ icon: 'search', size: 20 }],
    },
  });

  const action = wrapper.find('.van-nav-bar__action');
  const icon = wrapper.find('.van-nav-bar__action-icon');

  expect((action.element as HTMLElement).style.width).toBe('20px');
  expect((action.element as HTMLElement).style.height).toBe('20px');
  expect((icon.element as HTMLElement).style.fontSize).toBe('20px');
});
