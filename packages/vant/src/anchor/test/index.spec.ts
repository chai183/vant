import { nextTick } from 'vue';
import Anchor from '..';
import { mount, trigger, later } from '../../../test';

test('should allow to custom position by position prop', async () => {
  const root = document.createElement('div');
  mount(Anchor, {
    props: {
      type: 'terms',
      right: 30,
      bottom: 100,
      zIndex: 200,
      teleport: root,
    },
  });
  const anchorEl = root.querySelector<HTMLDivElement>('.van-anchor')!;
  expect(anchorEl.style.right).toBe('30px');
  expect(anchorEl.style.bottom).toBe('100px');
  expect(anchorEl.style.zIndex).toBe('200');
});

test('should render ball text below icon when text prop is set', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  mount(Anchor, {
    props: {
      type: 'back-top',
      mode: 'fixed',
      offset: 0,
      text: '顶部',
      target: root,
      teleport: root,
    },
  });

  await nextTick();
  await nextTick();

  const textEl = root.querySelector('.van-anchor__morph-text');
  expect(textEl?.textContent).toBe('顶部');
  expect(
    root.querySelector('.van-anchor__morph-ball .van-anchor__morph-icon--ball'),
  ).toBeTruthy();
});

test('should render back-top expanded ball', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  mount(Anchor, {
    props: {
      type: 'back-top',
      mode: 'fixed',
      offset: 0,
      target: root,
      teleport: root,
    },
  });

  await nextTick();
  await nextTick();

  expect(
    root.querySelector('.van-anchor--ball .van-anchor__morph'),
  ).toBeTruthy();
});

test('should emit click event after expanded clicked', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  const scrollTo = rs.fn();
  root.scrollTo = scrollTo;

  const wrapper = mount(Anchor, {
    props: {
      type: 'back-top',
      mode: 'fixed',
      offset: 0,
      target: root,
      teleport: root,
    },
  });

  await nextTick();
  await nextTick();

  const expandedEl = root.querySelector<HTMLDivElement>('.van-anchor__morph')!;
  await trigger(expandedEl, 'click');

  expect(wrapper.emitted('click')?.length).toEqual(1);
  expect(scrollTo).toHaveBeenCalled();
});

test('should keep back-top visible when scrolling up until below offset', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  mount(Anchor, {
    props: {
      type: 'back-top',
      mode: 'auto',
      offset: 50,
      target: root,
      teleport: root,
    },
  });

  root.scrollTop = 100;
  root.dispatchEvent(new Event('scroll'));
  await nextTick();
  await later(150);
  expect(root.querySelector('.van-anchor--active')).toBeTruthy();

  root.scrollTop = 80;
  root.dispatchEvent(new Event('scroll'));
  await later(150);
  expect(root.querySelector('.van-anchor--active')).toBeTruthy();

  root.scrollTop = 0;
  root.dispatchEvent(new Event('scroll'));
  await later(150);
  expect(root.querySelector('.van-anchor--active')).toBeFalsy();
});

test('should not expand back-top auto when scrolling up in collapsed state', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  mount(Anchor, {
    props: {
      type: 'back-top',
      mode: 'auto',
      offset: 0,
      target: root,
      teleport: root,
    },
  });

  root.scrollTop = 100;
  await nextTick();
  await nextTick();
  expect(
    root.querySelector('.van-anchor--collapsed .van-anchor__morph'),
  ).toBeTruthy();

  root.scrollTop = 80;
  root.dispatchEvent(new Event('scroll'));
  await nextTick();

  expect(
    root.querySelector('.van-anchor--ball .van-anchor__morph-icon--ball'),
  ).toBeFalsy();
  expect(
    root.querySelector('.van-anchor--collapsed .van-anchor__morph'),
  ).toBeTruthy();
});

test('should show catalog anchor on small scroll with default label', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  mount(Anchor, {
    props: {
      type: 'catalog',
      mode: 'auto',
      items: [{ id: 's1', title: '章节一' }],
      target: root,
      teleport: root,
    },
  });

  root.scrollTop = 10;
  root.dispatchEvent(new Event('scroll'));
  await later(150);

  expect(root.querySelector('.van-anchor--active')).toBeTruthy();
  expect(root.querySelector('.van-anchor__morph-text')?.textContent).toBe(
    '目录',
  );
});

test('should open catalog popup when ball clicked', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  const wrapper = mount(Anchor, {
    props: {
      type: 'catalog',
      mode: 'fixed',
      items: [
        { id: 's1', title: '章节一' },
        { id: 's2', title: '章节二' },
      ],
      target: root,
      teleport: root,
    },
  });

  root.scrollTop = 10;
  root.dispatchEvent(new Event('scroll'));
  await nextTick();
  await nextTick();

  const morphEl = root.querySelector<HTMLDivElement>('.van-anchor__morph')!;
  await trigger(morphEl, 'click');
  await nextTick();

  expect(wrapper.emitted('open')).toBeTruthy();
});

test('should expand catalog ball on collapsed click (no popup)', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  const wrapper = mount(Anchor, {
    props: {
      type: 'catalog',
      mode: 'auto',
      items: [{ id: 's1', title: '章节一' }],
      target: root,
      teleport: root,
    },
  });

  root.scrollTop = 10;
  root.dispatchEvent(new Event('scroll'));
  await nextTick();
  await nextTick();

  // 先保持收起态，点击仅展开目录球体，不直接弹出层
  const collapsedEl = root.querySelector<HTMLDivElement>('.van-anchor__morph')!;
  await trigger(collapsedEl, 'click');
  await nextTick();

  expect(
    root.querySelector('.van-anchor--ball .van-anchor__morph'),
  ).toBeTruthy();
  expect(wrapper.emitted('open')).toBeFalsy();
});

test('should open catalog popup when expanded ball clicked (with close icon)', async () => {
  const root = document.createElement('div');
  root.style.height = '100px';
  root.style.overflow = 'auto';
  root.innerHTML = '<div style="height:500px"></div>';

  const wrapper = mount(Anchor, {
    props: {
      type: 'catalog',
      mode: 'auto',
      items: [
        { id: 's1', title: '章节一' },
        { id: 's2', title: '章节二' },
      ],
      target: root,
      teleport: root,
    },
  });

  root.scrollTop = 10;
  root.dispatchEvent(new Event('scroll'));
  await nextTick();
  await nextTick();

  const morphEl = root.querySelector<HTMLDivElement>('.van-anchor__morph')!;
  // 1) 点击收起态：仅展开球体
  await trigger(morphEl, 'click');
  await nextTick();

  // 2) 再次点击展开球体：弹出目录列表（底部 Popup）
  await trigger(morphEl, 'click');
  await nextTick();

  expect(wrapper.emitted('open')).toBeTruthy();

  const closeIcon = document.body.querySelector('.van-popup__close-icon');
  expect(closeIcon).toBeTruthy();
});
