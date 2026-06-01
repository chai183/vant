import { Result } from '..';
import { mount, later } from '../../../test';

test('should render status icon and title', async () => {
  const wrapper = mount(Result, {
    props: {
      status: 'success',
      title: 'Success',
    },
  });

  await later();
  expect(wrapper.find('.van-result__icon--success').exists()).toBe(true);
  expect(wrapper.find('.van-icon-checked').exists()).toBe(true);
  expect(wrapper.find('.van-result__title--success').text()).toBe(
    'Success',
  );
});

test('should render icon with custom size', async () => {
  const wrapper = mount(Result, {
    props: {
      size: 48,
    },
  });

  await later();
  expect(wrapper.find('.van-icon').attributes('style')).toContain('48px');
});

test('should render description and content slot', async () => {
  const wrapper = mount(Result, {
    props: {
      description: 'Note text',
    },
    slots: {
      default: () => 'Custom content',
    },
  });

  await later();
  expect(wrapper.find('.van-result__description').text()).toBe(
    'Note text',
  );
  expect(wrapper.find('.van-result__content').text()).toBe(
    'Custom content',
  );
});

test('should render horizontal actions for waiting status', async () => {
  const wrapper = mount(Result, {
    props: {
      status: 'waiting',
      mainButtonText: 'Main',
      secondaryButtonText: 'Secondary',
    },
  });

  await later();
  expect(wrapper.find('.van-result__actions--horizontal').exists()).toBe(
    true,
  );
  expect(wrapper.findAll('.van-button')).toHaveLength(2);
});

test('should render hybrid actions for warning status', async () => {
  const wrapper = mount(Result, {
    props: {
      status: 'warning',
      mainButtonText: 'Main',
      secondaryButtonText: 'Secondary 1',
      secondaryButtonText2: 'Secondary 2',
    },
  });

  await later();
  expect(wrapper.find('.van-result__actions--hybrid').exists()).toBe(true);
  expect(wrapper.find('.van-result__secondary-row').exists()).toBe(true);
  expect(wrapper.findAll('.van-button')).toHaveLength(3);
});

test('should render actions by button-layout prop', async () => {
  const wrapper = mount(Result, {
    props: {
      status: 'success',
      buttonLayout: 'vertical',
      mainButtonText: 'Main',
      secondaryButtonText: 'Secondary',
    },
  });

  await later();
  expect(wrapper.find('.van-result__actions--vertical').exists()).toBe(
    true,
  );
});

test('should render hybrid layout with one secondary button', async () => {
  const wrapper = mount(Result, {
    props: {
      buttonLayout: 'hybrid',
      mainButtonText: 'Main',
      secondaryButtonText: 'Secondary',
    },
  });

  await later();
  expect(wrapper.find('.van-result__actions--hybrid').exists()).toBe(true);
  expect(wrapper.find('.van-result__secondary-row').exists()).toBe(true);
  expect(wrapper.findAll('.van-button')).toHaveLength(2);
});

test('should emit button click events', async () => {
  const wrapper = mount(Result, {
    props: {
      status: 'fail',
      mainButtonText: 'Main',
      secondaryButtonText: 'Secondary',
    },
  });

  await later();
  await wrapper.findAll('.van-button')[0].trigger('click');
  await wrapper.findAll('.van-button')[1].trigger('click');

  expect(wrapper.emitted('clickMainButton')).toHaveLength(1);
  expect(wrapper.emitted('clickSecondaryButton')).toHaveLength(1);
});
