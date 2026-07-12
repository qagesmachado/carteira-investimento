import { describe, expect, it } from 'vitest';

import {
  compareYearMonths,
  countMonthsInclusive,
  currentYearMonth,
  formatYearMonthChartLabel,
  formatYearMonthLabel,
  normalizeTargetPercent,
  percentFromTargetAmount,
  shiftYearMonth,
  sumTargetPercents,
  targetAmountFromPercent
} from './budgetMonth';

describe('budgetMonth', () => {
  it('formata mês em pt-BR', () => {
    expect(formatYearMonthLabel('2026-07')).toBe('julho/2026');
  });

  it('formata mês curto para gráficos', () => {
    expect(formatYearMonthChartLabel('2026-07')).toBe('jul/26');
    expect(formatYearMonthChartLabel('2025-09')).toBe('set/25');
  });

  it('desloca mês', () => {
    expect(shiftYearMonth('2026-01', -1)).toBe('2025-12');
  });

  it('compara e conta meses inclusivos', () => {
    expect(compareYearMonths('2026-03', '2026-01')).toBe(2);
    expect(countMonthsInclusive('2026-01', '2026-03')).toBe(3);
    expect(countMonthsInclusive('2026-03', '2026-01')).toBe(0);
  });

  it('calcula valor meta a partir de percentual', () => {
    expect(targetAmountFromPercent(10000, 35)).toBe(3500);
  });

  it('normaliza percentual de meta para inteiro', () => {
    expect(normalizeTargetPercent(33.8)).toBe(34);
    expect(normalizeTargetPercent(-5)).toBe(0);
    expect(normalizeTargetPercent(150)).toBe(100);
  });

  it('calcula percentual a partir de valor', () => {
    expect(percentFromTargetAmount(10000, 2500)).toBe(25);
  });

  it('valida soma de metas', () => {
    expect(sumTargetPercents([{ percent: 50 }, { percent: 50 }])).toBe(100);
  });

  it('currentYearMonth retorna YYYY-MM', () => {
    expect(currentYearMonth(new Date('2026-07-15'))).toBe('2026-07');
  });
});
