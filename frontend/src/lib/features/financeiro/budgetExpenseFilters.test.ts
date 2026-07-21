import { describe, expect, it } from 'vitest';

import type { BudgetRecurringExpense, BudgetTransaction } from '$lib/api/budget';

import {
  filterExpenseTransactions,
  filterRecurringExpenses,
  uniqueNames
} from './budgetExpenseFilters';

function makeTx(overrides: Partial<BudgetTransaction>): BudgetTransaction {
  return {
    id: 1,
    profile_id: 1,
    month_id: 1,
    transaction_type: 'expense',
    event_date: '2026-07-01',
    description: 'Item',
    amount_brl: 100,
    category_id: 1,
    category_name: 'Custos fixos',
    tag_id: null,
    tag_name: null,
    tag_color: null,
    income_source_id: null,
    notes: null,
    ...overrides
  };
}

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

describe('filterExpenseTransactions', () => {
  const rows = [
    makeTx({ id: 1, description: 'Aluguel', category_name: 'Custos fixos', tag_name: 'Casa' }),
    makeTx({ id: 2, description: 'Ração', category_name: 'Custos fixos', tag_name: 'Cachorro' }),
    makeTx({ id: 3, description: 'Cinema', category_name: 'Prazeres', tag_name: null })
  ];

  it('filtra por texto', () => {
    expect(filterExpenseTransactions(rows, { search: 'alug', categoryName: '', tagName: '' }).map((r) => r.id)).toEqual([1]);
  });

  it('filtra por meta e tag combinados', () => {
    expect(
      filterExpenseTransactions(rows, { search: '', categoryName: 'Custos fixos', tagName: 'Cachorro' }).map((r) => r.id)
    ).toEqual([2]);
  });
});

describe('filterRecurringExpenses', () => {
  const rows = [
    makeRule({ id: 1, description: 'Aluguel', category_name: 'Custos fixos', tag_name: 'Casa' }),
    makeRule({ id: 2, description: 'Streaming', category_name: 'Prazeres', tag_name: null })
  ];

  it('filtra por meta', () => {
    expect(filterRecurringExpenses(rows, { search: '', categoryName: 'Prazeres', tagName: '' }).map((r) => r.id)).toEqual([2]);
  });
});

describe('uniqueNames', () => {
  it('remove nulos e ordena', () => {
    expect(uniqueNames(['Casa', null, 'Cachorro', 'Casa', undefined])).toEqual(['Cachorro', 'Casa']);
  });
});
