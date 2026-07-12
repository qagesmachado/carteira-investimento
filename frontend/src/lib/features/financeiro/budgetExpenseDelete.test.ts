import { describe, expect, it } from 'vitest';

import type { BudgetTransaction } from '$lib/api/budget';

import { buildBudgetExpenseDeleteCopy } from './budgetExpenseDelete';

describe('buildBudgetExpenseDeleteCopy', () => {
  const formatValue = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  it('monta texto para despesa pontual', () => {
    const expense: BudgetTransaction = {
      id: 1,
      profile_id: 1,
      month_id: 1,
      transaction_type: 'expense',
      event_date: '2026-07-10',
      description: 'Mercado',
      amount_brl: 250,
      category_id: 1,
      category_name: 'Custos fixos',
      tag_id: null,
      tag_name: null,
      tag_color: null,
      income_source_id: null,
      notes: null,
      recurring: false
    };

    expect(buildBudgetExpenseDeleteCopy({ kind: 'pontual', expense }, formatValue)).toEqual({
      title: 'Excluir despesa',
      message: 'Deseja excluir «Mercado» (R$ 250,00)?',
      warning: null,
      stopFromMonthLabel: null
    });
  });

  it('monta texto para parar recorrência a partir do mês', () => {
    const copy = buildBudgetExpenseDeleteCopy(
      {
        kind: 'recurring',
        ruleId: 10,
        description: 'Energia',
        amount_brl: 250,
        fromYearMonth: '2026-09'
      },
      formatValue
    );

    expect(copy.title).toBe('Parar despesa recorrente');
    expect(copy.stopFromMonthLabel).toBe('setembro/2026');
    expect(copy.warning).toContain('Meses anteriores permanecem');
  });
});
