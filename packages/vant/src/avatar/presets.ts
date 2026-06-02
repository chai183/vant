import type { AvatarType } from './types';
import defaultAvatar from './assets/avatar-default.svg';
import groupAvatar from './assets/avatar-group.svg';
import maleAvatar from './assets/avatar-male.svg';
import femaleAvatar from './assets/avatar-female.svg';

export const PRESET_AVATAR: Record<Exclude<AvatarType, 'text'>, string> = {
  default: defaultAvatar,
  group: groupAvatar,
  male: maleAvatar,
  female: femaleAvatar,
};
