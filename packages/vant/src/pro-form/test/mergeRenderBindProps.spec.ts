import { h, defineComponent } from 'vue';
import { mergeRenderBindProps } from '../mergeRenderBindProps';
import type { ProFormRenderContext } from '../types';

const InnerField = defineComponent({
  props: { modelValue: String },
  setup: () => () => h('span', { class: 'inner' }),
});

function createCtx(
  overrides: Partial<ProFormRenderContext> = {},
): ProFormRenderContext {
  return {
    column: { name: 'foo', componentProps: { placeholder: 'hi' } },
    model: { foo: 'bar' },
    value: 'bar',
    setValue: () => {},
    bindProps: (props) => ({
      placeholder: 'hi',
      ...props,
      modelValue: 'bar',
      'onUpdate:modelValue': () => {},
    }),
    ...overrides,
  };
}

test('should merge bindProps into component vnode from render', () => {
  const ctx = createCtx();
  const node = mergeRenderBindProps(h(InnerField), ctx) as ReturnType<typeof h>;

  expect(node.props?.modelValue).toBe('bar');
  expect(node.props?.placeholder).toBe('hi');
});

test('should merge bindProps into fragment children', () => {
  const ctx = createCtx();
  const node = mergeRenderBindProps(
    h('div', [h(InnerField)]),
    ctx,
  ) as ReturnType<typeof h>;

  const child = (node.children as ReturnType<typeof h>[])[0];
  expect(child.props?.modelValue).toBe('bar');
});
