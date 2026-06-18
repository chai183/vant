import type { TagProps } from '../tag/Tag';

// 卡片形态
export type CardType =
  | 'default'
  | 'image-large'
  | 'image-double'
  | 'image-right';

export type CardFooterButtonType = 'text' | 'outline';

export type CardFooterNoteLayout = 'center' | 'split' | 'left';

export type CardAvatarSize = 'small' | 'large'; // 20px | 44px

// 文本展示行数；auto 表示换行全展示，不做省略
export type CardTextRows = number | 'auto';

// text-list 单行数据
export type CardTextListItem = {
  label: string;
  value: string;
  valueRows?: CardTextRows; // 右侧文案省略行数；auto 为全展示
  buttonText?: string; // 行内纯文字操作按钮（14px 主题色）
  rowSlot?: string; // 整行插槽名：#text-list-row-{rowSlot}
  labelSlot?: string; // 左侧标题：#text-list-label-{labelSlot}
  valueSlot?: string; // 右侧内容：#text-list-value-{valueSlot}
  actionSlot?: string; // 操作区：#text-list-action-{actionSlot}
};

// text-list 插槽作用域
export type CardTextListSlotProps = {
  index: number;
  item: CardTextListItem;
  onActionClick: (event?: MouseEvent) => void;
};

export type CardFooterButton = {
  text: string;
  name?: string | number; // click-button 回调标识
  color?: string; // 自定义颜色：text 仅文字；outline 文字 + 边框
};

export type CardTagOption = Partial<
  Pick<TagProps, 'type' | 'plain' | 'round' | 'color'>
> & {
  text: string;
};

// 右上角角标，透传 Tag props，文案用 #status-tag
export type CardStatusTagProps = Partial<TagProps> & {
  text?: string;
};

export type CardContentType = 'text-list' | '';
