# Tab

### Intro

Used to switch between different content areas.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { Tab, Tabs, CascadeTabs } from 'vant';

const app = createApp();
app.use(Tab);
app.use(Tabs);
app.use(CascadeTabs);
```

## Usage

### Basic Usage

The first tab is active by default, you can set `v-model:active` to active specified tab.

```html
<van-tabs v-model:active="active">
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref(0);
    return { active };
  },
};
```

### Underline Style

Use `type="underline"` to show an underline below the active tab title (per tab, not the sliding bottom bar). Inactive tabs use `#333333`, the active tab uses the theme color, the underline is 20px wide and 2px high, and the tab bar height is 48px.

```html
<van-tabs v-model:active="active" type="underline">
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Rounded Background Style

Use `type="rounded"` to show a `#f5f5f5` background on inactive tabs (padding: 6px 12px, gap: 12px) and theme color background on the active tab, with a white nav bar (padding: 10px 12px). When the number of tabs is less than `swipe-threshold` (5 by default), tabs are left-aligned; when equal to 5, tabs fill the width; when greater than 5, the nav scrolls horizontally.

```html
<van-tabs v-model:active="active" type="rounded">
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Divider Style

Use `type="divider"` to show tabs on a white nav bar with 16px vertical padding. Each tab has 12px horizontal padding and sizes to its content. Inactive text color is `#666666`, active text uses the theme color without bold. A vertical divider is shown on the right of each tab (except the last one).

```html
<van-tabs v-model:active="active" type="divider">
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Cascade Tabs

Use `CascadeTabs` to build multi-level linked tabs with 2 or 3 levels. Each level uses a fixed style:

- Level 1: `underline` (same as the Underline Style demo)
- Level 2: `rounded` (same as the Rounded Background demo)
- Level 3: `divider`

Bind the selected index path with `v-model:active`, and pass tree options via `options`. When a parent tab changes, child selections reset to index `0`. When any level overflows, the nav scrolls horizontally and shows the menu icon on the right.

#### Three Levels

```html
<van-cascade-tabs v-model:active="active" :levels="3" :options="options">
  <template #default="{ active, titles }">
    Selected: {{ titles.join(' / ') }}
  </template>
</van-cascade-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref([0, 0, 0]);
    const options = ref([
      {
        title: 'Tab 1',
        children: [
          {
            title: 'Tab 1-1',
            children: [{ title: 'Tab 1-1-1' }, { title: 'Tab 1-1-2' }],
          },
          {
            title: 'Tab 1-2',
            children: [{ title: 'Tab 1-2-1' }, { title: 'Tab 1-2-2' }],
          },
        ],
      },
      {
        title: 'Tab 2',
        children: [
          {
            title: 'Tab 2-1',
            children: [{ title: 'Tab 2-1-1' }, { title: 'Tab 2-1-2' }],
          },
        ],
      },
    ]);

    return { active, options };
  },
};
```

#### Two Levels

Set `levels` to `2` to use only underline and rounded styles.

```html
<van-cascade-tabs v-model:active="active" :levels="2" :options="options">
  <template #default="{ titles }">
    Selected: {{ titles.join(' / ') }}
  </template>
</van-cascade-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref([0, 0]);
    const options = ref([
      {
        title: 'Tab 1',
        children: [{ title: 'Tab 1-1' }, { title: 'Tab 1-2' }],
      },
      {
        title: 'Tab 2',
        children: [{ title: 'Tab 2-1' }, { title: 'Tab 2-2' }],
      },
    ]);

    return { active, options };
  },
};
```

### Match By Name

```html
<van-tabs v-model:active="activeName">
  <van-tab title="Tab 1" name="a">content of tab 1</van-tab>
  <van-tab title="Tab 2" name="b">content of tab 2</van-tab>
  <van-tab title="Tab 3" name="c">content of tab 3</van-tab>
</van-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const activeName = ref('b');
    return { activeName };
  },
};
```

### Swipe Tabs

By default more than 5 tabs, you can scroll through the tabs. You can set `swipe-threshold` attribute to customize threshold number. When the nav overflows, use `nav-overflow` to choose the display mode.

#### Menu Icon (default)

When the nav is scrollable, a menu icon is shown on the right (`#333333` by default, theme color when opened). Click to open a `RadioGroup` list panel (`is-list`) for quick tab switching.

