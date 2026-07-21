export type SettlementFilter = 'all' | 'pending' | 'done';

export type SettlementSummary = {
  totalCount: number;
  doneCount: number;
  totalAmount: number;
  doneAmount: number;
  pendingAmount: number;
};

export function filterSettlementItems<T extends { done: boolean }>(
  items: T[],
  filter: SettlementFilter
): T[] {
  if (filter === 'pending') {
    return items.filter((item) => !item.done);
  }
  if (filter === 'done') {
    return items.filter((item) => item.done);
  }
  return items;
}

export function summarizeSettlement(items: { amount_brl: number; done: boolean }[]): SettlementSummary {
  let totalAmount = 0;
  let doneAmount = 0;
  let doneCount = 0;
  for (const item of items) {
    totalAmount += item.amount_brl;
    if (item.done) {
      doneAmount += item.amount_brl;
      doneCount += 1;
    }
  }
  return {
    totalCount: items.length,
    doneCount,
    totalAmount,
    doneAmount,
    pendingAmount: totalAmount - doneAmount
  };
}
