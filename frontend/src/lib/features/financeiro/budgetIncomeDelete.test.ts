import { describe, expect, it } from 'vitest';

import { buildBudgetIncomeDeleteCopy } from './budgetIncomeDelete';

describe('buildBudgetIncomeDeleteCopy', () => {
  it('monta texto para renda pontual', () => {
    const copy = buildBudgetIncomeDeleteCopy(
      {
        kind: 'pontual',
        income: { id: 1, label: 'Freelance', amount_brl: 1500, recurring: false }
      },
      (value) => `R$ ${value.toFixed(2)}`
    );

    expect(copy.title).toBe('Excluir renda');
    expect(copy.message).toContain('Freelance');
    expect(copy.stopFromMonthLabel).toBeNull();
  });

  it('monta texto para renda recorrente', () => {
    const copy = buildBudgetIncomeDeleteCopy(
      {
        kind: 'recurring',
        sourceId: 10,
        label: 'Salário CLT',
        amount_brl: 5000,
        fromYearMonth: '2026-09'
      },
      (value) => `R$ ${value.toFixed(2)}`
    );

    expect(copy.title).toBe('Parar renda recorrente');
    expect(copy.stopFromMonthLabel).toBe('setembro/2026');
  });
});