```html
<van-tabs v-model:active="active" type="underline">
  <van-tab v-for="index in 8" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

Use `show-nav-menu` to hide the menu icon:

```html
<van-tabs v-model:active="active" :show-nav-menu="false">
  <van-tab v-for="index in 8" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

#### Scroll Shadow

Set `nav-overflow="shadow"` to show a 12px-wide block on the right with a shadow on its left side, indicating more content on the right. After scrolling to the end, the block moves to the left side with a shadow on its right.

```html
<van-tabs v-model:active="active" type="underline" nav-overflow="shadow">
  <van-tab v-for="index in 8" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Disabled Tab

Use `disabled` prop to disable a tab.

```html
<van-tabs v-model:active="active">
  <van-tab v-for="index in 3" :title="'Tab ' + index" :disabled="index === 2">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Card Style

Tabs styled as cards.

```html
<van-tabs v-model:active="active" type="card">
  <van-tab v-for="index in 3" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Click Event

```html
<van-tabs v-model:active="active" @click-tab="onClickTab">
  <van-tab v-for="index in 2" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

```js
import { showToast } from 'vant';

export default {
  setup() {
    const onClickTab = ({ title }) => showToast(title);
    return {
      onClickTab,
    };
  },
};
```

### Sticky

In sticky mode, the tab nav will be fixed to top when scroll to top.

```html
<van-tabs v-model:active="active" sticky>
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Shrink

In shrink mode, the tabs will be shrinked to the left.

```html
<van-tabs v-model:active="active" shrink>
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>

<van-tabs v-model:active="active" shrink type="card">
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Custom Tab

Use title slot to custom tab title.

```html
<van-tabs v-model:active="active">
  <van-tab v-for="index in 2">
    <template #title><van-icon name="more-o" />Tab</template>
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Switch Animation

Use `animated` props to change tabs with animation.

```html
<van-tabs v-model:active="active" animated>
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Swipeable

In swipeable mode, you can switch tabs with swipe gesture in the content.

```html
<van-tabs v-model:active="active" swipeable>
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Scrollspy

In scrollspy mode, the list of content will be tiled.

```html
<van-tabs v-model:active="active" scrollspy sticky>
  <van-tab v-for="index in 8" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

### Before Change

```html
<van-tabs v-model:active="active" :before-change="beforeChange">
  <van-tab v-for="index in 4" :title="'Tab ' + index">
    content of tab {{ index }}
  </van-tab>
</van-tabs>
```

```js
import { ref } from 'vue';

export default {
  setup() {
    const active = ref(0);
    const beforeChange = (index) => {
      // prevent change
      if (index === 1) {
        return false;
      }

      // async
      return new Promise((resolve) => {
        setTimeout(() => resolve(index !== 3), 1000);
      });
    };

    return {
      active,
      beforeChange,
    };
  },
};
```

> Tips: The before-change callback will not be triggered by swiping gesture.

### Hide Header

By setting the `showHeader` prop to `false`, the title bar of the Tabs component can be hidden. In this case, you can control the `active` prop of the Tabs using custom components.

```html
<van-tabs v-model:active="active" :show-header="false">
  <van-tab v-for="index in 4">content of tab {{ index }}</van-tab>
</van-tabs>
```

## API

### Tabs Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model:active | Index of active tab | _number \| string_ | `0` |
| type | Can be set to `line` `card` `rounded` `underline` `divider` | _string_ | `line` |
| color | Tab color | _string_ | `#1989fa` |
| background | Background color | _string_ | `white` |
| duration | Toggle tab's animation time | _number \| string_ | `0.3` |
| line-width | Width of tab line | _number \| string_ | `40px` |
| line-height | Height of tab line | _number \| string_ | `3px` |
| animated | Whether to change tabs with animation (After enabling this attribute, if there is a sticky layout in the content area, it will not meet expectations) | _boolean_ | `false` |
| border | Whether to show border when `type="line"` | _boolean_ | `false` |
| ellipsis | Whether to ellipsis too long title (Takes effect only if `shrink` is `false` and the number of `tabs` is less than or equal to `swipe-threshold`) | _boolean_ | `true` |
| sticky | Whether to use sticky mode | _boolean_ | `false` |
| shrink | Whether to shrink the the tabs to the left | _boolean_ | `false` |
| swipeable | Whether to enable gestures to slide left and right (After enabling this attribute, if there is a sticky layout in the content area, it will not meet expectations) | _boolean_ | `false` |
| lazy-render | Whether to enable tab content lazy render | _boolean_ | `true` |
| scrollspy | Whether to use scrollspy mode | _boolean_ | `false` |
| show-header `v4.7.3` | Whether to show title bar | _boolean_ | `true` |
| show-nav-menu | Whether to show the menu icon on the right when the nav is scrollable, only works when `nav-overflow` is `menu` | _boolean_ | `true` |
| nav-overflow | Overflow display mode, can be set to `menu` `shadow` | _string_ | `menu` |
| offset-top | Sticky offset top , supports `px` `vw` `vh` `rem` unit, default `px` | _number \| string_ | `0` |
| swipe-threshold | Set swipe tabs threshold (Takes effect only when `shrink` is `false` and `ellipsis` is `true`) | _number \| string_ | `5` |
| title-active-color | Title active color | _string_ | - |
| title-inactive-color | Title inactive color | _string_ | - |
| before-change | Callback function before changing tabs, return `false` to prevent change, support return Promise | _(name: number \| string) => boolean \| Promise\<boolean\>_ | - |

