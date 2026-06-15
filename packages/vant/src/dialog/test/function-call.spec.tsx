import { later } from '../../../test';
import {
  showDialog,
  closeDialog,
  showConfirmDialog,
  setDialogDefaultOptions,
  resetDialogDefaultOptions,
} from '../function-call';

test('should update default options when calling setDefaultOptions method', async () => {
  const wrapper = document.createElement('div');
  const text = 'hello world';

  setDialogDefaultOptions({ message: text });
  showDialog({ teleport: wrapper });
  await later();
  const dialog = wrapper.querySelector('.van-dialog');

  assert(dialog);
  expect(dialog.innerHTML.includes(text)).toBeTruthy();

  resetDialogDefaultOptions();
  showDialog({ teleport: wrapper });
  await later();
  const dialog2 = wrapper.querySelector('.van-dialog');

  assert(dialog2);
  expect(dialog2.innerHTML.includes(text)).toBeFalsy();
});

test('should render dialog after calling showDialog', async () => {
  const wrapper = document.createElement('div');
  showDialog({
    message: '1',
    teleport: wrapper,
  });

  await later();
  const dialog = wrapper.querySelector('.van-dialog');
  expect(dialog).toBeTruthy();
});

test('should render default button text after calling dialog methods', async () => {
  const alertWrapper = document.createElement('div');
  showDialog({
    message: '1',
    teleport: alertWrapper,
  });

  await later();
  expect(
    alertWrapper.querySelector('.van-dialog__confirm')?.textContent?.trim(),
  ).toEqual('我知道了');

  const confirmWrapper = document.createElement('div');
  showConfirmDialog({
    message: '1',
    teleport: confirmWrapper,
  });

  await later();
  expect(
    confirmWrapper.querySelector('.van-dialog__cancel')?.textContent?.trim(),
  ).toEqual('取消');
  expect(
    confirmWrapper.querySelector('.van-dialog__confirm')?.textContent?.trim(),
  ).toEqual('主要操作');
});

test('should support custom vertical footer options after calling showConfirmDialog', async () => {
  const wrapper = document.createElement('div');
  showConfirmDialog({
    message: '1',
    teleport: wrapper,
    confirmButtonText: '1234567',
    confirmButtonVerticalThreshold: 4,
    verticalButtonMaxTextLength: 6,
  });

  await later();
  expect(
    wrapper
      .querySelector('.van-dialog__footer')
      ?.className.includes('van-dialog__footer--vertical'),
  ).toBeTruthy();
  expect(
    wrapper.querySelector('.van-dialog__confirm')?.textContent?.trim(),
  ).toEqual('12345…');

  closeDialog();
  await later();
});

test('should resolve secondary action after calling showConfirmDialog', async () => {
  const wrapper = document.createElement('div');
  const action = showConfirmDialog({
    message: '1',
    teleport: wrapper,
    secondaryButtonText: '辅助操作',
  });

  await later();
  expect(
    wrapper
      .querySelector('.van-dialog__footer')
      ?.className.includes('van-dialog__footer--vertical'),
  ).toBeTruthy();

  (wrapper.querySelector('.van-dialog__secondary') as HTMLElement).click();

  expect(await action).toEqual('secondary');
});

test('should close dialog after calling closeDialog', async () => {
  const wrapper = document.createElement('div');
  showDialog({
    message: '1',
    teleport: wrapper,
  });

  await later();
  const dialog = wrapper.querySelector('.van-dialog') as HTMLElement;

  expect(dialog.style.display).toEqual('');

  closeDialog();
  await later();
  await later();
  expect(
    !document.body.contains(dialog) ||
      dialog.className.split(' ').includes('van-dialog-bounce-leave-active') ||
      dialog.style.display === 'none',
  ).toBeTruthy();
});

test('should allow to render JSX message', async () => {
  const wrapper = document.createElement('div');
  showDialog({
    message: () => <div>foo</div>,
    teleport: wrapper,
  });

  await later();
  const dialog = wrapper.querySelector('.van-dialog') as HTMLElement;
  expect(
    dialog.querySelector('.van-dialog__message')?.outerHTML,
  ).toMatchSnapshot();
});

test('should render highlighted message after calling showDialog', async () => {
  const wrapper = document.createElement('div');
  showDialog({
    message: 'Please read the terms carefully before continuing.',
    teleport: wrapper,
    messageHighlightConfig: {
      keywords: ['terms', 'carefully'],
      color: 'red',
      style: {
        fontWeight: 700,
      },
    },
  });

  await later();

  const tags = wrapper.querySelectorAll('.van-highlight__tag');

  expect(tags.length).toEqual(2);
  expect(tags[0].textContent?.trim()).toEqual('terms');
  expect((tags[0] as HTMLElement).style.color).toEqual('red');
  expect((tags[0] as HTMLElement).style.fontWeight).toEqual('700');

  closeDialog();
  await later();
});

test('should render input and return current input value after calling showDialog', async () => {
  const wrapper = document.createElement('div');
  const callback = rs.fn();
  const action = showDialog({
    message: 'Please enter your name',
    teleport: wrapper,
    callback,
    inputConfig: {
      placeholder: 'Input your name',
      defaultValue: 'Tom',
    },
  });

  await later();

  expect(
    wrapper.querySelector('.van-dialog__message')?.textContent?.trim(),
  ).toEqual('Please enter your name');

  const input = wrapper.querySelector('input') as HTMLInputElement;
  expect(input.placeholder).toEqual('Input your name');
  expect(input.value).toEqual('Tom');

  input.value = 'Jerry';
  input.dispatchEvent(new Event('input'));
  await later();

  (wrapper.querySelector('.van-dialog__confirm') as HTMLElement).click();

  expect(await action).toEqual('confirm');
  expect(callback).toHaveBeenCalledWith('confirm', 'Jerry');
});

test('should sync input value after calling showConfirmDialog with input-config', async () => {
  const wrapper = document.createElement('div');
  let inputValue = '';

  const action = showConfirmDialog({
    title: 'Title',
    message: 'Please enter your name',
    teleport: wrapper,
    inputConfig: {
      placeholder: 'Name',
      rules: [{ required: true, message: 'Name is required' }],
    },
    'onUpdate:inputValue': (value) => {
      inputValue = value;
    },
  });

  await later();

  const input = wrapper.querySelector('input') as HTMLInputElement;
  expect(wrapper.querySelector('.van-dialog__message')?.textContent).toContain(
    'Please enter your name',
  );

  input.value = 'Alice';
  input.dispatchEvent(new Event('input'));
  await later();

  (wrapper.querySelector('.van-dialog__confirm') as HTMLElement).click();

  expect(await action).toEqual('confirm');
  expect(inputValue).toEqual('Alice');

  closeDialog();
  await later();
});
