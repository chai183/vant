import Dialog from '../Dialog';
import { later, mount } from '../../../test';

test('should allow to intercept closing action with before-close prop', async () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      beforeClose: (action) => action === 'cancel',
    },
  });

  const confirm = wrapper.find('.van-dialog__confirm');
  confirm.trigger('click');
  expect(wrapper.emitted('update:show')).toBeFalsy();

  const cancel = wrapper.find('.van-dialog__cancel');
  cancel.trigger('click');
  expect(wrapper.emitted('update:show')).toBeTruthy();
});

test('should change confirm button color when using confirm-button-color prop', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      confirmButtonColor: 'red',
    },
  });
  const confirmButton = wrapper.find('.van-dialog__confirm');
  expect((confirmButton.element as HTMLElement).style.color).toEqual('red');
});

test('should change cancel button color when using cancel-button-color prop', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      cancelButtonColor: 'red',
    },
  });
  const cancelButton = wrapper.find('.van-dialog__cancel');
  expect((cancelButton.element as HTMLElement).style.color).toEqual('red');
});

test('should render button text correctly', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      cancelButtonText: 'Custom Cancel',
      confirmButtonText: 'Custom Confirm',
    },
  });
  expect(wrapper.find('.van-dialog__footer').html()).toMatchSnapshot();
});

test('should render default button text correctly', () => {
  const alertWrapper = mount(Dialog, {
    props: {
      show: true,
    },
  });

  expect(alertWrapper.find('.van-dialog__confirm').text()).toEqual('我知道了');

  const confirmWrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
    },
  });

  expect(confirmWrapper.find('.van-dialog__cancel').text()).toEqual('取消');
  expect(confirmWrapper.find('.van-dialog__confirm').text()).toEqual(
    '主要操作',
  );

  const roundButtonWrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      theme: 'round-button',
    },
  });

  expect(roundButtonWrapper.find('.van-dialog__cancel').text()).toEqual('取消');
  expect(roundButtonWrapper.find('.van-dialog__confirm').text()).toEqual(
    '主要操作',
  );
});

test('should switch to vertical footer when confirm button text is longer than 5 characters', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      confirmButtonText: '操作按钮文案',
    },
  });

  const footer = wrapper.find('.van-dialog__footer');
  const buttons = wrapper.findAll('.van-button').map((button) => button.text());

  expect(footer.classes()).toContain('van-dialog__footer--vertical');
  expect(buttons).toEqual(['操作按钮文案', '取消']);
});

test('should support custom confirm button vertical threshold', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      confirmButtonText: '12345',
      confirmButtonVerticalThreshold: 4,
    },
  });

  expect(wrapper.find('.van-dialog__footer').classes()).toContain(
    'van-dialog__footer--vertical',
  );
});

test('should support secondary button in vertical footer', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      secondaryButtonText: '辅助操作',
    },
  });

  const footer = wrapper.find('.van-dialog__footer');
  const buttons = wrapper.findAll('.van-button').map((button) => button.text());

  expect(footer.classes()).toContain('van-dialog__footer--vertical');
  expect(buttons).toEqual(['主要操作', '辅助操作', '取消']);
  expect(wrapper.find('.van-dialog__cancel').element).toBe(
    wrapper.findAll('.van-button')[2].element,
  );
});

test('should truncate vertical button text to 15 characters', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      confirmButtonText: '1234567890123456',
    },
  });

  expect(wrapper.find('.van-dialog__confirm').text()).toEqual(
    '12345678901234…',
  );
});

test('should support custom vertical button max text length', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      confirmButtonText: '1234567',
      confirmButtonVerticalThreshold: 4,
      verticalButtonMaxTextLength: 6,
    },
  });

  expect(wrapper.find('.van-dialog__confirm').text()).toEqual('12345…');
});

test('should emit secondary event when secondary button is clicked', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      secondaryButtonText: '辅助操作',
    },
  });

  wrapper.find('.van-dialog__secondary').trigger('click');

  expect(wrapper.emitted('secondary')).toBeTruthy();
});

test('should render default slot correctly', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
    },
    slots: {
      default: () => 'Custom Message',
    },
  });
  expect(wrapper.find('.van-dialog__content').html()).toMatchSnapshot();
});

test('should render title slot correctly', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
    },
    slots: {
      title: () => 'Custom Title',
    },
  });
  expect(wrapper.find('.van-dialog__header').html()).toMatchSnapshot();
});

test('should render message as html when using allow-html prop', async () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      message: '<span class="foo">text</span>',
      allowHtml: false,
    },
  });

  expect(wrapper.find('.foo').exists()).toBeFalsy();

  await wrapper.setProps({ allowHtml: true });
  expect(wrapper.find('.foo').exists()).toBeTruthy();
});

