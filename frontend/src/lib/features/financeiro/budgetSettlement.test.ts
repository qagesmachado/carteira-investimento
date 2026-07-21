import { describe, expect, it } from 'vitest';

import { filterSettlementItems, summarizeSettlement } from './budgetSettlement';

describe('filterSettlementItems', () => {
  const items = [
    { id: 1, done: false },
    { id: 2, done: true },
    { id: 3, done: false }
  ];

  it('filtra pendentes e conferidas', () => {
    expect(filterSettlementItems(items, 'pending').map((i) => i.id)).toEqual([1, 3]);
    expect(filterSettlementItems(items, 'done').map((i) => i.id)).toEqual([2]);
    expect(filterSettlementItems(items, 'all')).toHaveLength(3);
  });
});

describe('summarizeSettlement', () => {
  it('soma previsto, conferido e pendente', () => {
    const summary = summarizeSettlement([
      { amount_brl: 5000, done: true },
      { amount_brl: 1200, done: false },
      { amount_brl: 300, done: true }
    ]);
    expect(summary).toEqual({
      totalCount: 3,
      doneCount: 2,
      totalAmount: 6500,
      doneAmount: 5300,
      pendingAmount: 1200
    });
  });
});
