import type { BudgetMonthIncomeItem } from '$lib/api/budget';

import { formatYearMonthLabel } from './budgetMonth';

export type BudgetIncomeDeleteAction = 'delete-pontual' | 'stop-from-month' | 'delete-all';

export type BudgetIncomeDeleteTarget =
  | { kind: 'pontual'; income: BudgetMonthIncomeItem }
  | {
      kind: 'recurring';
      sourceId: number;
      label: string;
      amount_brl: number;
      fromYearMonth: string;
    };

export function buildBudgetIncomeDeleteCopy(
  target: BudgetIncomeDeleteTarget,
  formatValue: (value: number) => string
): {
  title: string;
  message: string;
  warning: string | null;
  stopFromMonthLabel: string | null;
} {
  if (target.kind === 'recurring') {
    return {
      title: 'Parar renda recorrente',
      message: `«${target.label}» (${formatValue(target.amount_brl)})`,
      warning: 'Meses anteriores permanecem no histórico. Só deixam de ser lançados a partir do mês escolhido.',
      stopFromMonthLabel: formatYearMonthLabel(target.fromYearMonth)
    };
  }

  return {
    title: 'Excluir renda',
    message: `Deseja excluir «${target.income.label}» (${formatValue(target.income.amount_brl)})?`,
    warning: null,
    stopFromMonthLabel: null
  };
}
