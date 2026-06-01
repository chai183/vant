import { HTMLAttributes, InputHTMLAttributes } from 'vue';
import {
  isObject,
  isPromise,
  isFunction,
  getRootScrollTop,
  setRootScrollTop,
} from '../utils';
import type { FieldRule, FieldType, FieldAutosizeConfig } from './types';

export function isEmptyValue(value: unknown) {
  if (Array.isArray(value)) {
    return !value.length;
  }
  if (value === 0) {
    return false;
  }
  return !value;
}

export function runSyncRule(value: unknown, rule: FieldRule) {
  if (isEmptyValue(value)) {
    if (rule.required) {
      return false;
    }
    if (rule.validateEmpty === false) {
      return true;
    }
  }
  if (rule.pattern && !rule.pattern.test(String(value))) {
    return false;
  }
  return true;
}

export function runRuleValidator(value: unknown, rule: FieldRule) {
  return new Promise((resolve) => {
    const returnVal = rule.validator!(value, rule);

    if (isPromise(returnVal)) {
      returnVal.then(resolve);
      return;
    }

    resolve(returnVal);
  });
}

export function getRuleMessage(value: unknown, rule: FieldRule) {
  const { message } = rule;

  if (isFunction(message)) {
    return message(value, rule);
  }
  return message || '';
}

export function startComposing({ target }: Event) {
  target!.composing = true;
}

export function endComposing({ target }: Event) {
  if (target!.composing) {
    target!.composing = false;
    target!.dispatchEvent(new Event('input'));
  }
}

export function resizeTextarea(
  input: HTMLInputElement,
  autosize: true | FieldAutosizeConfig,
) {
  const scrollTop = getRootScrollTop();
  input.style.height = 'auto';

  let height = input.scrollHeight;
  if (isObject(autosize)) {
    const { maxHeight, minHeight } = autosize;
    if (maxHeight !== undefined) {
      height = Math.min(height, maxHeight);
    }
    if (minHeight !== undefined) {
      height = Math.max(height, minHeight);
    }
  }

  if (height) {
    input.style.height = `${height}px`;
    // https://github.com/vant-ui/vant/issues/9178
    setRootScrollTop(scrollTop);
  }
}

export function mapInputType(
  type: FieldType,
  inputmode?: HTMLAttributes['inputmode'],
): {
  type: InputHTMLAttributes['type'];
  inputmode?: HTMLAttributes['inputmode'];
} {
  // type="number" is weird in iOS, and can't prevent dot in Android
  // so use inputmode to set keyboard in modern browsers
  if (type === 'number' || type === 'money') {
    type = 'text';
    inputmode ??= 'decimal';
  }

  if (type === 'digit') {
    type = 'tel';
    inputmode ??= 'numeric';
  }

  if (type === 'account') {
    type = 'text';
    inputmode ??= 'numeric';
  }

  if (type === 'idcard') {
    type = 'text';
  }

  if (type === 'ukey') {
    type = 'text';
  }

  return { type, inputmode };
}

// get correct length of emoji
// https://github.com/vant-ui/vant/issues/10032
export function getStringLength(str: string) {
  return [...str].length;
}

// cut string with emoji
export function cutString(str: string, maxlength: number) {
  return [...str].slice(0, maxlength).join('');
}

// Thousands separator for money field display (integer part only).
export function formatMoneyThousands(value: string) {
  if (value === '') {
    return '';
  }

  const isNegative = value[0] === '-';
  const abs = isNegative ? value.slice(1) : value;
  const dotIndex = abs.indexOf('.');
  const intPart = dotIndex === -1 ? abs : abs.slice(0, dotIndex);
  const fraction = dotIndex === -1 ? '' : abs.slice(dotIndex);

  if (intPart === '') {
    return (isNegative ? '-' : '') + abs;
  }

  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (isNegative ? '-' : '') + grouped + fraction;
}

