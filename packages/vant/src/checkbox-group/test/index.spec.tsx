import { ref, nextTick } from 'vue';
import { mount } from '../../../test';
import { Checkbox } from '../../checkbox';
import { CheckboxGroup, CheckboxGroupToggleAllOptions } from '..';

const disabledClass = 'van-checkbox--disabled';

test('should emit "update:modelValue" event when checkbox is clicked', async () => {
  const wrapper = mount({
    setup() {
      return {
        value: ref([]),
      };
    },
    render() {
      return (
        <CheckboxGroup v-model={this.value}>
          <Checkbox name="a" />
          <Checkbox name="b" />
        </CheckboxGroup>
      );
    },
  });

  const items = wrapper.findAll('.van-checkbox');

  await items[0].trigger('click');
  expect(wrapper.vm.value).toEqual(['a']);

  await items[1].trigger('click');
  expect(wrapper.vm.value).toEqual(['a', 'b']);

  await items[0].trigger('click');
  expect(wrapper.vm.value).toEqual(['b']);
});

test('should change icon size when using icon-size prop', () => {
  const wrapper = mount({
    render() {
      return (
        <CheckboxGroup icon-size="10rem">
          <Checkbox />
          <Checkbox icon-size="5rem" />
        </CheckboxGroup>
      );
    },
  });

  const icons = wrapper.findAll('.van-checkbox__icon');
  expect(icons[0].style.fontSize).toEqual('10rem');
  expect(icons[1].style.fontSize).toEqual('5rem');
});

test('should limit the number of checked items when using max prop', async () => {
  const wrapper = mount({
    setup() {
      const groupValue = ref(['a']);

      return {
        groupValue,
      };
    },
    render() {
      return (
        <CheckboxGroup v-model={this.groupValue} max={2}>
          <Checkbox name="a" />
          <Checkbox name="b" />
          <Checkbox name="c" />
          <Checkbox name="d" />
        </CheckboxGroup>
      );
    },
  });

  const items = wrapper.findAll('.van-checkbox');
  await items[1].trigger('click');
  expect(wrapper.vm.groupValue).toEqual(['a', 'b']);
  expect(items[2].classes()).toContain(disabledClass);

  await items[2].trigger('click');
  expect(wrapper.vm.groupValue).toEqual(['a', 'b']);

  await items[1].trigger('click');
  expect(items[2].classes()).not.toContain(disabledClass);
});

test('should change checked color when using checked-color prop', () => {
  const wrapper = mount({
    render() {
      return (
        <CheckboxGroup modelValue={['a', 'b']} checkedColor="black">
          <Checkbox name="a" />
          <Checkbox name="b" checkedColor="white" />
        </CheckboxGroup>
      );
    },
  });

  const icons = wrapper.findAll('.van-icon');
  expect(icons[0].style.backgroundColor).toEqual('black');
  expect(icons[1].style.backgroundColor).toEqual('white');
});

test('should ignore Checkbox if bind-group is false', async () => {
  const wrapper = mount({
    setup() {
      const value = ref(false);
      const groupRef = ref();
      const groupValue = ref([]);
      const toggleAll = (checked?: boolean) => {
        groupRef.value.toggleAll(checked);
      };

      return {
        value,
        groupRef,
        groupValue,
        toggleAll,
      };
    },
    render() {
      return (
        <CheckboxGroup v-model={this.groupValue} ref="groupRef">
          <Checkbox v-model={this.value} name="a" bindGroup={false} />
          <Checkbox name="b" />
          <Checkbox name="c" />
        </CheckboxGroup>
      );
    },
  });

  const items = wrapper.findAll('.van-checkbox');
  items[0].trigger('click');
  expect(wrapper.vm.value).toBeTruthy();
  expect(wrapper.vm.groupValue).toEqual([]);

  wrapper.vm.toggleAll(true);
  expect(wrapper.vm.groupValue).toEqual(['b', 'c']);
});

test('should toggle all checkboxes when toggleAll method is called', async () => {
  const wrapper = mount({
    setup() {
      const value = ref(['a']);
      const groupRef = ref();
      const toggleAll = (options?: CheckboxGroupToggleAllOptions) => {
        groupRef.value.toggleAll(options);
      };

      return {
        value,
        groupRef,
        toggleAll,
      };
    },
    render() {
      return (
        <CheckboxGroup v-model={this.value} ref="groupRef">
          <Checkbox name="a" />
          <Checkbox name="b" />
          <Checkbox name="c" disabled />
        </CheckboxGroup>
      );
    },
  });

  wrapper.vm.toggleAll();
  expect(wrapper.vm.value).toEqual(['b', 'c']);

  wrapper.vm.toggleAll(false);
  expect(wrapper.vm.value).toEqual([]);

  wrapper.vm.toggleAll(true);
  await nextTick();
  expect(wrapper.vm.value).toEqual(['a', 'b', 'c']);

  wrapper.vm.toggleAll({ skipDisabled: true });
  expect(wrapper.vm.value).toEqual(['c']);

  wrapper.vm.toggleAll({ checked: true, skipDisabled: true });
  expect(wrapper.vm.value).toEqual(['a', 'b', 'c']);
});

