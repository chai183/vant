import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { FilterMenuBar } from '..';
import type { FilterMenuBarExpose, FilterMenuBarItem } from '..';

const createColumn = (key: string, title: string): FilterMenuBarItem => ({
  key,
  title,
  columns: [
    {
      name: key,
      label: title,
      component: 'field',
      defaultValue: '',
    },
  ],
});

const columns: FilterMenuBarItem[] = [createColumn('status', '状态')];

test('should render filter bar item from columns', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      columns,
    },
  });

  await nextTick();

  expect(wrapper.find('.van-filter-menu-bar__title').text()).toContain('状态');
});

test('should keep draft in confirm panel until confirm', async () => {
  const onUpdate = rstest.fn();
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: { status: '' },
      columns: [
        {
          ...createColumn('status', '状态'),
          showFooter: true,
        },
      ],
      'onUpdate:modelValue': onUpdate,
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();
  await wrapper.find('input').setValue('sale');

  expect(onUpdate).not.toHaveBeenCalled();

  await wrapper.find('.van-button--primary').trigger('click');
  await nextTick();

  expect(onUpdate).toHaveBeenCalledWith({
    status: 'sale',
  });
});

test('should revert draft when closing confirm panel by overlay', async () => {
  const onUpdate = rstest.fn();
  const onConfirm = rstest.fn();
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: { status: '' },
      columns: [
        {
          ...createColumn('status', '状态'),
          showFooter: true,
        },
      ],
      duration: 0,
      'onUpdate:modelValue': onUpdate,
      onConfirm,
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();
  await wrapper.find('input').setValue('sale');

  expect(onConfirm).not.toHaveBeenCalled();

  await wrapper.find('.van-overlay').trigger('click');
  wrapper.findComponent({ name: 'van-popup' }).vm.$emit('closed');
  await nextTick();

  expect(onUpdate).not.toHaveBeenCalled();
  expect(onConfirm).not.toHaveBeenCalled();
});

test('should emit confirm for immediate single select panel', async () => {
  const onUpdate = rstest.fn();
  const onConfirm = rstest.fn();
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: { status: '' },
      columns: [
        {
          key: 'status',
          title: '状态',
          columns: [
            {
              name: 'status',
              label: '状态',
              component: 'radioGroup',
              defaultValue: '',
              componentProps: {
                options: [
                  { label: '全部', value: '' },
                  { label: '在售', value: 'sale' },
                ],
              },
            },
          ],
        },
      ],
      duration: 0,
      'onUpdate:modelValue': onUpdate,
      onConfirm,
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();
  await wrapper.findAll('.van-radio')[1].trigger('click');
  wrapper.findComponent({ name: 'van-popup' }).vm.$emit('closed');
  await nextTick();

  expect(onUpdate).toHaveBeenCalledWith({
    status: 'sale',
  });
  expect(onConfirm).toHaveBeenCalledWith({
    key: 'status',
    model: { status: 'sale' },
  });
});

test('should display selected radio label in bar title', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: { status: 'sale' },
      columns: [
        {
          key: 'status',
          title: '状态',
          columns: [
            {
              name: 'status',
              label: '状态',
              component: 'radioGroup',
              defaultValue: '',
              componentProps: {
                options: [
                  { label: '全部', value: '' },
                  { label: '在售', value: 'sale' },
                ],
              },
            },
          ],
        },
      ],
    },
  });

  await nextTick();

  expect(wrapper.find('.van-filter-menu-bar__title').text()).toContain('在售');
});

test('should control single field label by showFieldLabel', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      columns: [
        {
          key: 'keyword',
          title: '筛选项',
          showFieldLabel: true,
          columns: [
            {
              name: 'keyword',
              label: '查找关键字名称',
              component: 'field',
              defaultValue: '',
              fieldProps: { labelAlign: 'top' },
            },
          ],
        },
      ],
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();

  expect(wrapper.find('.van-field__label--top').exists()).toBe(true);
  expect(wrapper.text()).toContain('查找关键字名称');
});

