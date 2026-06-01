import { ref } from 'vue';
import { mount } from '../../../test';
import { Radio } from '../../radio';
import { RadioGroup } from '../index';

test('should emit "update:modelValue" and "change" event when radio is clicked', async () => {
  const wrapper = mount({
    emits: ['change'],
    setup(props, { emit }) {
      return {
        result: ref('a'),
        list: ['a', 'b', 'c', 'd'],
        emit,
        change(value: string) {
          emit('change', value);
        },
      };
    },
    render() {
      return (
        <RadioGroup
          onChange={(value) => this.emit('change', value)}
          v-model={this.result}
        >
          {this.list.map((item) => (
            <Radio key={item} name={item} disabled={item === 'd'}>
              {item}
            </Radio>
          ))}
        </RadioGroup>
      );
    },
  });

  const icons = wrapper.findAll('.van-radio__icon');
  const labels = wrapper.findAll('.van-radio__label');

  await icons[2].trigger('click');
  expect(wrapper.vm.result).toEqual('c');
  expect(wrapper.emitted('change')![0]).toEqual(['c']);

  await labels[1].trigger('click');
  expect(wrapper.vm.result).toEqual('b');
  expect(wrapper.emitted('change')![1]).toEqual(['b']);

  await icons[3].trigger('click');
  await labels[3].trigger('click');
  expect(wrapper.vm.result).toEqual('b');
});

test('should not emit "change" event when radio group is disabled and radio is clicked', async () => {
  const wrapper = mount({
    emits: ['change'],
    setup(props, { emit }) {
      return {
        result: ref('a'),
        list: ['a', 'b', 'c', 'd'],
        emit,
      };
    },
    render() {
      return (
        <RadioGroup
          v-model={this.result}
          disabled
          onChange={(value) => this.emit('change', value)}
        >
          {this.list.map((item) => (
            <Radio key={item} name={item}>
              label
            </Radio>
          ))}
        </RadioGroup>
      );
    },
  });

  const icons = wrapper.findAll('.van-radio__icon');
  await icons[2].trigger('click');
  expect(wrapper.emitted('change')).toBeFalsy();
});

test('should change icon size when using icon-size prop', () => {
  const wrapper = mount({
    render() {
      return (
        <RadioGroup iconSize="10rem">
          <Radio />
          <Radio iconSize="5rem" />
        </RadioGroup>
      );
    },
  });

  const icons = wrapper.findAll('.van-radio__icon');
  expect(icons[0].style.fontSize).toEqual('10rem');
  expect(icons[1].style.fontSize).toEqual('5rem');
});

test('should change checked color when using checked-color prop', () => {
  const wrapper = mount({
    render() {
      return (
        <RadioGroup checkedColor="black">
          <Radio modelValue={true} />
          <Radio modelValue={true} checkedColor="white" />
        </RadioGroup>
      );
    },
  });

  const icons = wrapper.findAll('.van-icon');
  expect(icons[0].style.backgroundColor).toEqual('black');
  expect(icons[1].style.backgroundColor).toEqual('white');
});

test('should render radios from options prop', async () => {
  const wrapper = mount({
    emits: ['change'],
    setup(props, { emit }) {
      return {
        result: ref('a'),
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
        <RadioGroup
          v-model={this.result}
          options={this.options}
          onChange={(value) => this.emit('change', value)}
        />
      );
    },
  });

  const labels = wrapper.findAll('.van-radio__label');
  expect(labels.map((item) => item.text())).toEqual([
    'Option A',
    'Option B',
    'Option C',
  ]);

  await labels[1].trigger('click');
  expect(wrapper.vm.result).toEqual('b');
  expect(wrapper.emitted('change')![0]).toEqual(['b']);

  await labels[2].trigger('click');
  expect(wrapper.vm.result).toEqual('b');
});

test('should ignore direction, columns and shape when isList is true', () => {
  const wrapper = mount({
    setup() {
      return {
        result: ref('a'),
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ],
      };
    },
    render() {
      return (
        <RadioGroup
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

  expect(wrapper.classes()).toContain('van-radio-group--list');
  expect(wrapper.classes()).not.toContain('van-radio-group--horizontal');
  expect(wrapper.attributes('style')).toBeUndefined();
  expect(wrapper.find('.van-radio--block').exists()).toBe(false);
  expect(wrapper.findAll('.van-cell')).toHaveLength(2);
});

test('should render shape correctly when using shape prop', () => {
  const wrapper = mount({
    render() {
      return (
        <RadioGroup shape="dot">
          <Radio modelValue={true} />
          <Radio modelValue={true} shape="round" />
        </RadioGroup>
      );
    },
  });

  const shapeClass = 'van-radio__icon--dot';
  // The priority of the sub component shape prop is higher than parent component
  const shapeClass1 = 'van-radio__icon--round';
  const iconBoxs = wrapper.findAll('.van-radio__icon');
  expect(iconBoxs[0].classes()).toContain(shapeClass);
  expect(iconBoxs[1].classes()).toContain(shapeClass1);
});

test('should render block shape correctly when using shape prop', () => {
  const wrapper = mount({
    render() {
      return (
        <RadioGroup shape="block" modelValue="1">
          <Radio name="1">Option 1</Radio>
          <Radio name="2">Option 2</Radio>
        </RadioGroup>
      );
    },
  });

  const blocks = wrapper.findAll('.van-radio--block');
  expect(blocks).toHaveLength(2);
  expect(blocks[0].classes()).toContain('van-radio--checked');
  expect(wrapper.findAll('.van-radio__icon')).toHaveLength(0);
});

test('should set columns style when direction is horizontal and shape is block', () => {
  const wrapper = mount({
    render() {
      return (
        <RadioGroup direction="horizontal" shape="block" columns={2}>
          <Radio name="1">Option 1</Radio>
          <Radio name="2">Option 2</Radio>
        </RadioGroup>
      );
    },
  });

  expect(wrapper.classes()).toContain('van-radio-group--horizontal');
  expect(wrapper.classes()).toContain('van-radio-group--block');
  expect(wrapper.attributes('style')).toContain('--van-radio-group-columns: 2');
});

test('should not set columns style when shape is not block', () => {
  const wrapper = mount({
    render() {
      return (
        <RadioGroup direction="horizontal" columns={2}>
          <Radio name="1">Option 1</Radio>
          <Radio name="2">Option 2</Radio>
        </RadioGroup>
      );
    },
  });

  expect(wrapper.classes()).toContain('van-radio-group--horizontal');
  expect(wrapper.classes()).not.toContain('van-radio-group--block');
  expect(wrapper.attributes('style')).toBeUndefined();
});
