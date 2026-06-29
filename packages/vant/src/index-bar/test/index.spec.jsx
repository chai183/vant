import { ref, nextTick, onMounted } from 'vue';
import {
  mount,
  trigger,
  triggerDrag,
  mockScrollTo,
  mockScrollTop,
  mockScrollIntoView,
} from '../../../test';
import { IndexBar } from '..';
import { IndexAnchor } from '../../index-anchor';
import { Cell } from '../../cell';

test('should allow to custom anchor content', () => {
  const wrapper = mount({
    render: () => (
      <IndexBar>
        <IndexAnchor index="A">Title A</IndexAnchor>
      </IndexBar>
    ),
  });

  expect(wrapper.find('.van-index-anchor').html()).toMatchSnapshot();
});

test('should scroll to anchor and emit select event after clicking the index-bar', () => {
  const onSelect = rs.fn();
  const wrapper = mount({
    render: () => (
      <IndexBar onSelect={onSelect}>
        <IndexAnchor index="A" />
        <IndexAnchor index="B" />
      </IndexBar>
    ),
  });

  const fn = mockScrollIntoView();
  const indexes = wrapper.findAll('.van-index-bar__index');
  indexes[0].trigger('click');

  expect(fn).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith('A');
});

test('should scroll to anchor after touching the index-bar', () => {
  const onSelect = rs.fn();
  const wrapper = mount({
    render: () => (
      <IndexBar onSelect={onSelect}>
        <IndexAnchor index="A" />
        <IndexAnchor index="B" />
        <IndexAnchor index="XXX" />
      </IndexBar>
    ),
  });

  const fn = mockScrollIntoView();
  const sidebar = wrapper.find('.van-index-bar__sidebar');
  const indexes = wrapper.findAll('.van-index-bar__index');

  document.elementFromPoint = function (x, y) {
    const index = y / 100;

    if (index === 1 || index === 2) {
      return indexes[index].element;
    }

    if (index === 3) {
      return {
        dataset: {},
      };
    }
  };

  // horizontal drag
  triggerDrag(sidebar, 100, 0);
  expect(fn).toHaveBeenCalledTimes(0);

  // vertical drag
  trigger(sidebar, 'touchstart', 0, 0);
  trigger(sidebar, 'touchmove', 0, 100);
  trigger(sidebar, 'touchmove', 0, 200);
  trigger(sidebar, 'touchmove', 0, 300);
  trigger(sidebar, 'touchmove', 0, 400);
  trigger(sidebar, 'touchend', 0, 400);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith('B');
});

test('should update active anchor after page scroll', async () => {
  const nativeRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const { index } = this.dataset;
    return {
      top: index ? index * 10 : 0,
      height: 10,
    };
  };

  const wrapper = mount({
    setup() {
      const sticky = ref(false);
      return {
        sticky,
      };
    },
    render() {
      return (
        <IndexBar sticky={this.sticky}>
          <IndexAnchor index={1} data-index="0" />
          <IndexAnchor index={2} data-index="1" />
          <IndexAnchor index={3} data-index="2" />
          <IndexAnchor index={4} data-index="3" />
        </IndexBar>
      );
    },
  });

  await mockScrollTop(0);
  expect(wrapper.html()).toMatchSnapshot();

  wrapper.vm.sticky = true;
  await nextTick();
  await trigger(window, 'scroll');
  expect(wrapper.html()).toMatchSnapshot();
  wrapper.unmount();

  Element.prototype.getBoundingClientRect = nativeRect;
});

test('should emit change event when active index changed', async () => {
  const nativeRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const { index } = this.dataset;
    return {
      top: index ? index * 10 : 0,
      height: 10,
    };
  };

  const onChange = rs.fn();

  mount({
    render() {
      return (
        <IndexBar indexList={[1, 2, 3, 4]} onChange={onChange}>
          <IndexAnchor index={1} data-index="0" />
          <IndexAnchor index={2} data-index="1" />
          <IndexAnchor index={3} data-index="2" />
          <IndexAnchor index={4} data-index="3" />
        </IndexBar>
      );
    },
  });

  await mockScrollTop(0);
  expect(onChange).toHaveBeenCalled();

  Element.prototype.getBoundingClientRect = nativeRect;
});

test('should scroll to target element after calling scrollTo method', () => {
  const onSelect = rs.fn();
  const scrollIntoView = mockScrollIntoView();

  mount({
    setup() {
      const anchorRef = ref();

      onMounted(() => {
        anchorRef.value.scrollTo('C');
      });

      return {
        anchorRef,
      };
    },
    render() {
      return (
        <IndexBar ref="anchorRef" onSelect={onSelect}>
          <IndexAnchor index="A" />
          <IndexAnchor index="B" />
          <IndexAnchor index="C" />
          <IndexAnchor index="D" />
        </IndexBar>
      );
    },
  });

  expect(scrollIntoView).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith('C');
});

test('should render teleport prop correctly', () => {
  const root = document.createElement('div');
  mount({
    render: () => (
      <IndexBar teleport={root}>
        <IndexAnchor index="A">Title A</IndexAnchor>
      </IndexBar>
    ),
  });

  expect(root.querySelector('.van-index-bar__sidebar')).toBeTruthy();
});

test('should filter anchors when searchable is enabled', () => {
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="A">
        <IndexAnchor index="A" searchTexts={['A text1']} />
        <IndexAnchor index="B" searchTexts={['B text1']} />
      </IndexBar>
    ),
  });

  expect(wrapper.findAll('.van-index-anchor')).toHaveLength(1);
  expect(wrapper.find('.van-search').exists()).toBeTruthy();
});

