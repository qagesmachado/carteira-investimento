import { describe, expect, it } from 'vitest';

import type { BudgetTransaction } from '$lib/api/budget';

import {
  filterBudgetTransactions,
  uniqueCategoryNames,
  uniqueTagNames
} from './budgetTransactionsView';

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

const sample = [
  makeTx({ id: 1, description: 'Aluguel', category_name: 'Custos fixos', tag_name: 'Casa', transaction_type: 'expense' }),
  makeTx({ id: 2, description: 'Salário', category_name: 'Liberdade Financeira', tag_name: null, transaction_type: 'income' }),
  makeTx({ id: 3, description: 'Ração Scooby', category_name: 'Custos fixos', tag_name: 'Cachorro', transaction_type: 'expense' })
];

describe('filterBudgetTransactions', () => {
  it('sem filtros retorna tudo', () => {
    const result = filterBudgetTransactions(sample, {
      search: '',
      type: 'all',
      categoryName: '',
      tagName: ''
    });
    expect(result).toHaveLength(3);
  });

  it('filtra por tipo', () => {
    const result = filterBudgetTransactions(sample, {
      search: '',
      type: 'income',
      categoryName: '',
      tagName: ''
    });
    expect(result.map((t) => t.id)).toEqual([2]);
  });

  it('filtra por texto na descrição (case-insensitive)', () => {
    const result = filterBudgetTransactions(sample, {
      search: 'ração',
      type: 'all',
      categoryName: '',
      tagName: ''
    });
    expect(result.map((t) => t.id)).toEqual([3]);
  });

  it('filtra por categoria', () => {
    const result = filterBudgetTransactions(sample, {
      search: '',
      type: 'all',
      categoryName: 'Custos fixos',
      tagName: ''
    });
    expect(result.map((t) => t.id)).toEqual([1, 3]);
  });

  it('filtra por tag', () => {
    const result = filterBudgetTransactions(sample, {
      search: '',
      type: 'all',
      categoryName: '',
      tagName: 'Cachorro'
    });
    expect(result.map((t) => t.id)).toEqual([3]);
  });

  it('combina filtros', () => {
    const result = filterBudgetTransactions(sample, {
      search: 'a',
      type: 'expense',
      categoryName: 'Custos fixos',
      tagName: 'Casa'
    });
    expect(result.map((t) => t.id)).toEqual([1]);
  });
});

describe('uniqueCategoryNames / uniqueTagNames', () => {
  it('retorna nomes únicos ordenados sem nulos', () => {
    expect(uniqueCategoryNames(sample)).toEqual(['Custos fixos', 'Liberdade Financeira']);
    expect(uniqueTagNames(sample)).toEqual(['Cachorro', 'Casa']);
  });
});
