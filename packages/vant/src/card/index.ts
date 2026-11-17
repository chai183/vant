import { withInstall } from '../utils';
import _Card from './Card';

export const Card = withInstall(_Card);
export default Card;
export { cardProps } from './Card';
export type { CardProps } from './Card';
export type { CardThemeVars } from './types';
// 业务卡数据结构，供 TS 引用
export type {
  CardType,
  CardTextRows,
  CardTextListItem,
  CardTextListSlotProps,
  CardFooterButton,
  CardTagOption,
  CardStatusTagProps,
  CardFooterButtonType,
  CardFooterNoteLayout,
  CardAvatarSize,
} from './card-types';

declare module 'vue' {
  export interface GlobalComponents {
    VanCard: typeof Card;
  }
}
