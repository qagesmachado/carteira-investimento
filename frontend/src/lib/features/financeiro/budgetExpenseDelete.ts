import type { BudgetTransaction } from '$lib/api/budget';

import { formatYearMonthLabel } from './budgetMonth';

export type BudgetExpenseDeleteAction = 'delete-pontual' | 'stop-from-month' | 'delete-all';

export type BudgetExpenseDeleteTarget =
  | { kind: 'pontual'; expense: BudgetTransaction }
  | {
      kind: 'recurring';
      ruleId: number;
      description: string;
      amount_brl: number;
      fromYearMonth: string;
    };

export function buildBudgetExpenseDeleteCopy(
  target: BudgetExpenseDeleteTarget,
  formatValue: (value: number) => string
): {
  title: string;
  message: string;
  warning: string | null;
  stopFromMonthLabel: string | null;
} {
  if (target.kind === 'recurring') {
    return {
      title: 'Parar despesa recorrente',
      message: `«${target.description}» (${formatValue(target.amount_brl)})`,
      warning: 'Meses anteriores permanecem no histórico. Só deixam de ser lançados a partir do mês escolhido.',
      stopFromMonthLabel: formatYearMonthLabel(target.fromYearMonth)
    };
  }

  return {
    title: 'Excluir despesa',
    message: `Deseja excluir «${target.expense.description}» (${formatValue(target.expense.amount_brl)})?`,
    warning: null,
    stopFromMonthLabel: null
  };
}