/** Clamp integer and decimal digit lengths for money input (no commas). */
export function limitMoneyDigits(
  value: string,
  maxIntegerDigits = 10,
  maxDecimalDigits = 2,
) {
  if (value === '' || maxIntegerDigits <= 0) {
    return value;
  }

  const neg = value[0] === '-';
  const abs = neg ? value.slice(1) : value;
  const dot = abs.indexOf('.');
  let intPart = dot === -1 ? abs : abs.slice(0, dot);
  let frac = dot === -1 ? '' : abs.slice(dot + 1);

  if (intPart.length > maxIntegerDigits) {
    intPart = intPart.slice(0, maxIntegerDigits);
  }

  if (frac.length > maxDecimalDigits) {
    frac = frac.slice(0, maxDecimalDigits);
  }

  if (dot === -1) {
    return (neg ? '-' : '') + intPart;
  }
  return (neg ? '-' : '') + intPart + '.' + frac;
}

/** Mobile phone display: 3-4-4 with spaces; second space appears from the 8th digit onward (not only when 11 digits are complete). */
export function formatTelDisplay(digits: string) {
  if (digits === '') {
    return '';
  }
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) {
    return d;
  }
  if (d.length <= 7) {
    return `${d.slice(0, 3)} ${d.slice(3)}`;
  }
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`;
}

// Map raw digit offset to caret index in tel display string (spaces are skipped in `seen`).
export function telRawOffsetToDisplayIndex(display: string, rawOffset: number) {
  if (rawOffset <= 0) {
    return 0;
  }

  let seen = 0;
  for (let i = 0; i < display.length; i++) {
    if (display[i] !== ' ') {
      seen++;
      if (seen === rawOffset) {
        return i + 1;
      }
    }
  }

  return display.length;
}

/** Account / bank-style number: space every 4 digits; `digits` should be digit-only from caller. */
export function formatAccountDisplay(digits: string) {
  if (digits === '') {
    return '';
  }
  const d = digits.replace(/\D/g, '');
  if (d.length <= 4) {
    return d;
  }
  let out = d.slice(0, 4);
  for (let i = 4; i < d.length; i += 4) {
    out += ` ${d.slice(i, i + 4)}`;
  }
  return out;
}

// Same as tel: display only adds spaces between digit runs.
export const accountRawOffsetToDisplayIndex = telRawOffsetToDisplayIndex;

/** PRC id card model max length (17 digits + check digit 0-9 or X). */
export const IDCARD_MODEL_MAX_LEN = 18;

/** Normalize id-card model: digits + optional trailing X only, max 18. */
export function normalizeIdCardValue(input: string): string {
  let v = input.replace(/[^0-9Xx]/g, '');
  if (v.length > IDCARD_MODEL_MAX_LEN) {
    v = v.slice(0, IDCARD_MODEL_MAX_LEN);
  }
  if (v.endsWith('x')) {
    v = `${v.slice(0, -1)}X`;
  }
  const last = v.slice(-1);
  if (last === 'X') {
    const digits = v.slice(0, -1).replace(/[Xx]/g, '');
    return `${digits.slice(0, 17)}${digits.length === 17 ? 'X' : ''}`;
  }
  return v.replace(/[Xx]/g, '').slice(0, IDCARD_MODEL_MAX_LEN);
}

/** Id card display: 6 chars + space, then groups of 4 (last group may contain X). */
export function formatIdCardDisplay(id: string) {
  if (id === '') {
    return '';
  }
  if (id.length <= 6) {
    return id;
  }
  const head = id.slice(0, 6);
  const rest = id.slice(6);
  let out = `${head} `;
  for (let i = 0; i < rest.length; i += 4) {
    if (i > 0) {
      out += ' ';
    }
    out += rest.slice(i, i + 4);
  }
  return out;
}

export const idcardRawOffsetToDisplayIndex = telRawOffsetToDisplayIndex;

/** UKey / serial: space every 4 chars; model is [0-9A-Za-z] only (caller may pre-strip). */
export function formatUkeyDisplay(raw: string) {
  if (raw === '') {
    return '';
  }
  const d = raw.replace(/[^0-9A-Za-z]/g, '');
  if (d.length <= 4) {
    return d;
  }
  let out = d.slice(0, 4);
  for (let i = 4; i < d.length; i += 4) {
    out += ` ${d.slice(i, i + 4)}`;
  }
  return out;
}

export const ukeyRawOffsetToDisplayIndex = telRawOffsetToDisplayIndex;

// Map raw-string offset (no commas) to caret index in money display string.
export function moneyRawOffsetToDisplayIndex(display: string, rawOffset: number) {
  if (rawOffset <= 0) {
    return 0;
  }

  let seen = 0;
  for (let i = 0; i < display.length; i++) {
    if (display[i] !== ',') {
      seen++;
      if (seen === rawOffset) {
        return i + 1;
      }
    }
  }

  return display.length;
}

const MONEY_UNIT_SMALL = ['', '拾', '佰', '仟'];
const MONEY_UNIT_BIG = ['', '万', '亿', '兆'];

/** Label for the magnitude of the leading digit in a money amount (仟、万、亿…). */
export function getMoneyUnitLabel(amount: string): string {
  const normalized = amount.replace(/,/g, '').trim();
  const [intPart = ''] = normalized.split('.');
  const digits = intPart.replace(/[^\d]/g, '').replace(/^0+/, '');
  if (!digits) {
    return '';
  }

  const exp = digits.length - 1;
  if (exp < 3) {
    return '';
  }

  const bigIndex = Math.floor(exp / 4);
  const smallIndex = exp % 4;

  if (bigIndex >= MONEY_UNIT_BIG.length) {
    return MONEY_UNIT_SMALL[3] + MONEY_UNIT_BIG[MONEY_UNIT_BIG.length - 1];
  }

  const bigPart = MONEY_UNIT_BIG[bigIndex];
  const smallPart = MONEY_UNIT_SMALL[smallIndex];

  if (smallIndex === 0) {
    return bigPart;
  }
  return smallPart + bigPart;
}

const MONEY_UPPER_CN = '零壹贰叁肆伍陆柒捌玖';
const MONEY_UPPER_UNIT = '仟佰拾亿仟佰拾万仟佰拾亿仟佰拾万仟佰拾元角分';

/** Convert a money amount string (digits + optional dot + up to 2 decimals) to RMB uppercase Chinese. */
export function moneyStringToChineseUppercase(amount: string): string {
  const s = amount.replace(/,/g, '').trim();
  if (!s) {
    return '';
  }

  const [rawInt, rawDec = ''] = s.split('.');
  if (!/^\d*$/.test(rawInt) || !/^\d*$/.test(rawDec)) {
    return '';
  }

  const dec = `${rawDec}00`.slice(0, 2);
  let intStr = rawInt === '' ? '0' : rawInt;
  intStr = intStr.replace(/^0+/, '') || '0';
  const isZeroYuan = intStr === '0';

  const n = intStr + dec;
  if (n.length > MONEY_UPPER_UNIT.length) {
    return '';
  }

  const u = MONEY_UPPER_UNIT.slice(MONEY_UPPER_UNIT.length - n.length);
  let r = '';
  for (let i = 0; i < n.length; i++) {
    r += MONEY_UPPER_CN[+n[i]] + u[i];
  }

  r = r
    .replace(/零(仟|佰|拾)/g, '零')
    .replace(/零+/g, '零')
    .replace(/零(万|亿|元)/g, '$1')
    .replace(/亿万/g, '亿')
    .replace(/零角/g, '零')
    .replace(/零分$/g, '')
    .replace(/元零角零分$/, '元整')
    .replace(/元零$/, '元整')
    .replace(/角零$/, '角整')
    .replace(/元$/g, '元整')
    .replace(/角$/g, '角整');

  if (isZeroYuan) {
    r = r.replace(/^元/, '').replace(/^零+/, '');
  }

  if (r === '整' || r === '角整') {
    return '零元整';
  }
  if (!r) {
    return '零元整';
  }
  return r;
}
