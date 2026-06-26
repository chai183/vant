import type { Numeric } from '../utils';

export type AvatarSize = 'large' | 'medium_l' | 'medium' | 'small' | 'mini';

export type AvatarSizeProp = AvatarSize | Numeric;

export type AvatarType = 'default' | 'text' | 'group' | 'male' | 'female';

export type AvatarThemeVars = {
  avatarLargeSize?: string;
  avatarMediumLSize?: string;
  avatarMediumSize?: string;
  avatarSmallSize?: string;
  avatarMiniSize?: string;
  avatarBackground?: string;
  avatarTextColor?: string;
  avatarTextFontSize?: string;
  avatarTextFontWeight?: string | number;
  avatarTextBackground?: string;
};
