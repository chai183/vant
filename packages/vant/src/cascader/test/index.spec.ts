import { Cascader } from '..';
import { mount, later } from '../../../test';
import options from '../demo/area-en-US';

test('should emit change event when active option changed', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
    },
  });

  await later();
  wrapper.find('.van-cascader__option').trigger('click');

  const firstOption = options[0];
  expect(wrapper.emitted('change')![0]).toEqual([
    {
      value: firstOption.value,
      tabIndex: 0,
      selectedOptions: [firstOption],
    },
  ]);

  await later();
  wrapper
    .findAll('.van-cascader__options')[1]
    .find('.van-cascader__option')
    .trigger('click');
  const secondOption = options[0].children[0];
  expect(wrapper.emitted('change')![1]).toEqual([
    {
      value: secondOption.value,
      tabIndex: 1,
      selectedOptions: [firstOption, secondOption],
    },
  ]);
});

test('should emit finish event when all options is selected', async () => {
  const option = { value: '1', text: 'foo' };
  const wrapper = mount(Cascader, {
    props: {
      options: [option],
    },
  });

  await later();
  wrapper.find('.van-cascader__option').trigger('click');
  expect(wrapper.emitted('finish')![0]).toEqual([
    {
      value: option.value,
      tabIndex: 0,
      selectedOptions: [option],
    },
  ]);
});

test('should emit close event when close icon is clicked', () => {
  const wrapper = mount(Cascader);
  wrapper.find('.van-cascader__close-icon').trigger('click');
  expect(wrapper.emitted('close')![0]).toBeTruthy();
});

test('should not render close icon when closeable is false', () => {
  const wrapper = mount(Cascader, {
    props: {
      closeable: false,
    },
  });
  expect(wrapper.find('.van-cascader__close-icon').exists()).toBeFalsy();
});

test('should change close icon when using close-icon prop', () => {
  const wrapper = mount(Cascader, {
    props: {
      closeIcon: 'success',
    },
  });
  expect(wrapper.find('.van-cascader__close-icon').html()).toMatchSnapshot();
});

test('should render title slot correctly', () => {
  const wrapper = mount(Cascader, {
    slots: {
      title: () => 'Custom Title',
    },
  });
  expect(wrapper.find('.van-cascader__title').html()).toMatchSnapshot();
});

test('should render option slot correctly', async () => {
  const option = { value: '1', text: 'foo' };
  const wrapper = mount(Cascader, {
    props: {
      options: [option],
    },
    slots: {
      option: ({ option }) => `Custom Option ${option.text}`,
    },
  });
  await later();
  expect(wrapper.find('.van-cascader__option').html()).toMatchSnapshot();
});

test('should select correct option when value changed', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
    },
  });

  await later();
  await wrapper.setProps({ modelValue: '330304' });
  await later();
  const selectedOptions = wrapper.findAll('.van-cascader__option--selected');
  const lastSelectedOption = selectedOptions[selectedOptions.length - 1];
  expect(lastSelectedOption.html()).toMatchSnapshot();
});

test('should reset selected options when value is set to empty', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
      modelValue: '330304',
    },
  });

  await wrapper.setProps({ modelValue: '' });
  expect(wrapper.find('.van-cascader__option--selected').exists()).toBeFalsy();
});

test('should update tabs when previous tab is clicked', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
      modelValue: '330304',
    },
  });

  await later();
  wrapper.findAll('.van-cascader__option')[1].trigger('click');
  await later();
  expect(wrapper.html()).toMatchSnapshot();
});

test('should allow to custom field names', async () => {
  const fieldNames = {
    text: 'name',
    value: 'code',
    children: 'items',
  };
  const options = [
    {
      name: 'Zhejiang',
      code: '330000',
      items: [{ name: 'Hangzhou', code: '330100' }],
    },
  ];
  const wrapper = mount(Cascader, {
    props: {
      options,
      fieldNames,
    },
  });

  await later();
  wrapper.find('.van-cascader__option').trigger('click');

  const firstOption = options[0];
  expect(wrapper.emitted('change')![0]).toEqual([
    {
      value: firstOption.code,
      tabIndex: 0,
      selectedOptions: [firstOption],
    },
  ]);

  await later();
  wrapper
    .findAll('.van-cascader__options')[1]
    .find('.van-cascader__option')
    .trigger('click');
  const secondOption = options[0].items[0];
  expect(wrapper.emitted('change')![1]).toEqual([
    {
      value: secondOption.code,
      tabIndex: 1,
      selectedOptions: [firstOption, secondOption],
    },
  ]);
});

test('should emit clickTab event when a tab is clicked', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
    },
  });

  await later();
  wrapper.find('.van-cascader__option').trigger('click');
  await later();
  wrapper
    .findAll('.van-cascader__options')[1]
    .find('.van-cascader__option')
    .trigger('click');
  await later();

  const tabs = wrapper.findAll('.van-tab');

  tabs[0].trigger('click');
  expect(wrapper.emitted('clickTab')![0]).toEqual([0, options[0].text]);

  tabs[1].trigger('click');
  expect(wrapper.emitted('clickTab')![1]).toEqual([
    1,
    options[0].children[0].text,
  ]);
});

