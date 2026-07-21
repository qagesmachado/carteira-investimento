import { describe, expect, it } from 'vitest';

import type { BudgetTransaction } from '$lib/api/budget';

import { sortBudgetTransactions, toggleSortDirection } from './sortBudgetTransactions';

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

describe('sortBudgetTransactions', () => {
  const txs = [
    makeTx({ id: 1, event_date: '2026-07-08', description: 'Celular', amount_brl: 80, tag_name: 'Casa' }),
    makeTx({ id: 2, event_date: '2026-07-01', description: 'Aluguel', amount_brl: 650, tag_name: 'Casa' }),
    makeTx({ id: 3, event_date: '2026-07-09', description: 'Ração', amount_brl: 312, tag_name: 'Cachorro' })
  ];

  it('ordena por data ascendente', () => {
    const result = sortBudgetTransactions(txs, 'event_date', 'asc');
    expect(result.map((t) => t.id)).toEqual([2, 1, 3]);
  });

  it('ordena por data descendente', () => {
    const result = sortBudgetTransactions(txs, 'event_date', 'desc');
    expect(result.map((t) => t.id)).toEqual([3, 1, 2]);
  });

  it('ordena por valor ascendente', () => {
    const result = sortBudgetTransactions(txs, 'amount_brl', 'asc');
    expect(result.map((t) => t.id)).toEqual([1, 3, 2]);
  });

  it('ordena por descrição respeitando pt-BR', () => {
    const result = sortBudgetTransactions(txs, 'description', 'asc');
    expect(result.map((t) => t.description)).toEqual(['Aluguel', 'Celular', 'Ração']);
  });

  it('ordena por meta (categoria) com nulos tratados como vazio', () => {
    const rows = [
      makeTx({ id: 20, category_name: 'Conforto' }),
      makeTx({ id: 21, category_name: null }),
      makeTx({ id: 22, category_name: 'Custos fixos' })
    ];
    const result = sortBudgetTransactions(rows, 'category_name', 'asc');
    expect(result.map((t) => t.id)).toEqual([21, 20, 22]);
  });

  it('ordena por tag com nulos tratados como vazio', () => {
    const withNull = [
      makeTx({ id: 10, tag_name: 'Casa' }),
      makeTx({ id: 11, tag_name: null }),
      makeTx({ id: 12, tag_name: 'Carro' })
    ];
    const result = sortBudgetTransactions(withNull, 'tag_name', 'asc');
    expect(result.map((t) => t.id)).toEqual([11, 12, 10]);
  });

  it('não muta o array original', () => {
    const original = [...txs];
    sortBudgetTransactions(txs, 'amount_brl', 'desc');
    expect(txs).toEqual(original);
  });
});

describe('toggleSortDirection', () => {
  it('alterna entre asc e desc', () => {
    expect(toggleSortDirection('asc')).toBe('desc');
    expect(toggleSortDirection('desc')).toBe('asc');
  });
});
