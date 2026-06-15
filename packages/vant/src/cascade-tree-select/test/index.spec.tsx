import { CascadeTreeSelect } from '..';
import { mount } from '../../../test';

const apple = {
  text: 'Apple',
  value: 'apple',
};

const banana = {
  text: 'Banana',
  value: 'banana',
};

const mockItems = [
  {
    text: 'Food',
    value: 'food',
    children: [
      apple,
      banana,
      {
        text: 'Tea',
        value: 'tea',
        disabled: true,
      },
    ],
  },
  {
    text: 'Digital',
    value: 'digital',
    children: [
      {
        text: 'Phone',
        value: 'phone',
      },
    ],
  },
];

const singleItems = [
  {
    text: 'All',
    value: 'all',
  },
  {
    text: 'Pending',
    value: 'pending',
  },
  {
    text: 'Finished',
    value: 'finished',
  },
];

test('should render empty CascadeTreeSelect correctly', () => {
  expect(mount(CascadeTreeSelect).html()).toMatchSnapshot();
});

test('should change height when using height prop', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      height: '100vh',
    },
  });

  expect((wrapper.element as HTMLElement).style.height).toEqual('100vh');
});

test('should add width classes for single column', async () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: [
        {
          text: '123456789',
          value: 'long',
          dot: true,
        },
      ],
    },
  });
  const column = wrapper.find('.van-cascade-tree-select__column');

  expect(column.classes()).toContain('van-cascade-tree-select__column--single');
  expect(column.classes()).not.toContain(
    'van-cascade-tree-select__column--with-badge',
  );
  expect(wrapper.find('.van-cascade-tree-select__dot').exists()).toBeFalsy();

  await wrapper.setProps({ modelValue: 'other' });

  expect(wrapper.find('.van-cascade-tree-select__dot').exists()).toBeTruthy();
});

test('should add width classes for multiple single column with badge', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      modelValue: ['long'],
      multiple: true,
      items: [
        {
          text: '123456789',
          value: 'long',
          badge: 100,
        },
      ],
    },
  });
  const column = wrapper.find('.van-cascade-tree-select__column');

  expect(column.classes()).toContain('van-cascade-tree-select__column--single');
  expect(column.classes()).toContain(
    'van-cascade-tree-select__column--multiple',
  );
  expect(column.classes()).toContain(
    'van-cascade-tree-select__column--with-badge',
  );
});

test('should add width classes for multiple double columns', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
      modelValue: ['apple'],
      expandPath: ['food'],
      multiple: true,
    },
  });
  const columns = wrapper.findAll('.van-cascade-tree-select__column');

  expect(columns[0].classes()).toContain(
    'van-cascade-tree-select__column--double',
  );
  expect(columns[0].classes()).toContain(
    'van-cascade-tree-select__column--outer',
  );
  expect(columns[1].classes()).toContain(
    'van-cascade-tree-select__column--double',
  );
  expect(columns[1].classes()).toContain(
    'van-cascade-tree-select__column--inner',
  );
});

test('should not show weak badge in single mode', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      modelValue: 'long',
      items: [
        {
          text: '123456789',
          value: 'long',
          badge: 100,
        },
      ],
    },
  });

  expect(wrapper.find('.van-cascade-tree-select__badge').exists()).toBeFalsy();
});

test('should emit update:expandPath event when parent option is clicked', async () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
    },
  });

  await wrapper.findAll('.van-cascade-tree-select__item')[0].trigger('click');

  expect(wrapper.emitted('update:expandPath')?.[0]).toEqual([['food']]);
  expect(wrapper.emitted('clickNav')?.[0][0]).toMatchObject({
    selectedValue: undefined,
    currentItem: mockItems[0],
    columnIndex: 0,
    fullPathItems: [mockItems[0]],
    expandPath: ['food'],
    isLeaf: false,
  });
  expect(wrapper.emitted('clickItem')).toBeFalsy();
  expect(wrapper.findAll('.van-cascade-tree-select__column')).toHaveLength(2);
});