test('should render shape correctly when using shape prop', () => {
  const wrapper = mount({
    setup() {
      const groupValue = ref([]);

      return {
        groupValue,
      };
    },
    render() {
      return (
        <CheckboxGroup modelValue={this.groupValue} shape="square">
          <Checkbox name="a" />
          <Checkbox name="b" shape="round" />
        </CheckboxGroup>
      );
    },
  });

  const shapeClass = 'van-checkbox__icon--square';
  const shapeClass1 = 'van-checkbox__icon--round';
  const iconBoxs = wrapper.findAll('.van-checkbox__icon');
  expect(iconBoxs[0].classes()).toContain(shapeClass);
  expect(iconBoxs[1].classes()).toContain(shapeClass1);
});

test('should render checkboxes from options prop', async () => {
  const wrapper = mount({
    emits: ['change'],
    setup(props, { emit }) {
      return {
        result: ref(['a']),
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
          { label: 'Option C', value: 'c', disabled: true },
        ],
        emit,
      };
    },
    render() {
      return (
        <CheckboxGroup
          v-model={this.result}
          options={this.options}
          onChange={(value) => this.emit('change', value)}
        />
      );
    },
  });

  const labels = wrapper.findAll('.van-checkbox__label');
  expect(labels.map((item) => item.text())).toEqual([
    'Option A',
    'Option B',
    'Option C',
  ]);

  await labels[1].trigger('click');
  expect(wrapper.vm.result).toEqual(['a', 'b']);
  expect(wrapper.emitted('change')![0]).toEqual([['a', 'b']]);

  await labels[0].trigger('click');
  expect(wrapper.vm.result).toEqual(['b']);
  expect(wrapper.emitted('change')![1]).toEqual([['b']]);

  await labels[2].trigger('click');
  expect(wrapper.vm.result).toEqual(['b']);
});

test('should render icon from options prop', () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref([]),
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b', icon: 'shop-o' },
        ],
      };
    },
    render() {
      return (
        <CheckboxGroup v-model={this.result} options={this.options} />
      );
    },
  });

  const icons = wrapper.findAll('.van-checkbox-group__option-icon');
  expect(icons).toHaveLength(1);
  expect(icons[0].classes()).toContain('van-icon-shop-o');
});

test('should render list options with checkbox on the right when isList is true', async () => {
  const wrapper = mount({
    emits: ['change'],
    setup(props, { emit }) {
      return {
        result: ref(['a']),
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
          { label: 'Option C', value: 'c', disabled: true },
        ],
        emit,
      };
    },
    render() {
      return (
        <CheckboxGroup
          v-model={this.result}
          isList
          options={this.options}
          onChange={(value) => this.emit('change', value)}
        />
      );
    },
  });

  expect(wrapper.find('.van-checkbox-group--list').exists()).toBe(true);
  expect(wrapper.findAll('.van-cell')).toHaveLength(3);
  expect(wrapper.findAll('.van-checkbox__label')).toHaveLength(0);

  const titles = wrapper.findAll('.van-cell__title');
  expect(titles.map((item) => item.text())).toEqual([
    'Option A',
    'Option B',
    'Option C',
  ]);

  await titles[1].trigger('click');
  expect(wrapper.vm.result).toEqual(['a', 'b']);
  expect(wrapper.emitted('change')![0]).toEqual([['a', 'b']]);

  await titles[2].trigger('click');
  expect(wrapper.vm.result).toEqual(['a', 'b']);

  await titles[0].trigger('click');
  expect(wrapper.vm.result).toEqual(['b']);
  expect(wrapper.emitted('change')![1]).toEqual([['b']]);
});

test('should pass cellProps to Cell when isList is true', () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref([]),
        options: [
          { label: 'Option A', value: 'a' },
          {
            label: 'Option B',
            value: 'b',
            cellProps: { label: 'Description', icon: 'shop-o' },
          },
        ],
      };
    },
    render() {
      return (
        <CheckboxGroup v-model={this.result} isList options={this.options} />
      );
    },
  });

  const cells = wrapper.findAll('.van-cell');
  expect(cells[1].find('.van-cell__label').text()).toBe('Description');
  expect(cells[1].find('.van-icon').exists()).toBe(true);
});

test('should render icon from options prop when isList is true', () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref([]),
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b', icon: 'shop-o' },
        ],
      };
    },
    render() {
      return (
        <CheckboxGroup v-model={this.result} isList options={this.options} />
      );
    },
  });

  const cells = wrapper.findAll('.van-cell');
  expect(cells[1].find('.van-icon-shop-o').exists()).toBe(true);
});

