import type { BudgetRecurringExpense } from '$lib/api/budget';

import type { SortDirection } from './sortBudgetTransactions';

export type RecurringExpenseSortKey =
  | 'day_of_month'
  | 'description'
  | 'category_name'
  | 'tag_name'
  | 'start_year_month'
  | 'amount_brl';

export function sortBudgetRecurringExpenses(
  rows: BudgetRecurringExpense[],
  key: RecurringExpenseSortKey,
  direction: SortDirection
): BudgetRecurringExpense[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'day_of_month':
        cmp = a.day_of_month - b.day_of_month;
        break;
      case 'description':
        cmp = a.description.localeCompare(b.description, 'pt-BR');
        break;
      case 'category_name':
        cmp = (a.category_name ?? '').localeCompare(b.category_name ?? '', 'pt-BR');
        break;
      case 'tag_name':
        cmp = (a.tag_name ?? '').localeCompare(b.tag_name ?? '', 'pt-BR');
        break;
      case 'start_year_month':
        cmp = a.start_year_month.localeCompare(b.start_year_month);
        break;
      case 'amount_brl':
        cmp = a.amount_brl - b.amount_brl;
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0 && key !== 'description') {
      cmp = a.description.localeCompare(b.description, 'pt-BR');
    }
    return cmp * factor;
  });
}
