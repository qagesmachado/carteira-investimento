import type { BudgetRecurringExpense, BudgetTransaction } from '$lib/api/budget';

export type BudgetExpenseFilterState = {
  search: string;
  categoryName: string;
  tagName: string;
};

export const DEFAULT_BUDGET_EXPENSE_FILTER: BudgetExpenseFilterState = {
  search: '',
  categoryName: '',
  tagName: ''
};

function matchesText(description: string, search: string): boolean {
  const query = search.trim().toLocaleLowerCase('pt-BR');
  return !query || description.toLocaleLowerCase('pt-BR').includes(query);
}

export function filterExpenseTransactions(
  rows: BudgetTransaction[],
  filters: BudgetExpenseFilterState
): BudgetTransaction[] {
  return rows.filter(
    (row) =>
      matchesText(row.description, filters.search) &&
      (!filters.categoryName || (row.category_name ?? '') === filters.categoryName) &&
      (!filters.tagName || (row.tag_name ?? '') === filters.tagName)
  );
}

export function filterRecurringExpenses(
  rows: BudgetRecurringExpense[],
  filters: BudgetExpenseFilterState
): BudgetRecurringExpense[] {
  return rows.filter(
    (row) =>
      matchesText(row.description, filters.search) &&
      (!filters.categoryName || (row.category_name ?? '') === filters.categoryName) &&
      (!filters.tagName || (row.tag_name ?? '') === filters.tagName)
  );
}

export function uniqueNames(values: (string | null | undefined)[]): string[] {
  const names = new Set<string>();
  for (const value of values) {
    if (value) {
      names.add(value);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
