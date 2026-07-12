import { describe, expect, it } from 'vitest';

import {
  barHeightPercent,
  buildCashflowYAxisTicks,
  computeCashflowBalance,
  computeCashflowMaxValue,
  formatCashflowTooltipMonth
} from './budgetCashflowChart';

describe('budgetCashflowChart', () => {
  it('calcula máximo do eixo Y', () => {
    expect(
      computeCashflowMaxValue([
        { year_month: '2026-07', income_brl: 3000, expense_brl: 100 },
        { year_month: '2026-08', income_brl: 5000, expense_brl: 4500 }
      ])
    ).toBe(5000);
  });

  it('gera ticks do eixo Y de zero ao máximo', () => {
    expect(buildCashflowYAxisTicks(3000, 4)).toEqual([0, 1000, 2000, 3000]);
  });

  it('calcula saldo receita menos saída', () => {
    expect(computeCashflowBalance(28596.06, 46069.22)).toBe(-17473.16);
  });

  it('formata mês do tooltip em português', () => {
    expect(formatCashflowTooltipMonth('2026-05')).toBe('maio 2026');
  });

  it('calcula altura mínima das barras', () => {
    expect(barHeightPercent(0, 1000)).toBe(4);
    expect(barHeightPercent(500, 1000)).toBe(50);
  });
});
