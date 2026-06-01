import { FieldSelectPopup } from '..';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach } from 'vitest';

const options = [
  { text: 'A', value: 'a' },
  { text: 'B', value: 'b' },
];

afterEach(() => {
  document.body.innerHTML = '';
});

function listRadios() {
  return document.body.querySelectorAll(
    '.van-field-select-popup__body .van-radio',
  );
}

function listCheckboxes() {
  return document.body.querySelectorAll(
    '.van-field-select-popup__body .van-checkbox',
  );
}

test('single list: click option emits modelValue and closes', async () => {
  const wrapper = mount(FieldSelectPopup, {
    props: {
      show: true,
      modelValue: 'a',
      displayText: 'A',
      options,
      title: 'T',
      layout: 'list',
    },
  });

  await nextTick();
  const items = listRadios();
  expect(items.length).toBe(2);

  (items[1] as HTMLElement).dispatchEvent(
    new MouseEvent('click', { bubbles: true }),
  );
  await nextTick();
  expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
  expect(wrapper.emitted('update:show')?.[0]).toEqual([false]);
  wrapper.unmount();
});

test('multi confirm: toggles draft only', async () => {
  const wrapper = mount(FieldSelectPopup, {
    props: {
      show: true,
      modelValue: ['a'],
      displayText: 'A',
      options,
      title: 'T',
      layout: 'list',
      multiple: true,
      draftValue: ['a'],
      toolbar: 'confirm',
    },
  });

  await nextTick();
  const items = listCheckboxes();
  (items[1] as HTMLElement).dispatchEvent(
    new MouseEvent('click', { bubbles: true }),
  );
  await nextTick();
  expect(wrapper.emitted('update:draftValue')?.[0]).toEqual([['a', 'b']]);
  expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  wrapper.unmount();
});

test('list option renders extra display fields', async () => {
  mount(FieldSelectPopup, {
    props: {
      show: true,
      modelValue: '',
      options: [
        {
          text: 'Main',
          subText: 'Sub',
          content: 'Content',
          desc: 'Description',
          value: 'a',
        },
      ],
      title: 'T',
      layout: 'list',
    },
  });

  await nextTick();
  const label = document.body.querySelector('.van-field-select-popup__list-label');
  expect(label?.querySelector('.van-field-select-popup__list-text')?.textContent).toBe(
    'Main',
  );
  expect(
    label?.querySelector('.van-field-select-popup__list-sub-text')?.textContent,
  ).toBe('Sub');
  expect(
    label?.querySelector('.van-field-select-popup__list-content')?.textContent,
  ).toBe('Content');
  expect(label?.querySelector('.van-field-select-popup__list-desc')?.textContent).toBe(
    'Description',
  );
});

test('list option renders Highlight when highlightKeywords is set', async () => {
  mount(FieldSelectPopup, {
    props: {
      show: true,
      modelValue: '',
      options: [
        {
          text: 'Hello World',
          highlightKeywords: 'World',
          value: 'a',
        },
      ],
      title: 'T',
      layout: 'list',
    },
  });

  await nextTick();
  const listText = document.body.querySelector(
    '.van-field-select-popup__list-text',
  );
  expect(listText?.querySelector('.van-highlight')).toBeTruthy();
  expect(listText?.textContent).toBe('Hello World');
});

test('list option renders Highlight for subText, content and desc', async () => {
  mount(FieldSelectPopup, {
    props: {
      show: true,
      modelValue: '',
      options: [
        {
          text: 'Main',
          subText: 'Sub Line',
          subTextHighlightKeywords: 'Line',
          content: 'Body Text',
          contentHighlightKeywords: 'Body',
          desc: 'Desc Here',
          descHighlightKeywords: 'Here',
          value: 'a',
        },
      ],
      title: 'T',
      layout: 'list',
    },
  });

  await nextTick();
  const label = document.body.querySelector('.van-field-select-popup__list-label');
  expect(
    label?.querySelector('.van-field-select-popup__list-sub-text .van-highlight'),
  ).toBeTruthy();
  expect(
    label?.querySelector('.van-field-select-popup__list-content .van-highlight'),
  ).toBeTruthy();
  expect(
    label?.querySelector('.van-field-select-popup__list-desc .van-highlight'),
  ).toBeTruthy();
  expect(
    label?.querySelector('.van-field-select-popup__list-sub-text')?.textContent,
  ).toBe('Sub Line');
  expect(
    label?.querySelector('.van-field-select-popup__list-content')?.textContent,
  ).toBe('Body Text');
  expect(label?.querySelector('.van-field-select-popup__list-desc')?.textContent).toBe(
    'Desc Here',
  );
});

test('single list: showFullOptionLabel renders list-label in display', async () => {
  mount(FieldSelectPopup, {
    props: {
      show: false,
      modelValue: 'a',
      displayText: 'A',
      options: [
        {
          text: 'Main',
          subText: 'Sub',
          value: 'a',
        },
      ],
      title: 'T',
      layout: 'list',
      showFullOptionLabel: true,
    },
  });

  await nextTick();
  const display = document.body.querySelector(
    '.van-field-select-popup__display--full',
  );
  expect(display?.querySelector('.van-field-select-popup__list-label')).toBeTruthy();
  expect(
    display?.querySelector('.van-field-select-popup__list-sub-text')?.textContent,
  ).toBe('Sub');
});

test('click field opens popup', async () => {
  const wrapper = mount(FieldSelectPopup, {
    props: {
      show: false,
      modelValue: '',
      displayText: '',
      options,
      label: 'L',
      layout: 'list',
    },
  });

  await wrapper.find('.van-field__control').trigger('click');
  expect(wrapper.emitted('update:show')?.[0]).toEqual([true]);
  await nextTick();
  wrapper.unmount();
});
