import { PullRefresh } from '..';
import {
  mount,
  later,
  trigger,
  triggerDrag,
  mockScrollTop,
} from '../../../test';
import { closeToast } from '../../toast';

test('should render different head content in different pulling status', async () => {
  const wrapper = mount(PullRefresh);
  const track = wrapper.find('.van-pull-refresh__track');

  await mockScrollTop(0);

  // pulling
  trigger(track, 'touchstart', 0, 0);
  trigger(track, 'touchmove', 0, 20);
  await later();
  expect(wrapper.html()).toMatchSnapshot();

  // loosing
  trigger(track, 'touchmove', 0, 100);
  await later();
  expect(wrapper.html()).toMatchSnapshot();

  // loading
  trigger(track, 'touchend', 0, 100);
  await later();
  expect(wrapper.html()).toMatchSnapshot();

  // still loading
  triggerDrag(track, 0, 100);
  await later();
  expect(wrapper.html()).toMatchSnapshot();

  expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  expect(wrapper.emitted('refresh')).toBeTruthy();

  // end loading
  await wrapper.setProps({ modelValue: true });
  await wrapper.setProps({ modelValue: false });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render status slots correctly', async () => {
  const wrapper = mount(PullRefresh, {
    slots: {
      pulling({ distance }) {
        return `pulling ${distance}`;
      },
      loosing({ distance }) {
        return `loosing ${distance}`;
      },
      loading({ distance }) {
        return `loading ${distance}`;
      },
    },
  });

  const track = wrapper.find('.van-pull-refresh__track');

  // pulling
  trigger(track, 'touchstart', 0, 0);
  trigger(track, 'touchmove', 0, 20);
  await later();
  expect(wrapper.html()).toMatchSnapshot();

  // loosing
  trigger(track, 'touchmove', 0, 75);
  trigger(track, 'touchmove', 0, 100);
  await later();
  expect(wrapper.html()).toMatchSnapshot();

  // loading
  trigger(track, 'touchend', 0, 100);
  await later();
  expect(wrapper.html()).toMatchSnapshot();
});

test('should not emit update:modelValue event after pulling a short distance', () => {
  const wrapper = mount(PullRefresh);
  const track = wrapper.find('.van-pull-refresh__track');
  triggerDrag(track, 0, 10);
  expect(wrapper.emitted('update:modelValue')).toBeFalsy();
});

test('should not trigger pull refresh when not in page top', async () => {
  const wrapper = mount(PullRefresh);
  const track = wrapper.find('.van-pull-refresh__track');

  // ignore touch event when not at page top
  await mockScrollTop(1);
  triggerDrag(track, 0, 100);
  expect(wrapper.emitted('update:modelValue')).toBeFalsy();

  await mockScrollTop(0);
  triggerDrag(track, 0, 100);
  expect(wrapper.emitted('update:modelValue')).toBeTruthy();
});

test('should render success text correctly', async () => {
  const wrapper = mount(PullRefresh, {
    props: {
      successText: 'success',
      successDuration: 0,
    },
  });

  const track = wrapper.find('.van-pull-refresh__track');
  triggerDrag(track, 0, 100);

  await later();

  // loading
  expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
  await wrapper.setProps({ modelValue: true });

  // success
  await wrapper.setProps({ modelValue: false });
  expect(wrapper.html()).toMatchSnapshot();

  // normal
  await later();
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render success slot correctly', async () => {
  const wrapper = mount(PullRefresh, {
    slots: {
      success: () => 'Custom Success',
    },
  });

  // loading
  const track = wrapper.find('.van-pull-refresh__track');
  triggerDrag(track, 0, 100);
  expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
  await wrapper.setProps({ modelValue: true });

  // success
  await wrapper.setProps({ modelValue: false });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render custom status icons correctly', async () => {
  const loadingIcon = 'https://img.yzcdn.cn/vant/cat.jpeg';
  const wrapper = mount(PullRefresh, {
    props: {
      pullingIcon: 'success',
      loosingIcon: 'arrow-up',
      loadingIcon,
      successIcon: 'checked',
      successText: 'success',
      successDuration: 0,
    },
  });
  const track = wrapper.find('.van-pull-refresh__track');

  trigger(track, 'touchstart', 0, 0);
  trigger(track, 'touchmove', 0, 20);
  await later();
  expect(wrapper.find('.van-icon-success').exists()).toBeTruthy();

  trigger(track, 'touchmove', 0, 100);
  await later();
  expect(wrapper.find('.van-icon-arrow-up').exists()).toBeTruthy();
  expect(
    wrapper.find('.van-pull-refresh__status-icon--reverse').exists(),
  ).toBeFalsy();

  trigger(track, 'touchend', 0, 100);
  await later();
  expect(wrapper.find(`img[src="${loadingIcon}"]`).exists()).toBeTruthy();

  await wrapper.setProps({ modelValue: true });
  await wrapper.setProps({ modelValue: false });
  expect(wrapper.find('.van-icon-checked').exists()).toBeTruthy();
});

test('should emit error event when refresh error callback called', async () => {
  const wrapper = mount(PullRefresh, {
    props: {
      errorText: 'network error',
      successText: 'success',
    },
  });
  const track = wrapper.find('.van-pull-refresh__track');
  const error = new Error('network error');

  triggerDrag(track, 0, 100);
  await later();
  await wrapper.setProps({ modelValue: true });

  const refreshParams = wrapper.emitted('refresh')![0][0] as {
    error: (error?: unknown) => void;
  };
  refreshParams.error(error);

  expect(wrapper.emitted('error')![0]).toEqual([error]);
  expect(wrapper.emitted('update:modelValue')![1]).toEqual([false]);

  await wrapper.setProps({ modelValue: false });
  expect(wrapper.find('.van-pull-refresh__success').exists()).toBeFalsy();
  closeToast(true);
});

test('should set height when using head-height', async () => {
  const wrapper = mount(PullRefresh, {
    props: {
      headHeight: 100,
    },
  });
  const head = wrapper.find('.van-pull-refresh__head');
  expect(head.element.style.height).toEqual('100px');
});

test('should allow to custom pull distance', async () => {
  const wrapper = mount(PullRefresh, {
    props: {
      pullDistance: 300,
    },
  });
  const track = wrapper.find('.van-pull-refresh__track');

  trigger(track, 'touchstart', 0, 0);
  trigger(track, 'touchmove', 0, 100);
  await later();
  expect(wrapper.html()).toMatchSnapshot();
});

test('should emit change event when status changed', async () => {
  const wrapper = mount(PullRefresh);
  const track = wrapper.find('.van-pull-refresh__track');
  trigger(track, 'touchstart', 0, 0);
  trigger(track, 'touchmove', 0, 20);
  await later();
  expect(wrapper.emitted('change')).toEqual([
    [{ distance: 20, status: 'pulling' }],
  ]);
});
