import { mount } from '../../../test';
import { Button } from '..';

test('should emit click event', () => {
  const wrapper = mount(Button);

  wrapper.trigger('click');
  expect(wrapper.emitted('click')).toHaveLength(1);
});

test('should not emit click event when disabled', () => {
  const wrapper = mount(Button, {
    props: {
      disabled: true,
    },
  });

  wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeFalsy();
});

test('should not emit click event when loading', () => {
  const wrapper = mount(Button, {
    props: {
      loading: true,
    },
  });

  wrapper.trigger('click');
  expect(wrapper.emitted('click')).toBeFalsy();
});

test('should hide border when color is gradient', () => {
  const wrapper = mount(Button, {
    props: {
      color: 'linear-gradient(#000, #fff)',
    },
  });

  expect(
    wrapper.element.style.getPropertyValue('--van-button-custom-border-color'),
  ).toBe('transparent');
});

test('should apply borderColor prop correctly', () => {
  const wrapper = mount(Button, {
    props: {
      color: 'linear-gradient(#000, #fff)',
      borderColor: '#FF3333',
      text: 'Button',
    },
  });

  expect(
    wrapper.element.style.getPropertyValue('--van-button-custom-border-color'),
  ).toBe('#FF3333');
});

test('should apply borderColor prop without color', () => {
  const wrapper = mount(Button, {
    props: {
      borderColor: '#FF3333',
      text: 'Button',
    },
  });

  expect(
    wrapper.element.style.getPropertyValue('--van-button-custom-border-color'),
  ).toBe('#FF3333');
});

test('should hide border when borderless prop is true', () => {
  const wrapper = mount(Button, {
    props: {
      borderless: true,
      text: 'Borderless',
    },
  });

  expect(wrapper.classes()).toContain('van-button--borderless');
});

test('should render text button correctly', () => {
  const wrapper = mount(Button, {
    props: {
      textButton: true,
      text: 'Text Button',
      icon: 'plus',
    },
  });

  expect(wrapper.classes()).toContain('van-button--text');
  expect(wrapper.html()).toMatchSnapshot();
});

test('should change icon class prefix when using icon-prefix prop', () => {
  const wrapper = mount(Button, {
    props: {
      icon: 'success',
      iconPrefix: 'my-icon',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should render loading slot correctly', () => {
  const wrapper = mount(Button, {
    props: {
      loading: true,
    },
    slots: {
      loading: () => 'Custom Loading',
    },
  });

  expect(wrapper.html()).toMatchSnapshot();
});

test('should render loading of a specific size when using loading-size prop', () => {
  const wrapper = mount(Button, {
    props: {
      loading: true,
      loadingSize: '10px',
    },
  });

  const loading = wrapper.find('.van-loading__spinner');
  expect(loading.style.width).toEqual('10px');
  expect(loading.style.height).toEqual('10px');
});

test('should render icon in the right side when setting icon-position to right', () => {
  const wrapper = mount(Button, {
    props: {
      icon: 'plus',
      iconPosition: 'right',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test('should render extra slot when size is large', () => {
  const wrapper = mount(Button, {
    props: {
      size: 'large',
      text: 'Button',
    },
    slots: {
      extra: () => 'Extra Content',
    },
  });

  expect(wrapper.find('.van-button__extra').exists()).toBe(true);
  expect(wrapper.classes()).toContain('van-button--with-extra');
  expect(wrapper.html()).toMatchSnapshot();
});

test('should not render extra slot when size is not large', () => {
  const wrapper = mount(Button, {
    props: {
      size: 'normal',
      text: 'Button',
    },
    slots: {
      extra: () => 'Extra Content',
    },
  });

  expect(wrapper.find('.van-button__extra').exists()).toBe(false);
});

test('should render plain text button with text-secondary correctly', () => {
  const wrapper = mount(Button, {
    props: {
      textButton: true,
      plain: true,
      textSecondary: true,
      text: 'Secondary',
    },
  });

  expect(wrapper.classes()).toContain('van-button--text-secondary');
  expect(wrapper.html()).toMatchSnapshot();
});

test('should apply custom size props correctly', () => {
  const wrapper = mount(Button, {
    props: {
      type: 'default',
      plain: true,
      size: 'normal',
      height: 36,
      radius: 8,
      fontSize: 12,
      textColor: '#666',
      text: 'Upload',
    },
  });

  expect(wrapper.element.style.getPropertyValue('--van-button-custom-height')).toBe(
    '36px',
  );
  expect(wrapper.element.style.getPropertyValue('--van-button-custom-radius')).toBe(
    '8px',
  );
  expect(
    wrapper.element.style.getPropertyValue('--van-button-custom-font-size'),
  ).toBe('12px');
  expect(wrapper.element.style.fontSize).toBe('12px');
  expect(
    wrapper.element.style.getPropertyValue('--van-button-custom-content-color'),
  ).toBe('#666');
});

test('should apply custom padding props correctly', () => {
  const wrapper = mount(Button, {
    props: {
      size: 'normal',
      text: 'Button',
      paddingLeft: 12,
      paddingRight: 20,
    },
  });

  expect(wrapper.element.style.paddingLeft).toBe('12px');
  expect(wrapper.element.style.paddingRight).toBe('20px');
});

test('should render icon slot correctly', () => {
  const wrapper = mount(Button, {
    slots: {
      default: () => 'Text',
      icon: () => 'Custom Icon',
    },
  });
  expect(wrapper.html()).toMatchSnapshot();
});
