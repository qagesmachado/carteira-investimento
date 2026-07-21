import type { BudgetRecurringExpense, BudgetTransaction } from '$lib/api/budget';

import { compareYearMonths, formatYearMonthLabel } from './budgetMonth';

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

/**
 * Regra recorrente está vigente no mês de referência quando é indeterminada
 * ou seu último mês cobrado (`end_year_month`, inclusivo) é igual/posterior ao
 * mês visualizado. Regras encerradas antes do mês não são mais recorrências.
 */
export function isRecurringActiveInMonth(
  rule: BudgetRecurringExpense,
  referenceYearMonth: string
): boolean {
  if (rule.indefinite || !rule.end_year_month) {
    return true;
  }
  return compareYearMonths(rule.end_year_month, referenceYearMonth) >= 0;
}

/** Mantém apenas regras recorrentes vigentes no mês de referência. */
export function filterActiveRecurringExpenses(
  rules: BudgetRecurringExpense[],
  referenceYearMonth: string
): BudgetRecurringExpense[] {
  return rules.filter((rule) => isRecurringActiveInMonth(rule, referenceYearMonth));
}