test('should emit change event when leaf option is clicked', async () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
      expandPath: ['food'],
    },
  });
  const columns = wrapper.findAll('.van-cascade-tree-select__column');

  await columns[1]
    .findAll('.van-cascade-tree-select__item')[0]
    .trigger('click');

  const changeParams = wrapper.emitted('change')?.[0][0];

  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple']);
  expect(changeParams).toMatchObject({
    selectedValue: 'apple',
    currentItem: apple,
    columnIndex: 1,
    fullPathItems: [mockItems[0], apple],
    selectedItems: [apple],
    expandPath: ['food'],
    isLeaf: true,
  });
  expect(changeParams).not.toHaveProperty('value');
  expect(changeParams).not.toHaveProperty('option');
  expect(changeParams).not.toHaveProperty('selectedOptions');
  expect(wrapper.emitted('clickItem')?.[0][0]).toMatchObject({
    selectedValue: 'apple',
    currentItem: apple,
    columnIndex: 1,
    fullPathItems: [mockItems[0], apple],
    selectedItems: [apple],
    expandPath: ['food'],
    isLeaf: true,
  });
  expect(wrapper.emitted('clickNav')).toBeFalsy();
  expect(wrapper.emitted('update:expandPath')).toBeFalsy();
});

test('should not emit events when disabled option is clicked', async () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
      expandPath: ['food'],
    },
  });
  const columns = wrapper.findAll('.van-cascade-tree-select__column');

  await columns[1]
    .findAll('.van-cascade-tree-select__item')[2]
    .trigger('click');

  expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  expect(wrapper.emitted('change')).toBeFalsy();
  expect(wrapper.emitted('clickItem')).toBeFalsy();
});

test('should emit click-nav instead of click-item when single column option is clicked', async () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: singleItems,
    },
  });

  await wrapper.findAll('.van-cascade-tree-select__item')[0].trigger('click');

  expect(wrapper.emitted('clickNav')?.[0][0]).toMatchObject({
    selectedValue: 'all',
    currentItem: singleItems[0],
    columnIndex: 0,
    fullPathItems: [singleItems[0]],
    isLeaf: true,
  });
  expect(wrapper.emitted('clickItem')).toBeFalsy();
});

test('should allow to select multiple items when using multiple prop', async () => {
  const wrapper = mount({
    data() {
      return {
        value: [] as string[],
      };
    },
    render() {
      return (
        <CascadeTreeSelect
          v-model={this.value}
          items={singleItems}
          multiple
          max={1}
        />
      );
    },
  });

  const items = wrapper.findAll('.van-cascade-tree-select__item');
  const vm = wrapper.vm as unknown as { value: string[] };
  await items[0].trigger('click');
  await items[1].trigger('click');
  expect(vm.value).toEqual(['all']);

  await items[0].trigger('click');
  expect(vm.value).toEqual([]);
});

test('should only select leaf option in multiple double columns by default', async () => {
  const wrapper = mount({
    data() {
      return {
        value: [] as string[],
        expandPath: [] as string[],
      };
    },
    render() {
      return (
        <CascadeTreeSelect
          v-model={this.value}
          v-model:expandPath={this.expandPath}
          items={mockItems}
          multiple
        />
      );
    },
  });

  let columns = wrapper.findAll('.van-cascade-tree-select__column');
  const vm = wrapper.vm as unknown as {
    value: string[];
    expandPath: string[];
  };

  await columns[0]
    .findAll('.van-cascade-tree-select__item')[0]
    .trigger('click');

  // 默认开启 selectLeafOnly，点击一级父项只更新展开路径，不会写入多选值。
  expect(vm.expandPath).toEqual(['food']);
  expect(vm.value).toEqual([]);

  columns = wrapper.findAll('.van-cascade-tree-select__column');
  await columns[1]
    .findAll('.van-cascade-tree-select__item')[0]
    .trigger('click');

  // 点击二级叶子项时才会写入 v-model。
  expect(vm.expandPath).toEqual(['food']);
  expect(vm.value).toEqual(['apple']);
});

