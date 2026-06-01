import { padZero } from '../utils';
import type { Translate } from '../utils/create';
import type {
  RangeInputDateShortcutType,
  RangeInputShortcut,
} from './types';

export const DATE_SHORTCUT_TYPES: RangeInputDateShortcutType[] = [
  'lastWeek',
  'lastMonth',
  'lastThreeMonths',
];

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const getDayByOffset = (date: Date, offset: number) => {
  const cloned = new Date(date);
  cloned.setDate(cloned.getDate() + offset);
  return cloned;
};

export const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(
    date.getDate(),
  )}`;

export const getDateRangeByDayCount = (dayCount: number): [string, string] => {
  const end = getToday();
  const start = getDayByOffset(end, -(dayCount - 1));
  return [formatDateValue(start), formatDateValue(end)];
};

const DATE_SHORTCUT_MAP: Record<
  RangeInputDateShortcutType,
  (translate: Translate) => RangeInputShortcut
> = {
  lastWeek: (translate) => ({
    label: translate('lastWeek'),
    value: getDateRangeByDayCount(7),
  }),
  lastMonth: (translate) => ({
    label: translate('lastMonth'),
    value: getDateRangeByDayCount(30),
  }),
  lastThreeMonths: (translate) => ({
    label: translate('lastThreeMonths'),
    value: getDateRangeByDayCount(90),
  }),
};

export const getDefaultDateShortcuts = (
  translate: Translate,
  types: RangeInputDateShortcutType[] = DATE_SHORTCUT_TYPES,
): RangeInputShortcut[] =>
  types.map((type) => DATE_SHORTCUT_MAP[type](translate));