test('should render highlighted message when using message-highlight-config prop', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      message: 'Please read the terms carefully before continuing.',
      messageHighlightConfig: {
        keywords: ['terms', 'carefully'],
        color: 'red',
        style: {
          fontWeight: 700,
          fontStyle: 'italic',
        },
      },
    },
  });

  const tags = wrapper.findAll('.van-highlight__tag');

  expect(tags).toHaveLength(2);
  expect(tags[0].text()).toEqual('terms');
  expect(tags[1].text()).toEqual('carefully');
  expect((tags[0].element as HTMLElement).style.color).toEqual('red');
  expect((tags[0].element as HTMLElement).style.fontWeight).toEqual('700');
  expect((tags[0].element as HTMLElement).style.fontStyle).toEqual('italic');
});

test('should adapt highlight component props when using message-highlight-config prop', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      message: 'Terms and terms',
      messageHighlightConfig: {
        keywords: 'Terms',
        caseSensitive: true,
        highlightClass: 'custom-highlight',
        highlightTag: 'mark',
        unhighlightClass: 'custom-unhighlight',
        unhighlightTag: 'i',
      },
    },
  });

  const tags = wrapper.findAll('mark.van-highlight__tag');

  expect(tags).toHaveLength(1);
  expect(tags[0].classes()).toContain('custom-highlight');
  expect(wrapper.find('i.custom-unhighlight').exists()).toBeTruthy();
});

test('should ignore message-highlight-config when allow-html is enabled', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      allowHtml: true,
      message: '<span>terms</span>',
      messageHighlightConfig: {
        keywords: 'terms',
        color: 'red',
      },
    },
  });

  expect(wrapper.find('.van-highlight').exists()).toBeFalsy();
  expect(wrapper.find('.van-dialog__message').html()).toContain(
    '<span>terms</span>',
  );
});

test('should emit open event when show prop is set to true', async () => {
  const onOpen = rs.fn();
  const wrapper = mount(Dialog, {
    props: {
      onOpen,
    },
  });

  await wrapper.setProps({ show: true });
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test('should emit close event when show prop is set to false', async () => {
  const onClose = rs.fn();
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      onClose,
    },
  });

  await wrapper.setProps({ show: false });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('should update width when using width prop', async () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      width: 200,
    },
  });

  const dialog = wrapper.find('.van-dialog').element;
  expect(dialog.style.width).toEqual('200px');
});

test('should render footer slot correctly', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      message: 'message',
    },
    slots: {
      footer: () => 'Custom Footer',
    },
  });
  expect(wrapper.find('.van-dialog').html()).toMatchSnapshot();
});

test('should allow to disable confirm button', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      message: 'message',
      confirmButtonDisabled: true,
    },
  });
  expect(wrapper.find('.van-dialog__confirm').classes()).toContain(
    'van-button--disabled',
  );
});

test('should allow to disable cancel button', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      showCancelButton: true,
      message: 'message',
      cancelButtonDisabled: true,
    },
  });
  expect(wrapper.find('.van-dialog__cancel').classes()).toContain(
    'van-button--disabled',
  );
});

test('should render input without losing message', () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      title: 'Title',
      message: 'Please enter your name',
      inputConfig: {
        placeholder: 'Input your name',
      },
    },
  });

  expect(wrapper.find('.van-dialog__message').text()).toEqual(
    'Please enter your name',
  );
  expect(
    wrapper.find('.van-dialog__input input').attributes('placeholder'),
  ).toBe('Input your name');
});

test('should validate input before confirm when using input config', async () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      inputConfig: {
        placeholder: 'Input your name',
        rules: [{ required: true, message: 'Please input your name' }],
      },
    },
  });

  await wrapper.find('.van-dialog__confirm').trigger('click');
  await later();

  expect(wrapper.emitted('update:show')).toBeFalsy();
  expect(wrapper.find('.van-field__error-message').text()).toEqual(
    'Please input your name',
  );

  await wrapper.find('input').setValue('Vant');
  await later();
  await wrapper.find('.van-dialog__confirm').trigger('click');
  await later();

  expect(wrapper.emitted('confirm')?.[0]).toEqual(['Vant']);
  expect(wrapper.emitted('update:show')?.[0]).toEqual([false]);
});

test('should support textarea input config with word limit', async () => {
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      inputConfig: {
        type: 'textarea',
        maxlength: 10,
        showWordLimit: true,
      },
    },
  });

  const textarea = wrapper.find('textarea');
  expect(textarea.exists()).toBeTruthy();

  await textarea.setValue('12345678901');
  await later();

  expect((textarea.element as HTMLTextAreaElement).value).toEqual('1234567890');
  expect(wrapper.find('.van-field__word-limit').text()).toContain('10/10');
});

test('should pass input value to before-close when using input-config prop', async () => {
  const beforeClose = rs.fn(() => true);
  const wrapper = mount(Dialog, {
    props: {
      show: true,
      beforeClose,
      inputConfig: {
        placeholder: 'Name',
      },
    },
  });

  await wrapper.find('input').setValue('Bob');
  await later();
  await wrapper.find('.van-dialog__confirm').trigger('click');
  await later();

  expect(beforeClose).toHaveBeenCalledWith('confirm', 'Bob');
});
