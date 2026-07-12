import type { BudgetMonthIncomeItem } from '$lib/api/budget';

export function formatBudgetIncomeType(recurring: boolean): string {
  return recurring ? 'Recorrente' : 'Pontual';
}

export function incomesReadyToSave(items: BudgetMonthIncomeItem[]): BudgetMonthIncomeItem[] {
  return items.filter((item) => item.amount_brl > 0);
}