test('should align edge bar item text when item count is 3 or 4', async () => {
  const wrapper3 = mount(FilterMenuBar, {
    props: {
      columns: [
        createColumn('a', 'A'),
        createColumn('b', 'B'),
        createColumn('c', 'C'),
      ],
    },
  });

  await nextTick();

  const items3 = wrapper3.findAll('.van-filter-menu-bar__item');
  expect(items3[0].classes()).toContain(
    'van-filter-menu-bar__item--align-start',
  );
  expect(items3[1].classes()).not.toContain(
    'van-filter-menu-bar__item--align-start',
  );
  expect(items3[1].classes()).not.toContain(
    'van-filter-menu-bar__item--align-end',
  );
  expect(items3[2].classes()).toContain('van-filter-menu-bar__item--align-end');

  const wrapper4 = mount(FilterMenuBar, {
    props: {
      columns: [
        createColumn('a', 'A'),
        createColumn('b', 'B'),
        createColumn('c', 'C'),
        createColumn('d', 'D'),
      ],
    },
  });

  await nextTick();

  const items4 = wrapper4.findAll('.van-filter-menu-bar__item');
  expect(items4[0].classes()).toContain(
    'van-filter-menu-bar__item--align-start',
  );
  expect(items4[3].classes()).toContain('van-filter-menu-bar__item--align-end');
});

test('should render overflow items in funnel panel', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      columns: [
        ...columns,
        createColumn('category', '品类'),
        createColumn('brand', '品牌'),
        createColumn('area', '地区'),
        createColumn('service', '服务'),
      ],
      overflowThreshold: 4,
    },
  });

  await nextTick();
  expect(wrapper.findAll('.van-filter-menu-bar__item')).toHaveLength(4);

  await wrapper.findAll('.van-filter-menu-bar__item')[3].trigger('click');
  await nextTick();

  expect(wrapper.find('.van-filter-menu-bar__funnel').exists()).toBe(true);
  expect(wrapper.text()).toContain('服务');
});

test('should render panel and funnel footer slots', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      columns: [
        {
          ...createColumn('status', '状态'),
          showFooter: true,
        },
        createColumn('category', '品类'),
      ],
      overflowThreshold: 1,
    },
    slots: {
      'panel-footer-status': () => '普通底部',
      'funnel-footer': () => '漏斗底部',
    },
  });

  await nextTick();
  await wrapper.findAll('.van-filter-menu-bar__item')[0].trigger('click');
  await nextTick();
  expect(wrapper.text()).toContain('普通底部');

  await wrapper.findAll('.van-filter-menu-bar__item')[1].trigger('click');
  await nextTick();
  expect(wrapper.text()).toContain('漏斗底部');
});

test('should render built-in footer when showFooter is true', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      columns: [
        {
          ...createColumn('status', '状态'),
          showFooter: true,
        },
      ],
      confirmText: '确定',
      resetText: '重置',
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();

  expect(wrapper.text()).toContain('确定');
  expect(wrapper.text()).toContain('重置');
  expect(wrapper.find('.van-bottom-action-bar').exists()).toBe(true);
});

test('should hide reset button when showResetButton is false', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      columns: [
        {
          ...createColumn('status', '状态'),
          showFooter: true,
        },
      ],
      showResetButton: false,
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();

  expect(
    wrapper.find('.van-bottom-action-bar__button--secondary').exists(),
  ).toBe(false);
  expect(wrapper.find('.van-bottom-action-bar__button--primary').exists()).toBe(
    true,
  );
});

test('should allow item showResetButton to override component prop', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      columns: [
        {
          ...createColumn('status', '状态'),
          showFooter: true,
          showResetButton: false,
        },
        {
          ...createColumn('category', '品类'),
          showFooter: true,
        },
      ],
    },
  });

  await nextTick();
  await wrapper.findAll('.van-filter-menu-bar__item')[0].trigger('click');
  await nextTick();

  expect(
    wrapper.find('.van-bottom-action-bar__button--secondary').exists(),
  ).toBe(false);

  await wrapper.findAll('.van-filter-menu-bar__item')[1].trigger('click');
  await nextTick();

  expect(
    wrapper.find('.van-bottom-action-bar__button--secondary').exists(),
  ).toBe(true);
});