### Tab Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| title | Title | _string_ | - |
| disabled | Whether to disable tab | _boolean_ | `false` |
| dot | Whether to show red dot on the title | _boolean_ | `false` |
| badge | Content of the badge on the title (Effective when `dot` is `false`) | _number \| string_ | - |
| name | Identifier | _number \| string_ | Index of tab |
| url | Link | _string_ | - |
| to | The target route should navigate to when clicked on, same as the [to prop](https://router.vuejs.org/api/interfaces/RouterLinkProps.html#Properties-to) of Vue Router | _string \| object_ | - |
| replace | If true, the navigation will not leave a history record | _boolean_ | `false` |
| title-style | Custom title style | _string \| Array \| object_ | - |
| title-class | Custom title class name | _string \| Array \| object_ | - |
| show-zero-badge | Whether to show badge when the value is zero | _boolean_ | `true` |

### Tabs Events

| Event | Description | Arguments |
| --- | --- | --- |
| click-tab | Emitted when a tab is clicked | _{ name: string \| number, title: string, event: MouseEvent, disabled: boolean }_ |
| change | Emitted when active tab changed | _name: string \| number, title: string_ |
| rendered | Emitted when content first rendered in lazy-render mode | _name: string \| number, title: string_ |
| scroll | Emitted when tab scrolling in sticky mode | _{ scrollTop: number, isFixed: boolean }_ |

### Tabs Methods

Use [ref](https://vuejs.org/guide/essentials/template-refs.html) to get Tabs instance and call instance methods.

| Name | Description | Attribute | Return value |
| --- | --- | --- | --- |
| resize | Resize Tabs when container element resized or visibility changed | - | - |
| scrollTo | Go to specified tab in scrollspy mode | _name: string \| number_ | - |

### Types

The component exports the following type definitions:

```ts
import type { TabProps, TabsType, TabsProps, TabsInstance } from 'vant';
```

`TabsInstance` is the type of component instance:

```ts
import { ref } from 'vue';
import type { TabsInstance } from 'vant';

const tabsRef = ref<TabsInstance>();

tabsRef.value?.scrollTo(0);
```

### Tabs Slots

| Name       | Description               |
| ---------- | ------------------------- |
| nav-left   | Custom nav left content   |
| nav-right  | Custom nav right content  |
| nav-bottom | Custom nav bottom content |

### Tab Slots

| Name    | Description      |
| ------- | ---------------- |
| default | Content of tab   |
| title   | Custom tab title |

### CascadeTabs Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| v-model:active | Selected index path for each level | _number[]_ | `[0, 0, 0]` |
| levels | Number of cascade levels, can be set to `2` or `3` | _number \| string_ | `3` |
| options | Tree options | _CascadeTabOption[]_ | `[]` |
| color | Tab theme color, passed to each level `Tabs` | _string_ | - |
| swipe-threshold | Scroll threshold, passed to each level `Tabs` | _number \| string_ | `5` |
| show-nav-menu | Whether to show the menu icon when the nav is scrollable | _boolean_ | `true` |

### CascadeTabOption Data Structure

| Key      | Description                | Type                 |
| -------- | -------------------------- | -------------------- |
| title    | Tab title                  | _string_             |
| disabled | Whether to disable the tab | _boolean_            |
| children | Child options              | _CascadeTabOption[]_ |

### CascadeTabs Events

| Event | Description | Arguments |
| --- | --- | --- |
| change | Emitted when the selected path changes | _{ active: number[], titles: string[] }_ |

### CascadeTabs Slots

| Name    | Description          | Slot Props                               |
| ------- | -------------------- | ---------------------------------------- |
| default | Cascade content area | _{ active: number[], titles: string[] }_ |

### CascadeTabs Types

The component exports the following type definitions:

```ts
import type {
  CascadeTabOption,
  CascadeTabsProps,
  CascadeTabsInstance,
  CascadeTabsActivePath,
  CascadeTabsChangeParams,
} from 'vant';
```

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-tab-text-color | _var(--van-gray-7)_ | - |
| --van-tab-active-text-color | _var(--van-text-color)_ | - |
| --van-tab-disabled-text-color | _var(--van-text-color-3)_ | - |
| --van-tab-font-size | _var(--van-font-size-md)_ | - |
| --van-tab-line-height | _var(--van-line-height-md)_ | - |
| --van-tabs-default-color | _var(--van-primary-color)_ | - |
| --van-tabs-line-height | _44px_ | - |
| --van-tabs-card-height | _30px_ | - |
| --van-tabs-rounded-inactive-background | _#f5f5f5_ | - |
| --van-tabs-rounded-padding-vertical | _6px_ | - |
| --van-tabs-rounded-padding-horizontal | _12px_ | - |
| --van-tabs-rounded-gap | _12px_ | - |
| --van-tabs-rounded-nav-background | _var(--van-white)_ | - |
| --van-tabs-rounded-nav-padding-vertical | _10px_ | - |
| --van-tabs-rounded-nav-padding-horizontal | _12px_ | - |
| --van-tabs-rounded-nav-radius | _var(--van-radius-lg)_ | - |
| --van-tabs-nav-background | _var(--van-background-2)_ | - |
| --van-tabs-divider-nav-padding-vertical | _16px_ | - |
| --van-tabs-divider-tab-padding-horizontal | _12px_ | - |
| --van-tabs-divider-nav-background | _var(--van-white)_ | - |
| --van-tabs-divider-inactive-text-color | _#666666_ | - |
| --van-tabs-divider-line-width | _0.5px_ | - |
| --van-tabs-divider-line-height | _12px_ | - |
| --van-tabs-divider-line-color | _#dddddd_ | - |
| --van-tabs-nav-menu-icon-color | _#333333_ | - |
| --van-tabs-nav-menu-icon-active-color | _var(--van-primary-color)_ | - |
| --van-tabs-nav-menu-background | _var(--van-white)_ | - |
| --van-tabs-nav-menu-padding | _0 12px_ | - |
| --van-tabs-scroll-shadow-width | _12px_ | - |
| --van-tabs-scroll-shadow-color | _rgba(0, 0, 0, 0.08)_ | - |
| --van-tabs-bottom-bar-width | _40px_ | - |
| --van-tabs-bottom-bar-height | _3px_ | - |
| --van-tabs-bottom-bar-color | _var(--van-primary-color)_ | - |
| --van-tabs-underline-height | _48px_ | - |
| --van-tabs-underline-bar-width | _20px_ | - |
| --van-tabs-underline-bar-height | _2px_ | - |
| --van-tabs-underline-inactive-text-color | _#333333_ | - |

## FAQ

### After Tabs enable the swipeable or animated attribute, the sticky function of content area elements will not meet expectations

When the `swipeable` or `animated` attribute is enabled for `Tabs`, the content area will be wrapped by an element with the `transform` attribute, and if the `sticky` function is enabled for the element in the content area, the function will take effect, but the display position will not be as expected.

For example, the following code:

```html
<van-tabs v-model:active="active" swipeable>
  <van-tab>
    <van-sticky>
      <van-button>sticky button</van-button>
    </van-sticky>
  </van-tab>
</van-tabs>
```

This is because the `fixed` positioning inside the `transform` element is computed relative to that element, not relative to the entire document, resulting in layout exceptions.

### How to determine if the current component is inside an active Tab?

In a child component, you can use `useTabStatus` or `useAllTabStatus` to check whether the component is inside an active `Tab`.

- `useTabStatus`: Returns whether the current component's parent `Tab` is active. Returns `null` if the component is not inside a `Tab`.
- `useAllTabStatus`: In nested Tab scenarios, returns whether all parent `Tabs` are active. Returns `null` if the component is not inside a `Tab`.

```js
const isActive = useTabStatus();
// For nested Tab scenarios
const isAllActive = useAllTabStatus();
```