test('should filter sibling cells by title when searchable is enabled', async () => {
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="北京大学">
        <IndexAnchor
          index="B"
          searchTexts={['百度地图', '北京大学', '百货商场']}
        />
        <Cell title="百度地图" />
        <Cell title="北京大学" />
        <Cell title="百货商场" />
        <IndexAnchor index="C" searchTexts={['重庆小面']} />
        <Cell title="重庆小面" />
      </IndexBar>
    ),
  });

  await nextTick();

  expect(wrapper.findAll('.van-index-anchor')).toHaveLength(1);
  expect(
    wrapper
      .findAll('.van-cell__title')
      .filter((cell) => cell.text().includes('北京大学')),
  ).toHaveLength(1);
  expect(wrapper.text()).toContain('北京大学');
  expect(wrapper.text()).not.toContain('百度地图');
  expect(wrapper.text()).not.toContain('百货商场');
  expect(wrapper.text()).not.toContain('重庆小面');
});

test('should filter body items by fuzzy text match when searchable is enabled', () => {
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="北京大学">
        <IndexAnchor
          index="B"
          searchTexts={['百度地图', '北京大学', '百货商场']}
        />
      </IndexBar>
    ),
  });

  const contentTitles = wrapper
    .findAll('.van-cell__title')
    .filter((cell) => cell.text().includes('北京大学'));
  expect(contentTitles).toHaveLength(1);
  expect(wrapper.text()).toContain('北京大学');
  expect(wrapper.text()).not.toContain('百度地图');
  expect(wrapper.text()).not.toContain('百货商场');
});

test('should highlight matched search text in traditional sibling cells', async () => {
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="北京">
        <IndexAnchor index="B" searchTexts={['北京大学']} />
        <Cell title="北京大学" highlight={['北京']} />
      </IndexBar>
    ),
  });

  await nextTick();

  const highlight = wrapper.find('.van-cell__highlight');
  expect(highlight.exists()).toBeTruthy();
  expect(highlight.text()).toBe('北京');
});

test('should highlight matched search text in body content', () => {
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="北京">
        <IndexAnchor index="B" searchTexts={['北京大学']} />
      </IndexBar>
    ),
  });

  const highlight = wrapper.find('.van-cell__highlight');
  expect(highlight.exists()).toBeTruthy();
  expect(highlight.text()).toBe('北京');
});

test('should render search text items with structured slots and internal highlight', () => {
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="北京">
        <IndexAnchor
          index="B"
          searchTexts={['北京大学']}
          v-slots={{
            'item-icon': ({ text }) => (
              <span class="custom-icon">{text}</span>
            ),
            'item-label': ({ anchorIndex }) => (
              <span class="custom-label">{anchorIndex}</span>
            ),
          }}
        />
      </IndexBar>
    ),
  });

  expect(wrapper.find('.custom-icon').text()).toBe('北京大学');
  expect(wrapper.find('.custom-label').text()).toBe('B');
  const highlight = wrapper.find('.van-cell__highlight');
  expect(highlight.exists()).toBeTruthy();
  expect(highlight.text()).toBe('北京');
});

test('should not respond to sidebar click when search results are shown', async () => {
  const onSelect = rs.fn();
  const scrollIntoView = mockScrollIntoView();
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="A" onSelect={onSelect}>
        <IndexAnchor index="A" searchTexts={['A text1']} />
        <IndexAnchor index="B" searchTexts={['B text1']} />
      </IndexBar>
    ),
  });

  await nextTick();
  expect(wrapper.find('.van-index-bar__sidebar--disabled').exists()).toBeTruthy();

  await wrapper.find('.van-index-bar__index').trigger('click');

  expect(scrollIntoView).not.toHaveBeenCalled();
  expect(onSelect).not.toHaveBeenCalled();
});

test('should render empty state without recursive updates when no search results', async () => {
  const wrapper = mount({
    render: () => (
      <IndexBar searchable search="zzz" emptyDescription="No results">
        <IndexAnchor index="A" searchTexts={['A text1']} />
        <IndexAnchor index="B" searchTexts={['B text1']} />
      </IndexBar>
    ),
  });

  await nextTick();
  await nextTick();

  expect(wrapper.find('.van-empty').exists()).toBeTruthy();
  expect(wrapper.find('.van-index-bar__sidebar').exists()).toBeFalsy();
  expect(wrapper.findAll('.van-index-anchor')).toHaveLength(0);
});

test('should render active anchor when stick prop is true and has stickyOffsetTop', async () => {
  const nativeRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const { index } = this.dataset;
    return {
      top: index ? index * (10 + 32) : 0,
      height: 10,
    };
  };

  mockScrollTo();
  const onSelect = rs.fn();
  const onChange = rs.fn();

  const wrapper = mount({
    render() {
      return (
        <IndexBar onSelect={onSelect} stickyOffsetTop={42} onChange={onChange}>
          <IndexAnchor index="A" data-index="0" />
          <div style={{ height: '32px' }}>A1</div>
          <IndexAnchor index="B" data-index="1" />
          <div style={{ height: '32px' }}>B1</div>
          <IndexAnchor index="C" data-index="2" />
          <div style={{ height: '32px' }}>C1</div>
        </IndexBar>
      );
    },
  });

  await nextTick();
  expect(wrapper.html()).toMatchSnapshot();

  const indexes = wrapper.findAll('.van-index-bar__index');
  await indexes[0].trigger('click');
  await trigger(window, 'scroll');

  expect(wrapper.html()).toMatchSnapshot();
  expect(onSelect).toHaveBeenCalledWith('A');

  wrapper.unmount();

  Element.prototype.getBoundingClientRect = nativeRect;
});
