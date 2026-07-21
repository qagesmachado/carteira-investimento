import { describe, expect, it } from 'vitest';

import type { BudgetRecurringExpense } from '$lib/api/budget';

import { sortBudgetRecurringExpenses } from './sortBudgetRecurringExpenses';

function makeRule(overrides: Partial<BudgetRecurringExpense>): BudgetRecurringExpense {
  return {
    id: 1,
    profile_id: 1,
    description: 'Regra',
    amount_brl: 100,
    category_id: 1,
    category_name: 'Custos fixos',
    tag_id: null,
    tag_name: null,
    day_of_month: 10,
    start_year_month: '2026-01',
    end_year_month: null,
    indefinite: true,
    is_active: true,
    ...overrides
  };
}

const rules = [
  makeRule({ id: 1, description: 'Aluguel', day_of_month: 5, amount_brl: 650 }),
  makeRule({ id: 2, description: 'Internet', day_of_month: 20, amount_brl: 100 }),
  makeRule({ id: 3, description: 'Água', day_of_month: 10, amount_brl: 90 })
];

describe('sortBudgetRecurringExpenses', () => {
  it('ordena por dia ascendente', () => {
    expect(sortBudgetRecurringExpenses(rules, 'day_of_month', 'asc').map((r) => r.id)).toEqual([1, 3, 2]);
  });

  it('ordena por valor descendente', () => {
    expect(sortBudgetRecurringExpenses(rules, 'amount_brl', 'desc').map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('ordena por descrição respeitando pt-BR', () => {
    expect(sortBudgetRecurringExpenses(rules, 'description', 'asc').map((r) => r.description)).toEqual([
      'Água',
      'Aluguel',
      'Internet'
    ]);
  });

  it('não muta o array original', () => {
    const original = [...rules];
    sortBudgetRecurringExpenses(rules, 'amount_brl', 'asc');
    expect(rules).toEqual(original);
  });
});
