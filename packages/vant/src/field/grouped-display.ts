import type {
  FieldType,
  FieldGroupedDisplayConfig,
  FieldGroupedDisplayNormalizeContext,
} from './types';
import { isDef } from '../utils';
import {
  formatMoneyThousands,
  formatTelDisplay,
  formatAccountDisplay,
  formatIdCardDisplay,
  formatUkeyDisplay,
  normalizeIdCardValue,
  IDCARD_MODEL_MAX_LEN,
  moneyRawOffsetToDisplayIndex,
  telRawOffsetToDisplayIndex,
  accountRawOffsetToDisplayIndex,
  idcardRawOffsetToDisplayIndex,
  ukeyRawOffsetToDisplayIndex,
} from './utils';

const normalizeMoneyModel: NonNullable<
  FieldGroupedDisplayConfig['normalizeModelValue']
> = (value) => ({
  value: value.replace(/,/g, ''),
});

const normalizeTelModel: NonNullable<
  FieldGroupedDisplayConfig['normalizeModelValue']
> = (value, ctx: FieldGroupedDisplayNormalizeContext) => {
  const digits = value.replace(/\D/g, '');
  const beforeCap = digits;
  const telCap = isDef(ctx.maxlength)
    ? Math.min(11, ctx.maxlength)
    : 11;
  const next =
    beforeCap.length > telCap ? beforeCap.slice(0, telCap) : beforeCap;
  return {
    value: next,
    capDiffLen: beforeCap.length - next.length,
  };
};

const normalizeAccountModel: NonNullable<
  FieldGroupedDisplayConfig['normalizeModelValue']
> = (value, ctx) => {
  let v = value.replace(/\D/g, '');
  const beforeCap = v;
  if (isDef(ctx.maxlength) && v.length > ctx.maxlength) {
    v = v.slice(0, ctx.maxlength);
  }
  return { value: v, capDiffLen: beforeCap.length - v.length };
};

const normalizeIdcardModel: NonNullable<
  FieldGroupedDisplayConfig['normalizeModelValue']
> = (value, ctx) => {
  const beforeNorm = normalizeIdCardValue(value);
  const idCap = isDef(ctx.maxlength)
    ? Math.min(IDCARD_MODEL_MAX_LEN, ctx.maxlength)
    : IDCARD_MODEL_MAX_LEN;
  const next =
    beforeNorm.length > idCap
      ? normalizeIdCardValue(beforeNorm.slice(0, idCap))
      : beforeNorm;
  return {
    value: next,
    capDiffLen: beforeNorm.length - next.length,
  };
};

const normalizeUkeyModel: NonNullable<
  FieldGroupedDisplayConfig['normalizeModelValue']
> = (value, ctx) => {
  let v = value.replace(/[^0-9A-Za-z]/g, '');
  const beforeCap = v;
  if (isDef(ctx.maxlength) && v.length > ctx.maxlength) {
    v = v.slice(0, ctx.maxlength);
  }
  return { value: v, capDiffLen: beforeCap.length - v.length };
};

const BUILTIN_GROUPED_DISPLAY: Partial<Record<FieldType, FieldGroupedDisplayConfig>> =
  {
    money: {
      stripDisplayRegex: /,/g,
      formatDisplay: formatMoneyThousands,
      rawOffsetToDisplayIndex: moneyRawOffsetToDisplayIndex,
      skipLimitValueLength: false,
      normalizeModelValue: normalizeMoneyModel,
    },
    tel: {
      stripDisplayRegex: /\D/g,
      formatDisplay: formatTelDisplay,
      rawOffsetToDisplayIndex: telRawOffsetToDisplayIndex,
      skipLimitValueLength: true,
      normalizeModelValue: normalizeTelModel,
    },
    account: {
      stripDisplayRegex: /\D/g,
      formatDisplay: formatAccountDisplay,
      rawOffsetToDisplayIndex: accountRawOffsetToDisplayIndex,
      skipLimitValueLength: true,
      normalizeModelValue: normalizeAccountModel,
    },
    idcard: {
      stripDisplayRegex: /[^0-9Xx]/g,
      formatDisplay: formatIdCardDisplay,
      rawOffsetToDisplayIndex: idcardRawOffsetToDisplayIndex,
      skipLimitValueLength: true,
      normalizeModelValue: normalizeIdcardModel,
    },
    ukey: {
      stripDisplayRegex: /[^0-9A-Za-z]/g,
      formatDisplay: formatUkeyDisplay,
      rawOffsetToDisplayIndex: ukeyRawOffsetToDisplayIndex,
      skipLimitValueLength: true,
      normalizeModelValue: normalizeUkeyModel,
    },
  };

export function getBuiltinGroupedDisplayConfig(
  type: FieldType,
): FieldGroupedDisplayConfig | undefined {
  return BUILTIN_GROUPED_DISPLAY[type];
}
