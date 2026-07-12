import type { BudgetRecurringExpense, BudgetTransaction } from '$lib/api/budget';

import { formatYearMonthLabel } from './budgetMonth';

export function listMonthExpenses(transactions: BudgetTransaction[]): BudgetTransaction[] {
  return transactions.filter((transaction) => transaction.transaction_type === 'expense');
}

export function splitRecurringAndPontual(expenses: BudgetTransaction[]): {
  recurring: BudgetTransaction[];
  pontual: BudgetTransaction[];
} {
  const recurring: BudgetTransaction[] = [];
  const pontual: BudgetTransaction[] = [];
  for (const expense of expenses) {
    if (expense.recurring) {
      recurring.push(expense);
    } else {
      pontual.push(expense);
    }
  }
  return { recurring, pontual };
}

export function formatRecurringEndLabel(rule: BudgetRecurringExpense): string {
  if (rule.indefinite || !rule.end_year_month) {
    return 'Indeterminado';
  }
  return formatYearMonthLabel(rule.end_year_month);
}