test('should show selected count on confirm button for single field multi select panel', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: { brands: ['brand-a'] },
      columns: [
        {
          key: 'brands',
          title: '品牌',
          showFooter: true,
          confirmText: '确定',
          columns: [
            {
              name: 'brands',
              label: '品牌',
              component: 'checkboxGroup',
              defaultValue: [],
              fieldProps: { labelAlign: 'top' },
              componentProps: {
                isList: true,
                options: [
                  { label: '品牌A', value: 'brand-a' },
                  { label: '品牌B', value: 'brand-b' },
                  { label: '品牌C', value: 'brand-c' },
                ],
              },
            },
          ],
        },
      ],
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();

  expect(wrapper.find('.van-button--primary').text()).toBe('确定(1)');

  await wrapper.findAll('.van-checkbox')[1].trigger('click');
  await nextTick();

  expect(wrapper.find('.van-button--primary').text()).toBe('确定(2)');
});

test('should not show selected count on confirm button for rangeInput panel', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: { date: ['2024-05-01', '2024-05-22'] },
      columns: [
        {
          key: 'date',
          title: '日期',
          showFooter: true,
          confirmText: '确定',
          columns: [
            {
              name: 'date',
              label: '日期',
              component: 'rangeInput',
              defaultValue: ['', ''],
              componentProps: {
                start: { component: 'datePicker' },
                end: { component: 'datePicker' },
              },
            },
          ],
        },
      ],
    },
  });

  await nextTick();
  await wrapper.find('.van-filter-menu-bar__item').trigger('click');
  await nextTick();

  expect(wrapper.find('.van-button--primary').text()).toBe('确定');
});

test('should update funnel single select section in draft model', async () => {
  const onUpdate = rstest.fn();
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: {
        status: '',
        tagNormalTwo: 'digital',
      },
      columns: [
        createColumn('status', '状态'),
        {
          key: 'tagNormalTwo',
          title: '标签列表-常规',
          columns: [
            {
              name: 'tagNormalTwo',
              label: '标签列表-常规',
              component: 'radioGroup',
              defaultValue: 'digital',
              fieldProps: { labelAlign: 'top' },
              componentProps: {
                shape: 'block',
                columns: 2,
                direction: 'horizontal',
                options: [
                  { label: '数码', value: 'digital' },
                  { label: '家居', value: 'home' },
                ],
              },
            },
          ],
        },
      ],
      overflowThreshold: 1,
      'onUpdate:modelValue': onUpdate,
    },
  });

  await nextTick();
  await wrapper.findAll('.van-filter-menu-bar__item')[1].trigger('click');
  await nextTick();
  await wrapper.findAll('.van-radio')[1].trigger('click');
  await nextTick();
  await nextTick();

  expect(onUpdate).not.toHaveBeenCalled();

  await wrapper
    .find('.van-filter-menu-bar__footer .van-button--primary')
    .trigger('click');
  await nextTick();
  wrapper.findComponent({ name: 'van-popup' }).vm.$emit('closed');
  await nextTick();

  expect(onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      tagNormalTwo: 'home',
    }),
  );
});

test('should expose validate method for funnel panel', async () => {
  const wrapper = mount(FilterMenuBar, {
    props: {
      modelValue: {
        status: '',
        service: [],
      },
      columns: [
        createColumn('status', '状态'),
        {
          key: 'service',
          title: '服务',
          defaultExpanded: false,
          columns: [
            {
              name: 'service',
              label: '服务',
              component: 'checkboxGroup',
              defaultValue: [],
              fieldProps: {
                labelAlign: 'top',
                rules: [{ required: true, message: '请选择服务' }],
              },
              componentProps: {
                options: [{ label: '配送', value: 'delivery' }],
              },
            },
          ],
        },
      ],
      overflowThreshold: 1,
    },
  });

  await nextTick();

  let validateError: unknown;
  try {
    await (wrapper.vm as unknown as FilterMenuBarExpose).validate();
  } catch (error) {
    validateError = error;
  }

  expect(validateError).toMatchObject({
    keys: ['service'],
  });
  expect(wrapper.text()).toContain('请选择服务');
});