test('should ignore direction, columns and shape when isList is true', () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref([]),
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ],
      };
    },
    render() {
      return (
        <CheckboxGroup
          v-model={this.result}
          isList
          shape="block"
          direction="horizontal"
          columns={3}
          options={this.options}
        />
      );
    },
  });

  expect(wrapper.classes()).toContain('van-checkbox-group--list');
  expect(wrapper.classes()).not.toContain('van-checkbox-group--horizontal');
  expect(wrapper.attributes('style')).toBeUndefined();
  expect(wrapper.find('.van-checkbox--block').exists()).toBe(false);
  expect(wrapper.findAll('.van-cell')).toHaveLength(2);
});

test('should render search and filter list options when showSearch is true', async () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref([]),
        options: [
          { label: 'Apple', value: 'a' },
          { label: 'Banana', value: 'b' },
          {
            label: 'Cherry',
            value: 'c',
            cellProps: { label: 'Red fruit' },
          },
        ],
      };
    },
    render() {
      return (
        <CheckboxGroup
          v-model={this.result}
          isList
          showSearch
          searchPlaceholder="Search fruit"
          options={this.options}
        />
      );
    },
  });

  expect(wrapper.find('.van-search').exists()).toBe(true);
  expect(wrapper.find('.van-cell-group').findAll('.van-cell')).toHaveLength(3);

  const input = wrapper.find('.van-search input');
  await input.setValue('app');
  expect(wrapper.find('.van-cell-group').findAll('.van-cell')).toHaveLength(1);
  expect(wrapper.find('.van-cell__title .van-cell__highlight').text()).toBe(
    'App',
  );

  await input.setValue('red');
  expect(wrapper.find('.van-cell-group').findAll('.van-cell')).toHaveLength(1);
  expect(wrapper.find('.van-cell__label .van-cell__highlight').text()).toBe(
    'Red',
  );

  await input.setValue('xyz');
  expect(wrapper.find('.van-empty').exists()).toBe(true);
  expect(wrapper.find('.van-cell-group').exists()).toBe(false);
  expect(['未找到搜索项', 'No search results']).toContain(
    wrapper.find('.van-empty__description').text(),
  );
});

test('should render search-empty slot when no search results', async () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref([]),
        options: [{ label: 'Apple', value: 'a' }],
      };
    },
    render() {
      return (
        <CheckboxGroup
          v-model={this.result}
          isList
          showSearch
          options={this.options}
        >
          {{
            'search-empty': () => <div class="custom-empty">No data</div>,
          }}
        </CheckboxGroup>
      );
    },
  });

  await wrapper.find('.van-search input').setValue('xyz');
  expect(wrapper.find('.custom-empty').exists()).toBe(true);
  expect(wrapper.find('.van-empty').exists()).toBe(false);
});

test('should not render search when showSearch is false', () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref([]),
        options: [{ label: 'Option A', value: 'a' }],
      };
    },
    render() {
      return (
        <CheckboxGroup
          v-model={this.result}
          isList
          options={this.options}
        />
      );
    },
  });

  expect(wrapper.find('.van-search').exists()).toBe(false);
});

test('should render block shape correctly when using shape prop', () => {
  const wrapper = mount({
    setup() {
      const groupValue = ref(['a']);

      return {
        groupValue,
      };
    },
    render() {
      return (
        <CheckboxGroup modelValue={this.groupValue} shape="block">
          <Checkbox name="a">Option A</Checkbox>
          <Checkbox name="b">Option B</Checkbox>
        </CheckboxGroup>
      );
    },
  });

  const blocks = wrapper.findAll('.van-checkbox--block');
  expect(blocks).toHaveLength(2);
  expect(blocks[0].classes()).toContain('van-checkbox--checked');
  expect(wrapper.findAll('.van-checkbox__icon')).toHaveLength(0);
});

test('should set columns style when direction is horizontal and shape is block', () => {
  const wrapper = mount({
    render() {
      return (
        <CheckboxGroup direction="horizontal" shape="block" columns={2}>
          <Checkbox name="a">Option A</Checkbox>
          <Checkbox name="b">Option B</Checkbox>
        </CheckboxGroup>
      );
    },
  });

  expect(wrapper.classes()).toContain('van-checkbox-group--horizontal');
  expect(wrapper.classes()).toContain('van-checkbox-group--block');
  expect(wrapper.attributes('style')).toContain(
    '--van-checkbox-group-columns: 2',
  );
});

test('should not set columns style when shape is not block', () => {
  const wrapper = mount({
    render() {
      return (
        <CheckboxGroup direction="horizontal" columns={2}>
          <Checkbox name="a">Option A</Checkbox>
          <Checkbox name="b">Option B</Checkbox>
        </CheckboxGroup>
      );
    },
  });

  expect(wrapper.classes()).toContain('van-checkbox-group--horizontal');
  expect(wrapper.classes()).not.toContain('van-checkbox-group--block');
  expect(wrapper.attributes('style')).toBeUndefined();
});
