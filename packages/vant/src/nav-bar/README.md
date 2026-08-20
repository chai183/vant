# NavBar

### Intro

Provide navigation function for the page, often used at the top of the page.

### Install

Register component globally via `app.use`, refer to [Component Registration](#/en-US/advanced-usage#zu-jian-zhu-ce) for more registration ways.

```js
import { createApp } from 'vue';
import { NavBar } from 'vant';

const app = createApp();
app.use(NavBar);
```

## Usage

### Basic Usage

Set the nav bar title with the `title` prop.

```html
<van-nav-bar title="Title" />
```

### Subtitle

Set the nav bar subtitle with the `subtitle` prop.

```html
<van-nav-bar title="Title" subtitle="this is subtitle content message" />
```

### Custom Background

Set the nav bar background with the `background` prop.

```html
<van-nav-bar
  title="Title"
  background="linear-gradient(90deg, #e8f3ff, #ffffff)"
/>
```

### Left and Right Content

Use text or buttons on the left and right sides. Up to two positions are displayed on each side, and right text displays up to four characters.

```html
<van-nav-bar
  title="Title"
  left-text="Back"
  right-text="four button"
  left-arrow
  @click-left="onClickLeft"
  @click-right="onClickRight"
/>

<van-nav-bar
  title="Title"
  :left-buttons="leftButtons"
  right-text="four button"
  :right-buttons="rightButtons"
  @click-left-button="onClickLeftButton"
  @click-right-button="onClickRightButton"
  @click-right="onClickRight"
/>
```

```js
const leftButtons = [{ icon: 'arrow-left' }, { icon: 'cross' }];
const rightButtons = [
  { icon: 'search', size: 22 },
  { icon: 'ellipsis', size: 22 },
];
```

### Dropdown Menu

Right buttons can configure a dropdown menu via `menu`. The menu width is `112px`, menu items are displayed vertically with a height of `48px`, and icons and text are supported.

```html
<van-nav-bar
  title="Title"
  :right-buttons="menuButtons"
  @click-left-button="onClickLeftButton"
  @click-right-button="onClickRightButton"
  @select-right-menu="onSelectRightMenu"
/>
```

```js
const menuButtons = [
  { icon: 'search' },
  {
    icon: 'ellipsis',
    menu: [
      { icon: 'icon-xiangce', color: '#333', text: 'Customer Service' },
      { icon: 'icon-xiangce', color: '#333', text: 'Following' },
    ],
  },
];
```

### Long Title

When the title is too long, it first shrinks the font size. The minimum font size is `14px`; if it still overflows, it will be truncated.

```html
<van-nav-bar title="This is a very long title for NavBar display" />
```

### Search

When no title is set, you can use the `search` prop to render the title area as a search box. The search box reuses the `Search` component and emits `search` when the left search icon is clicked.

```html
<van-nav-bar search search-placeholder="Search" @search="onSearch" />

<van-nav-bar
  search
  :left-buttons="leftButtons2"
  right-text="four button"
  search-placeholder="Search"
  @click-left-button="onClickLeftButton"
  @click-right="onClickRight"
  @search="onSearch"
/>

<van-nav-bar
  search
  :left-buttons="leftButtons"
  :right-buttons="rightButtons"
  search-placeholder="Search"
  @click-left-button="onClickLeftButton"
  @click-right-button="onClickRightButton"
  @search="onSearch"
/>
```

```js
const leftButtons = [{ icon: 'arrow-left' }, { icon: 'cross' }];
const leftButtons2 = [{ icon: 'diamond-o', size: 16, text: 'userHome' }];
const rightButtons = [
  { icon: 'search', size: 22 },
  { icon: 'ellipsis', size: 22 },
];
```

## API

### Props

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| title | Title | _string_ | `''` |
| subtitle | Subtitle | _string_ | `''` |
| background | Background color of nav bar | _string_ | - |
| left-text | Left Text | _string_ | `''` |
| right-text | Right Text, up to four characters are displayed | _string_ | `''` |
| left-buttons | Left button options, up to two buttons are displayed | _NavBarButton[]_ | `[]` |
| right-buttons | Right button options, up to two buttons are displayed | _NavBarButton[]_ | `[]` |
| left-disabled `v4.6.8` | Whether to disable the left button, decrease opacity and make it unclickable | _boolean_ | `false` |
| right-disabled `v4.6.8` | Whether to disable the right button, decrease opacity and make it unclickable | _boolean_ | `false` |
| left-arrow | Whether to show left arrow | _boolean_ | `false` |
| border | Whether to show bottom border | _boolean_ | `true` |
| fixed | Whether to fixed top | _boolean_ | `false` |
| placeholder | Whether to generate a placeholder element when fixed | _boolean_ | `false` |
| z-index | Z-index | _number \| string_ | `1` |
| safe-area-inset-top | Whether to enable top safe area adaptation | _boolean_ | `false` |
| clickable | Whether to show click feedback when the left or right content is clicked | _boolean_ | `true` |
| search | Whether to render the title area as a search box when no title is set | _boolean_ | `false` |
| search-value | Search value | _string_ | `''` |
| search-placeholder | Search placeholder | _string_ | `''` |
| search-props | Native Search component props | _Partial\<SearchProps\>_ | - |

### Slots

| Name               | Description                       |
| ------------------ | --------------------------------- |
| title              | Custom title                      |
| subtitle           | Custom subtitle                   |
| left               | Custom left side content          |
| right              | Custom right side content         |
| left-action        | Custom first left action button   |
| left-extra-action  | Custom second left action button  |
| right-action       | Custom first right action button  |
| right-extra-action | Custom second right action button |
| search             | Custom search content             |

### Events

| Event | Description | Arguments |
| --- | --- | --- |
| click-left | Emitted when the left button is clicked | _event: MouseEvent_ |
| click-right | Emitted when the right button is clicked | _event: MouseEvent_ |
| click-left-button | Emitted when a left button is clicked | _button: NavBarButton, index: number, event: MouseEvent_ |
| click-right-button | Emitted when a right button is clicked | _button: NavBarButton, index: number, event: MouseEvent_ |
| select-right-menu | Emitted when a right button menu item is selected | _item: NavBarMenuItem, itemIndex: number, button: NavBarButton, buttonIndex: number, event: MouseEvent_ |
| update:search-value | Emitted when search value changes | _value: string_ |
| search | Emitted when the left search icon is clicked | _value: string, event: MouseEvent_ |

### Types

The component exports the following type definitions:

```ts
import type {
  NavBarProps,
  NavBarButton,
  NavBarMenuItem,
  SearchProps,
} from 'vant';
```

### NavBarButton

| Name       | Description                        | Type               |
| ---------- | ---------------------------------- | ------------------ |
| icon       | Icon name                          | _string_           |
| iconPrefix | Icon class prefix                  | _string_           |
| size       | Icon size. Defaults to `28px`      | _number \| string_ |
| text       | Button text                        | _string_           |
| color      | Button color                       | _string_           |
| disabled   | Whether to disable the button      | _boolean_          |
| className  | Custom button class name           | _string_           |
| menu       | Right button dropdown menu options | _NavBarMenuItem[]_ |

### NavBarMenuItem

| Name       | Description                      | Type      |
| ---------- | -------------------------------- | --------- |
| icon       | Icon name                        | _string_  |
| iconPrefix | Icon class prefix                | _string_  |
| text       | Menu item text                   | _string_  |
| color      | Menu item color                  | _string_  |
| disabled   | Whether to disable the menu item | _boolean_ |
| className  | Custom menu item class name      | _string_  |

## Theming

### CSS Variables

The component provides the following CSS variables, which can be used to customize styles. Please refer to [ConfigProvider component](#/en-US/config-provider).

| Name | Default Value | Description |
| --- | --- | --- |
| --van-nav-bar-height | _44px_ | - |
| --van-nav-bar-background | _var(--van-background-2)_ | - |
| --van-nav-bar-arrow-size | _28px_ | - |
| --van-nav-bar-icon-color | _var(--van-primary-color)_ | - |
| --van-nav-bar-text-color | _var(--van-primary-color)_ | - |
| --van-nav-bar-title-font-size | _18px_ | - |
| --van-nav-bar-title-min-font-size | _14px_ | - |
| --van-nav-bar-title-gap | _6px_ | - |
| --van-nav-bar-title-text-color | _var(--van-text-color)_ | - |
| --van-nav-bar-subtitle-font-size | _10px_ | - |
| --van-nav-bar-subtitle-text-color | _#999_ | - |
| --van-nav-bar-z-index | _1_ | - |
| --van-nav-bar-disabled-opacity | _var(--van-disabled-opacity)_ | - |
| --van-nav-bar-horizontal-padding | _8px_ | - |
| --van-nav-bar-button-gap | _12px_ | - |
| --van-nav-bar-button-width | _28px_ | - |
| --van-nav-bar-button-height | _28px_ | - |
| --van-nav-bar-button-icon-size | _28px_ | - |
| --van-nav-bar-menu-z-index | _2000_ | - |
| --van-nav-bar-menu-width | _112px_ | - |
| --van-nav-bar-menu-item-height | _48px_ | - |
| --van-nav-bar-menu-background | _var(--van-background-2)_ | - |
| --van-nav-bar-search-height | _32px_ | - |
| --van-nav-bar-search-background | _var(--van-background)_ | - |
| --van-nav-bar-search-radius | _100px_ | - |
| --van-title-max-width | _199px_ | - |
| --van-nav-bar-menu-edge-gap | _8px_ | - |
| --van-nav-bar-menu-arrow-gap | _2px_ | - |
| --van-nav-bar-menu-arrow-width | _10px_ | - |
| --van-nav-bar-menu-arrow-height | _4px_ | - |
| --van-nav-bar-menu-arrow-color | _#ffffff_ | - |
| --van-nav-bar-menu-radius | _4px_ | - |
