import { AreaStepCascader } from '..';
import { mount, later } from '../../../test';
import type { CascaderOption } from '../../cascader';

const options: CascaderOption[] = [
  {
    text: 'Zhejiang',
    value: '330000',
    children: [
      {
        text: 'Hangzhou',
        value: '330100',
        children: [{ text: 'Xihu', value: '330106' }],
      },
    ],
  },
];

test('should render step layout cascader with area level label', async () => {
  const wrapper = mount(AreaStepCascader, {
    props: {
      options,
    },
  });

  await later();
  expect(wrapper.find('.van-cascader--steps').exists()).toBe(true);
  expect(wrapper.find('.van-area-step-cascader__level').exists()).toBe(true);
});

test('should emit update:modelValue and finish', async () => {
  const wrapper = mount(AreaStepCascader, {
    props: {
      options,
    },
  });

  await later();
  await wrapper.find('.van-cascader__option').trigger('click');
  await later();

  await wrapper
    .findAll('.van-cascader__options')[1]
    .find('.van-cascader__option')
    .trigger('click');
  await later();

  await wrapper
    .findAll('.van-cascader__options')[2]
    .find('.van-cascader__option')
    .trigger('click');
  await later();

  expect(wrapper.emitted('finish')?.[0]?.[0]).toMatchObject({
    value: '330106',
  });
});

test('should emit close', async () => {
  const wrapper = mount(AreaStepCascader, {
    props: {
      options,
    },
  });

  await wrapper.find('.van-cascader__close-icon').trigger('click');
  expect(wrapper.emitted('close')).toBeTruthy();
});
