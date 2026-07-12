import { describe, expect, it } from 'vitest';

import {
  BR_MONTH_OPTIONS,
  composeYearMonthIso,
  formatYearMonthIsoToBr,
  parseYearMonthIso
} from './brYearMonth';

describe('brYearMonth', () => {
  it('lista meses em português', () => {
    expect(BR_MONTH_OPTIONS[0]).toEqual({ value: '01', label: 'janeiro' });
    expect(BR_MONTH_OPTIONS[11]).toEqual({ value: '12', label: 'dezembro' });
  });

  it('compõe e interpreta YYYY-MM', () => {
    expect(composeYearMonthIso(2026, '07')).toBe('2026-07');
    expect(parseYearMonthIso('2026-07')).toEqual({ year: 2026, month: '07' });
  });

  it('formata mês/ano para exibição pt-BR', () => {
    expect(formatYearMonthIsoToBr('2026-07')).toBe('julho/2026');
    expect(formatYearMonthIsoToBr('invalid')).toBe('');
  });
});