test('should allow to custom the className of option', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options: [{ value: '1', text: 'foo', className: 'foo' }],
    },
  });

  await later();
  const option = wrapper.find('.van-cascader__option');
  expect(option.classes()).toContain('foo');
});

test('should allow to custom the color of option', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options: [{ value: '1', text: 'foo', color: 'red' }],
    },
  });

  await later();
  const option = wrapper.find('.van-cascader__option');
  expect(option.style.color).toEqual('red');
});

test('should render options-top、options-bottom slots correctly', async () => {
  const wrapper = mount(Cascader, {
    slots: {
      'options-top': ({ tabIndex }) => `Top, tab index: ${tabIndex}`,
      'options-bottom': ({ tabIndex }) => `Bottom, tab index: ${tabIndex}`,
    },
    props: {
      options,
    },
  });

  await later();
  await wrapper
    .findAll('.van-cascader__options')[0]
    .find('.van-cascader__option')
    .trigger('click');

  expect(wrapper.find('.van-tab__panel').html()).toMatchSnapshot();
});

test('should sort options by pinyin and render index letter', async () => {
  const options = [
    { text: '云南省', value: '530000', pinyin: 'Yunnan' },
    { text: '浙江省', value: '330000', pinyin: 'Zhejiang' },
    { text: '安徽省', value: '340000', pinyin: 'Anhui' },
    { text: '澳门', value: '820000', pinyin: 'Aomen' },
  ];
  const wrapper = mount(Cascader, {
    props: {
      options,
    },
  });

  await later();
  const optionEls = wrapper.findAll('.van-cascader__option');
  const texts = optionEls.map((el) =>
    el.find('.van-cascader__option-content span').text(),
  );
  expect(texts).toEqual(['安徽省', '澳门', '云南省', '浙江省']);

  const indexEls = wrapper.findAll(
    '.van-cascader__option-index:not(.van-cascader__option-index--placeholder)',
  );
  expect(indexEls.map((el) => el.text())).toEqual(['A', 'Y', 'Z']);
});

test('should render steps layout and hide tabs header', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
      tabLayout: 'steps',
    },
  });

  await later();
  expect(wrapper.find('.van-cascader__steps').exists()).toBeFalsy();
  expect(wrapper.find('.van-tabs__wrap').exists()).toBeFalsy();

  await wrapper.find('.van-cascader__option').trigger('click');
  await later();

  expect(wrapper.find('.van-cascader__steps').exists()).toBeTruthy();
  expect(wrapper.findAll('.van-cascader__step')).toHaveLength(2);
  expect(wrapper.find('.van-cascader__step--pending').exists()).toBeTruthy();
  expect(wrapper.find('.van-cascader__step--active').exists()).toBeTruthy();

  await wrapper.find('.van-cascader__step--clickable').trigger('click');
  await later();
  expect(wrapper.find('.van-cascader__step--active').exists()).toBeTruthy();

  await wrapper.find('.van-cascader__option').trigger('click');
  await later();
  expect(wrapper.emitted('clickTab')).toBeTruthy();
});

test('should show selected option text in steps layout when step is selected', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
      tabLayout: 'steps',
    },
    slots: {
      'step-title': ({
        tabIndex,
        selected,
      }: {
        tabIndex: number;
        selected: (typeof options)[0] | null;
      }) =>
        selected ? `Custom ${selected.text}` : `Select level ${tabIndex}`,
    },
  });

  await later();
  await wrapper.find('.van-cascader__option').trigger('click');
  await later();

  const steps = wrapper.findAll('.van-cascader__step');
  expect(steps).toHaveLength(2);
  expect(steps[0].find('.van-cascader__step-title').text()).toBe(
    `Custom ${options[0].text}`,
  );
  expect(steps[1].find('.van-cascader__step-title').text()).toBe(
    'Select level 1',
  );
  expect(steps[1].classes()).toContain('van-cascader__step--pending');
});

test('should not render header when show-header prop is false', async () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
      showHeader: false,
    },
  });

  const header = wrapper.find('.van-cascader__header');
  expect(header.exists()).toBeFalsy();
});

test('should render title-extra slot below header', () => {
  const wrapper = mount(Cascader, {
    props: {
      options,
      title: 'Title',
    },
    slots: {
      'title-extra': () => 'Extra',
    },
  });

  const header = wrapper.find('.van-cascader__header');
  const titleExtra = wrapper.find('.van-cascader__title-extra');

  expect(titleExtra.text()).toBe('Extra');
  expect(header.find('.van-cascader__title-extra').exists()).toBeFalsy();
  expect(header.element.nextElementSibling).toBe(titleExtra.element);
});
