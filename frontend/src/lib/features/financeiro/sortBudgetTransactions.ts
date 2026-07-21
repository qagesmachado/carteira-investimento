import type { BudgetTransaction } from '$lib/api/budget';

export type BudgetTransactionSortKey =
  | 'event_date'
  | 'description'
  | 'tag_name'
  | 'category_name'
  | 'amount_brl';

export type SortDirection = 'asc' | 'desc';

export function sortBudgetTransactions(
  transactions: BudgetTransaction[],
  key: BudgetTransactionSortKey,
  direction: SortDirection
): BudgetTransaction[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...transactions].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'event_date':
        cmp = a.event_date.localeCompare(b.event_date);
        break;
      case 'description':
        cmp = a.description.localeCompare(b.description, 'pt-BR');
        break;
      case 'tag_name':
        cmp = (a.tag_name ?? '').localeCompare(b.tag_name ?? '', 'pt-BR');
        break;
      case 'category_name':
        cmp = (a.category_name ?? '').localeCompare(b.category_name ?? '', 'pt-BR');
        break;
      case 'amount_brl':
        cmp = a.amount_brl - b.amount_brl;
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0 && key !== 'event_date') {
      cmp = b.event_date.localeCompare(a.event_date);
    }
    return cmp * factor;
  });
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}
