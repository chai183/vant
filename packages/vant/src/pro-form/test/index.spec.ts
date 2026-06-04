import { h, defineComponent } from 'vue';
import { useCustomFieldValue } from '@vant/use';
import { ProForm } from '..';
import type { ProFormRenderContext } from '../types';
import { Field } from '../../field';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

const TestDeliveryField = defineComponent({
  props: {
    modelValue: {
      type: Object as () => { date: string; period: string } | undefined,
      default: undefined,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    useCustomFieldValue(() => props.modelValue);
    return () =>
      h(
        'button',
        {
          type: 'button',
          class: 'delivery-field',
          onClick: () =>
            emit('update:modelValue', { date: '2026/1/1', period: 'am' }),
        },
        'pick',
      );
  },
});

test('should render columns and emit submit with values', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        { name: 'switch', label: 'Switch', component: 'switch' },
        {
          name: 'username',
          label: 'Name',
          component: 'field',
          defaultValue: 'vant',
        },
      ],
      showSubmit: true,
      submitText: 'Go',
      onSubmit,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-switch').exists()).toBe(true);
  expect(wrapper.find('.van-field').exists()).toBe(true);

  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  const values = onSubmit.mock.calls[0][0] as Record<string, unknown>;
  expect(values.username).toBe('vant');
  expect(values.switch).toBe(false);
});

test('should render custom field slot and emit update', async () => {
  const onUpdateModelValue = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      modelValue: { contactName: 'Tom' },
      columns: [
        {
          name: 'contactName',
          label: 'Contact',
          slot: 'contact',
        },
      ],
      showSubmit: false,
      'onUpdate:modelValue': onUpdateModelValue,
    },
    slots: {
      'field-contact': ({
        column,
        value,
        setValue,
      }: Pick<ProFormRenderContext, 'column' | 'value' | 'setValue'>) =>
        h(
          'button',
          {
            type: 'button',
            class: 'field-contact',
            onClick: () => setValue('Alex'),
          },
          `${column.label}: ${value}`,
        ),
    },
  });

  await nextTick();
  expect(wrapper.find('.field-contact').text()).toBe('Contact: Tom');

  await wrapper.find('.field-contact').trigger('click');
  expect(onUpdateModelValue).toHaveBeenCalledWith({ contactName: 'Alex' });
});

test('should render radioGroup from componentProps.options without duplicate radios', async () => {
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'gender',
          label: 'Gender',
          component: 'radioGroup',
          defaultValue: '1',
          componentProps: {
            shape: 'block',
            direction: 'horizontal',
            options: [
              { label: 'A', value: '1' },
              { label: 'B', value: '2' },
            ],
          },
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  expect(wrapper.findAll('.van-radio').length).toBe(2);
});

test('should not generate default options for builtin option components', async () => {
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'radio',
          label: 'Radio',
          component: 'radioGroup',
        },
        {
          name: 'checkbox',
          label: 'Checkbox',
          component: 'checkboxGroup',
        },
        {
          name: 'radioPicker',
          label: 'Radio Picker',
          component: 'radioPicker',
        },
        {
          name: 'checkboxPicker',
          label: 'Checkbox Picker',
          component: 'checkboxPicker',
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  expect(wrapper.findAll('.van-radio')).toHaveLength(0);
  expect(wrapper.findAll('.van-checkbox')).toHaveLength(0);
});

test('should render uploaderFile', async () => {
  const onSubmit = vi.fn();
  const fileList = [
    {
      url: 'https://example.com/a.pdf',
      status: 'done',
      file: { name: 'a.pdf' } as File,
    },
  ];

  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'attachments',
          label: 'Files',
          component: 'uploaderFile',
          defaultValue: fileList,
          componentProps: {
            readonly: true,
          },
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-uploader-file').exists()).toBe(true);
  expect(wrapper.find('.van-pro-form-uploader-file').exists()).toBe(true);

  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  expect(
    (onSubmit.mock.calls[0][0] as Record<string, unknown>).attachments,
  ).toEqual(fileList);
});

test('should render rangeInput', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'range',
          label: 'Range',
          component: 'rangeInput',
          defaultValue: ['10', '20'],
          componentProps: {
            layout: 'horizontal',
            start: () => h(Field, { inputBorder: true, placeholder: 'Min' }),
            end: () => h(Field, { inputBorder: true, placeholder: 'Max' }),
          },
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-range-input').exists()).toBe(true);
  expect(wrapper.find('.van-range-input__field').exists()).toBe(true);
  expect(wrapper.findAll('.van-range-input .van-field')).toHaveLength(2);

  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  expect((onSubmit.mock.calls[0][0] as Record<string, unknown>).range).toEqual([
    '10',
    '20',
  ]);
});

test('should render fieldChildren', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'options',
          label: 'Options',
          component: 'fieldChildren',
          defaultValue: ['a', 'b'],
          componentProps: {
            addText: 'Add',
            row: () =>
              h(Field, { label: 'Option', placeholder: 'Enter', border: false }),
          },
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-pro-form-field-children').exists()).toBe(true);
  expect(wrapper.find('.van-field-children').exists()).toBe(true);
  expect(wrapper.findAll('.van-field-children__item')).toHaveLength(2);

  await wrapper.find('.van-field__label-action').trigger('click');
  await nextTick();
  expect(wrapper.findAll('.van-field-children__item')).toHaveLength(3);

  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  expect((onSubmit.mock.calls[0][0] as Record<string, unknown>).options).toEqual(
    ['a', 'b', ''],
  );
});

test('should render fieldMoney', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'amount',
          label: 'Amount',
          component: 'fieldMoney',
          defaultValue: '1000',
          fieldProps: { placeholder: 'Enter amount' },
          componentProps: { currency: '¥' },
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-field-money').exists()).toBe(true);

  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  expect((onSubmit.mock.calls[0][0] as Record<string, unknown>).amount).toBe(
    '1000',
  );
});

