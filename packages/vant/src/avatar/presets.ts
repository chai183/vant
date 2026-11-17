import type { AvatarType } from './types';
// const default_avatar = new URL('./assets/default.svg', import.meta.url).href;
// const male = new URL('./assets/male.svg', import.meta.url).href;
// const female = new URL('./assets/female.svg', import.meta.url).href;
// const group = new URL('./assets/group.svg', import.meta.url).href;
import default_avatar from './assets/default.svg';
import male from './assets/male.svg';
import female from './assets/female.svg';
import group from './assets/group.svg';
export const PRESET_AVATAR: Record<Exclude<AvatarType, 'text'>, string> = {
  default: default_avatar,
  group: group,
  male: male,
  female: female,
};
