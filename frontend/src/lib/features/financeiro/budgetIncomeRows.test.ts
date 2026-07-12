import { describe, expect, it } from 'vitest';

import type { BudgetMonthIncomeItem } from '$lib/api/budget';

import { formatBudgetIncomeType, incomesReadyToSave } from './budgetIncomeRows';

describe('formatBudgetIncomeType', () => {
  it('identifica renda recorrente e pontual', () => {
    expect(formatBudgetIncomeType(true)).toBe('Recorrente');
    expect(formatBudgetIncomeType(false)).toBe('Pontual');
  });
});

describe('incomesReadyToSave', () => {
  it('ignora linhas com valor zero', () => {
    const items: BudgetMonthIncomeItem[] = [
      { source_id: 1, label: 'CLT', amount_brl: 0 },
      { source_id: null, label: 'Extra', amount_brl: 100 }
    ];
    expect(incomesReadyToSave(items)).toEqual([
      { source_id: null, label: 'Extra', amount_brl: 100 }
    ]);
  });
});
