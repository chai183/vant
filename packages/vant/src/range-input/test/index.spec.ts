import { h } from 'vue';
import { Field } from '../../field';
import { RangeInput } from '..';
import { mount } from '../../../test';

test('should render vertical layout with separator column', () => {
  const wrapper = mount(RangeInput, {
    props: {
      layout: 'vertical',
    },
    slots: {
      default: () => [
        h('div', { class: 'a' }, '1'),
        h('div', { class: 'b' }, '2'),
      ],
    },
  });
  expect(wrapper.find('.van-range-input__body--vertical').exists()).toBeTruthy();
  expect(wrapper.find('.van-range-input__v-sep--default').exists()).toBe(true);
  expect(wrapper.find('.van-range-input__v-sep--label').text()).toBe('至');
});

test('should render horizontal layout with line separator', () => {
  const wrapper = mount(RangeInput, {
    props: {
      layout: 'horizontal',
    },
    slots: {
      default: () => [h('span', 'a'), h('span', 'b')],
    },
  });
  expect(wrapper.find('.van-range-input__body--horizontal').exists()).toBeTruthy();
  expect(wrapper.find('.van-range-input__h-sep--line').exists()).toBeTruthy();
});

test('should bind v-model to first two slot fields', async () => {
  const wrapper = mount(RangeInput, {
    props: {
      modelValue: ['m', 'n'],
      layout: 'vertical',
    },
    slots: {
      default: () => [
        h(Field, { border: false, placeholder: 'a' }),
        h(Field, { border: false, placeholder: 'b' }),
      ],
    },
  });

  const inputs = wrapper.findAll('input');
  expect(inputs.length).toBe(2);
  expect((inputs[0].element as HTMLInputElement).value).toBe('m');
  expect((inputs[1].element as HTMLInputElement).value).toBe('n');

  await inputs[0].setValue('p');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['p', 'n']]);
});

test('should render body when start and end props are provided', () => {
  const wrapper = mount(RangeInput, {
    props: {
      layout: 'horizontal',
      start: () => h('span', { class: 'start' }, 'a'),
      end: () => h('span', { class: 'end' }, 'b'),
    },
  });
  expect(wrapper.find('.van-range-input__body--horizontal').exists()).toBeTruthy();
  expect(wrapper.find('.start').exists()).toBeTruthy();
  expect(wrapper.find('.end').exists()).toBeTruthy();
});

test('should render body when start and end slots are provided', () => {
  const wrapper = mount(RangeInput, {
    props: { layout: 'vertical' },
    slots: {
      start: () => h('span', { class: 'start' }, 'a'),
      end: () => h('span', { class: 'end' }, 'b'),
    },
  });
  expect(wrapper.find('.van-range-input__body--vertical').exists()).toBeTruthy();
});

test('should prefer start and end props over default slot', () => {
  const wrapper = mount(RangeInput, {
    props: {
      layout: 'horizontal',
      start: () => h('span', { class: 'from-prop' }, 'a'),
      end: () => h('span', { class: 'from-prop' }, 'b'),
    },
    slots: {
      default: () => [h('span', { class: 'from-slot' }, 'x')],
    },
  });
  expect(wrapper.find('.from-prop').exists()).toBeTruthy();
  expect(wrapper.find('.from-slot').exists()).toBe(false);
});

test('should not render body when children count is not 2', () => {
  const one = mount(RangeInput, {
    props: { layout: 'vertical' },
    slots: { default: () => [h('i')] },
  });
  expect(one.find('.van-range-input__body').exists()).toBe(false);

  const three = mount(RangeInput, {
    props: { layout: 'vertical' },
    slots: { default: () => [h('i'), h('i'), h('i')] },
  });
  expect(three.find('.van-range-input__body').exists()).toBe(false);

  const none = mount(RangeInput, {
    props: { layout: 'vertical' },
  });
  expect(none.find('.van-range-input__body').exists()).toBe(false);
});

test('should render shortcuts and update modelValue on click', async () => {
  const wrapper = mount(RangeInput, {
    props: {
      layout: 'vertical',
      modelValue: ['', ''],
      shortcuts: [
        { label: '近一周', value: ['1', '7'] },
        { label: '近一月', value: ['1', '30'] },
      ],
    },
    slots: {
      default: () => [
        h(Field, { border: false, placeholder: 'a' }),
        h(Field, { border: false, placeholder: 'b' }),
      ],
    },
  });

  const items = wrapper.findAll('.van-range-input__shortcut');
  expect(items.length).toBe(2);
  expect(items[0].text()).toBe('近一周');

  await items[0].trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['1', '7']]);
});

test('should render default date shortcuts when showDateShortcuts is true', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 20));

  const wrapper = mount(RangeInput, {
    props: {
      layout: 'vertical',
      modelValue: ['', ''],
      showDateShortcuts: true,
    },
    slots: {
      default: () => [
        h(Field, { border: false, placeholder: 'a' }),
        h(Field, { border: false, placeholder: 'b' }),
      ],
    },
  });

  const items = wrapper.findAll('.van-range-input__shortcut');
  expect(items.length).toBe(3);
  expect(items[0].text()).toBe('Last week');
  expect(items[2].text()).toBe('Last 3 months');

  await items[0].trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
    ['2026-05-14', '2026-05-20'],
  ]);

  await items[2].trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([
    ['2026-02-20', '2026-05-20'],
  ]);

  vi.useRealTimers();
});

test('should render partial date shortcuts when showDateShortcuts is an array', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 4, 20));

  const wrapper = mount(RangeInput, {
    props: {
      layout: 'vertical',
      modelValue: ['', ''],
      showDateShortcuts: ['lastWeek', 'lastMonth'],
    },
    slots: {
      default: () => [
        h(Field, { border: false, placeholder: 'a' }),
        h(Field, { border: false, placeholder: 'b' }),
      ],
    },
  });

  const items = wrapper.findAll('.van-range-input__shortcut');
  expect(items.length).toBe(2);
  expect(items[0].text()).toBe('Last week');
  expect(items[1].text()).toBe('Last month');

  await items[1].trigger('click');
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
    ['2026-04-21', '2026-05-20'],
  ]);

  vi.useRealTimers();
});
