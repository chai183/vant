import { FieldMoney } from '..';
import { mount, later } from '../../../test';

test('should render money field with currency prefix', async () => {
  const wrapper = mount(FieldMoney, {
    props: {
      label: 'Amount',
      placeholder: 'Enter amount',
    },
  });

  await later();
  expect(wrapper.find('.van-field-money').exists()).toBe(true);
  expect(wrapper.find('.van-field-money__currency').text()).toBe('¥');
  expect(wrapper.find('input').attributes('inputmode')).toBe('decimal');
});

test('should emit update:modelValue when input changes', async () => {
  const wrapper = mount(FieldMoney);

  await later();
  const input = wrapper.find('input');
  input.element.value = '1234.56';
  await input.trigger('input');
  await later();

  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('1234.56');
});

test('should render money uppercase when value is set', async () => {
  const wrapper = mount(FieldMoney, {
    props: {
      modelValue: '100',
      moneyUppercaseLabel: 'Uppercase',
    },
  });

  await later();
  expect(wrapper.find('.van-field__money-uppercase').exists()).toBe(true);
  expect(wrapper.find('.van-field__money-uppercase-label').text()).toBe(
    'Uppercase',
  );
});

test('should apply filled currency color when modelValue is set', async () => {
  const wrapper = mount(FieldMoney, {
    props: {
      modelValue: '100',
    },
  });

  await later();
  expect(wrapper.find('.van-field-money__currency--filled').exists()).toBe(
    true,
  );
});

test('should not apply filled currency color when modelValue is empty', async () => {
  const wrapper = mount(FieldMoney);

  await later();
  expect(wrapper.find('.van-field-money__currency--filled').exists()).toBe(
    false,
  );
});

test('should support custom currency via input-left slot', async () => {
  const wrapper = mount(FieldMoney, {
    props: {
      currency: '$',
    },
    slots: {
      'input-left': () => '$',
    },
  });

  await later();
  expect(wrapper.find('.van-field-money__currency').exists()).toBe(false);
  expect(wrapper.text()).toContain('$');
});
