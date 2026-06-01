import { FieldChildren } from '..';
import Field from '../../field';
import { mount } from '@vue/test-utils';
import { h } from 'vue';

const fieldSlot = () =>
  h(Field, {
    label: 'L',
    border: false,
  });

test('should render rows from modelValue and add updates model', async () => {
  const wrapper = mount(FieldChildren, {
    props: {
      modelValue: ['a'],
    },
    slots: { default: fieldSlot },
  });

  expect(wrapper.findAll('.van-field-children__item')).toHaveLength(1);

  (wrapper.vm as { add: () => void }).add();
  const emitted = wrapper.emitted('update:modelValue');
  expect(emitted?.[emitted.length - 1]?.[0]).toEqual(['a', '']);
});

test('should remove row on delete icon click', async () => {
  const wrapper = mount(FieldChildren, {
    props: {
      modelValue: ['a', 'b'],
    },
    slots: { default: fieldSlot },
  });

  const rights = wrapper.findAll('.van-field__right-icon');
  expect(rights.length).toBe(2);

  await rights[0].trigger('click');
  const emitted = wrapper.emitted('update:modelValue');
  expect(emitted?.[emitted.length - 1]?.[0]).toEqual(['b']);
});

test('should not inject delete when Field has rightIcon', () => {
  const wrapper = mount(FieldChildren, {
    props: {
      modelValue: ['x'],
    },
    slots: {
      default: () =>
        h(Field, {
          label: 'L',
          rightIcon: 'search',
          border: false,
        }),
    },
  });

  expect(wrapper.find('.van-icon-minus').exists()).toBeFalsy();
  expect(wrapper.find('.van-icon-search').exists()).toBeTruthy();
});

test('should hide delete when item count is minItems', () => {
  const wrapper = mount(FieldChildren, {
    props: {
      modelValue: ['a'],
      minItems: 1,
    },
    slots: { default: fieldSlot },
  });

  expect(wrapper.find('.van-icon-minus').exists()).toBeFalsy();
});

test('should render rows when row prop is provided', () => {
  const wrapper = mount(FieldChildren, {
    props: {
      modelValue: ['a', 'b'],
      row: () =>
        h(Field, {
          label: 'L',
          border: false,
        }),
    },
  });

  expect(wrapper.findAll('.van-field-children__item')).toHaveLength(2);
});

test('should prefer row prop over default slot', () => {
  const wrapper = mount(FieldChildren, {
    props: {
      modelValue: ['a'],
      row: () =>
        h(Field, {
          label: 'FromProp',
          border: false,
        }),
    },
    slots: {
      default: () =>
        h(Field, {
          label: 'FromSlot',
          border: false,
        }),
    },
  });

  expect(wrapper.find('.van-field__label').text()).toBe('FromProp');
});

test('should not add when maxItems reached', () => {
  const wrapper = mount(FieldChildren, {
    props: {
      modelValue: ['a', 'b'],
      maxItems: 2,
    },
    slots: { default: fieldSlot },
  });

  const vm = wrapper.vm as { add: () => void; canAdd: () => boolean };
  expect(vm.canAdd()).toBe(false);
  vm.add();
  expect(wrapper.emitted('update:modelValue')).toBeFalsy();
});
