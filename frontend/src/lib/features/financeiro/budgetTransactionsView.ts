import type { BudgetTransaction } from '$lib/api/budget';

export type BudgetTransactionTypeFilter = 'all' | 'income' | 'expense';

export type BudgetTransactionFilters = {
  search: string;
  type: BudgetTransactionTypeFilter;
  categoryName: string;
  tagName: string;
};

export const DEFAULT_BUDGET_TRANSACTION_FILTERS: BudgetTransactionFilters = {
  search: '',
  type: 'all',
  categoryName: '',
  tagName: ''
};

export function filterBudgetTransactions(
  transactions: BudgetTransaction[],
  filters: BudgetTransactionFilters
): BudgetTransaction[] {
  const search = filters.search.trim().toLocaleLowerCase('pt-BR');
  return transactions.filter((tx) => {
    if (filters.type !== 'all' && tx.transaction_type !== filters.type) {
      return false;
    }
    if (filters.categoryName && (tx.category_name ?? '') !== filters.categoryName) {
      return false;
    }
    if (filters.tagName && (tx.tag_name ?? '') !== filters.tagName) {
      return false;
    }
    if (search && !tx.description.toLocaleLowerCase('pt-BR').includes(search)) {
      return false;
    }
    return true;
  });
}

export function uniqueCategoryNames(transactions: BudgetTransaction[]): string[] {
  const names = new Set<string>();
  for (const tx of transactions) {
    if (tx.category_name) {
      names.add(tx.category_name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function uniqueTagNames(transactions: BudgetTransaction[]): string[] {
  const names = new Set<string>();
  for (const tx of transactions) {
    if (tx.tag_name) {
      names.add(tx.tag_name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