test('should remove selected style after cancelling selected item in multiple mode', async () => {
  const wrapper = mount({
    data() {
      return {
        value: ['all', 'pending'],
      };
    },
    render() {
      return (
        <CascadeTreeSelect v-model={this.value} items={singleItems} multiple />
      );
    },
  });
  const items = wrapper.findAll('.van-cascade-tree-select__item');
  const vm = wrapper.vm as unknown as { value: string[] };

  await items[0].trigger('click');

  expect(vm.value).toEqual(['pending']);
  expect(items[0].classes()).not.toContain(
    'van-cascade-tree-select__item--active',
  );
  expect(items[0].classes()).not.toContain(
    'van-cascade-tree-select__item--selected',
  );
  expect(items[0].classes()).not.toContain(
    'van-cascade-tree-select__item--indicator',
  );
});

test('should only show indicator style in outer columns', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
      modelValue: 'apple',
      expandPath: ['food'],
    },
  });
  const columns = wrapper.findAll('.van-cascade-tree-select__column');

  expect(
    columns[0].findAll('.van-cascade-tree-select__item')[0].classes(),
  ).toContain('van-cascade-tree-select__item--indicator');
  expect(
    columns[1].findAll('.van-cascade-tree-select__item')[0].classes(),
  ).not.toContain('van-cascade-tree-select__item--indicator');
});

test('should only show configured dot in outer columns when page has selected item', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: [
        {
          text: 'Parent',
          value: 'parent',
          dot: true,
          children: [
            {
              text: 'Child',
              value: 'child',
              dot: true,
            },
          ],
        },
      ],
      modelValue: 'child',
      expandPath: ['parent'],
    },
  });

  expect(wrapper.findAll('.van-cascade-tree-select__dot')).toHaveLength(1);
});

test('should not show dot automatically when dot is not configured', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: singleItems,
      modelValue: 'all',
    },
  });

  expect(wrapper.find('.van-cascade-tree-select__dot').exists()).toBeFalsy();
});

test('should show dot on parent option when child option is selected in multiple double columns', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
      modelValue: ['apple'],
      multiple: true,
    },
  });

  const parentItems = wrapper
    .findAll('.van-cascade-tree-select__column')[0]
    .findAll('.van-cascade-tree-select__item');

  expect(
    parentItems[0].find('.van-cascade-tree-select__dot').exists(),
  ).toBeTruthy();
  expect(
    parentItems[1].find('.van-cascade-tree-select__dot').exists(),
  ).toBeFalsy();
});

test('should not generate weak badge from selected count automatically', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
      modelValue: ['apple', 'banana'],
      expandPath: ['food'],
      multiple: true,
    },
  });

  expect(wrapper.find('.van-cascade-tree-select__badge').exists()).toBeFalsy();
});

test('should render configured badge only when page has selected item', async () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: [
        {
          text: 'Food',
          value: 'food',
          children: [
            {
              text: 'Apple',
              value: 'apple',
              badge: 4,
            },
            banana,
          ],
        },
      ],
      expandPath: ['food'],
      multiple: true,
    },
  });

  expect(wrapper.find('.van-cascade-tree-select__badge').exists()).toBeFalsy();

  await wrapper.setProps({ modelValue: ['other'] });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should prefer weak badge when dot and badge are both configured', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: [
        {
          text: 'All',
          value: 'all',
          dot: true,
          badge: 3,
        },
      ],
      modelValue: ['all'],
      multiple: true,
    },
  });

  expect(wrapper.find('.van-cascade-tree-select__badge').exists()).toBeTruthy();
  expect(wrapper.find('.van-cascade-tree-select__dot').exists()).toBeFalsy();
});

test('should render content and option slots correctly', () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: mockItems,
      modelValue: 'apple',
      expandPath: ['food'],
    },
    slots: {
      option: ({ option }) => `Custom ${option.text}`,
      content: ({ expandOptions }) =>
        `Current ${expandOptions[expandOptions.length - 1].text}`,
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should allow to custom field names', async () => {
  const wrapper = mount(CascadeTreeSelect, {
    props: {
      items: [
        {
          label: 'Food',
          id: 'food',
          nodes: [
            {
              label: 'Fruit',
              id: 'fruit',
            },
          ],
        },
      ],
      fieldNames: {
        text: 'label',
        value: 'id',
        children: 'nodes',
      },
    },
  });

  await wrapper.find('.van-cascade-tree-select__item').trigger('click');

  expect(wrapper.emitted('update:expandPath')?.[0]).toEqual([['food']]);
});