test('should render picker field', async () => {
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'city',
          label: 'City',
          component: 'picker',
          fieldProps: { placeholder: 'Select' },
          componentProps: {
            columns: [{ text: 'A', value: 'a' }],
          },
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-field').exists()).toBe(true);
});

test('should render radioPicker field', async () => {
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'gender',
          label: 'Gender',
          component: 'radioPicker',
          defaultValue: 'male',
          fieldProps: { placeholder: 'Select' },
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-field').exists()).toBe(true);
});

test('should render checkboxPicker field', async () => {
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'hobbies',
          label: 'Hobbies',
          component: 'checkboxPicker',
          defaultValue: ['reading'],
          fieldProps: { placeholder: 'Select' },
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Sports', value: 'sports' },
          ],
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-field').exists()).toBe(true);
});

test('should submit option value for radioPicker and checkboxPicker', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'gender',
          label: 'Gender',
          component: 'radioPicker',
          defaultValue: 'male',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
        {
          name: 'hobbies',
          label: 'Hobbies',
          component: 'checkboxPicker',
          defaultValue: ['reading'],
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Sports', value: 'sports' },
          ],
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  const values = onSubmit.mock.calls[0][0] as Record<string, unknown>;
  expect(values.gender).toBe('male');
  expect(values.hobbies).toEqual(['reading']);
});

test('should submit object value from useCustomFieldValue component', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'delivery',
          label: 'Delivery',
          render: TestDeliveryField,
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  await wrapper.find('.delivery-field').trigger('click');
  await nextTick();
  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  const values = onSubmit.mock.calls[0][0] as Record<string, unknown>;
  expect(values.delivery).toEqual({ date: '2026/1/1', period: 'am' });
});

test('should auto bind when render returns component vnode', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'delivery',
          label: 'Delivery',
          render: () => h(TestDeliveryField),
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  await wrapper.find('.delivery-field').trigger('click');
  await nextTick();
  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  expect(
    (onSubmit.mock.calls[0][0] as Record<string, unknown>).delivery,
  ).toEqual({ date: '2026/1/1', period: 'am' });
});

test('should bind props via component render', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'tag',
          label: 'Tag',
          defaultValue: 'on',
          render: TestDeliveryField,
          componentProps: { class: 'bound-delivery' },
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  expect(wrapper.find('.bound-delivery').exists()).toBe(true);
});

test('should include render field value on submit', async () => {
  const onSubmit = vi.fn();
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'tag',
          label: 'Tag',
          defaultValue: 'on',
          render: ({ value, setValue }: ProFormRenderContext) =>
            h(
              'button',
              {
                type: 'button',
                class: 'render-tag',
                onClick: () => setValue(value === 'on' ? 'off' : 'on'),
              },
              String(value ?? 'off'),
            ),
        },
      ],
      showSubmit: true,
      onSubmit,
    },
  });

  await nextTick();
  await wrapper.find('form').trigger('submit');
  await nextTick();

  expect(onSubmit).toHaveBeenCalled();
  const values = onSubmit.mock.calls[0][0] as Record<string, unknown>;
  expect(values.tag).toBe('on');
});

test('should support column render', async () => {
  const wrapper = mount(ProForm, {
    props: {
      columns: [
        {
          name: 'tag',
          label: 'Tag',
          defaultValue: 'on',
          render: ({ value, setValue }: ProFormRenderContext) =>
            h(
              'button',
              {
                type: 'button',
                class: 'render-tag',
                onClick: () => setValue(value === 'on' ? 'off' : 'on'),
              },
              String(value ?? 'off'),
            ),
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  const btn = wrapper.find('.render-tag');
  expect(btn.exists()).toBe(true);
  expect(btn.text()).toBe('on');

  await btn.trigger('click');
  await nextTick();
  expect(btn.text()).toBe('off');
});

test('should pass form readonly to builtin input controls', async () => {
  const wrapper = mount(ProForm, {
    props: {
      readonly: true,
      columns: [
        { name: 'switch', label: 'Switch', component: 'switch' },
        {
          name: 'rate',
          label: 'Rate',
          component: 'rate',
          defaultValue: 3,
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  expect(wrapper.find('.van-switch--disabled').exists()).toBe(true);
  expect(wrapper.find('.van-rate--readonly').exists()).toBe(true);
});

test('should pass form readonly to uploaderFile', async () => {
  const wrapper = mount(ProForm, {
    props: {
      readonly: true,
      columns: [
        {
          name: 'attachments',
          label: 'Files',
          component: 'uploaderFile',
          defaultValue: [],
          componentProps: { uploadText: 'Add' },
        },
      ],
      showSubmit: false,
    },
  });

  await nextTick();
  const uploader = wrapper.findComponent({ name: 'VanUploader' });
  expect(uploader.props('readonly')).toBe(true);
});

test('should support custom component render', async () => {
  const wrapper = mount(ProForm, {
    props: {
      columns: [{ name: 'custom', label: 'Custom', component: 'myCustom' }],
      components: {
        myCustom: ({ value, setValue }: ProFormRenderContext) =>
          h('input', {
            class: 'custom-input',
            value: String(value ?? ''),
            onInput: (e: Event) =>
              setValue((e.target as HTMLInputElement).value),
          }),
      },
      modelValue: { custom: 'hello' },
      showSubmit: false,
    },
  });

  await nextTick();
  expect(wrapper.find('.custom-input').exists()).toBe(true);
  expect((wrapper.find('.custom-input').element as HTMLInputElement).value).toBe(
    'hello',
  );
});
