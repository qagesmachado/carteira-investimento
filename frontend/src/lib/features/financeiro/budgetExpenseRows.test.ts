import { describe, expect, it } from 'vitest';

import type { BudgetRecurringExpense, BudgetTransaction } from '$lib/api/budget';

import {
  filterActiveRecurringExpenses,
  formatRecurringEndLabel,
  isRecurringActiveInMonth,
  listMonthExpenses,
  splitRecurringAndPontual
} from './budgetExpenseRows';

function makeRule(overrides: Partial<BudgetRecurringExpense> = {}): BudgetRecurringExpense {
  return {
    id: 1,
    profile_id: 1,
    description: 'Assinatura',
    amount_brl: 100,
    category_id: 1,
    category_name: 'Custos fixos',
    tag_id: null,
    tag_name: null,
    day_of_month: 5,
    start_year_month: '2026-07',
    end_year_month: null,
    indefinite: true,
    is_active: true,
    ...overrides
  };
}

describe('listMonthExpenses', () => {
  it('retorna apenas transações de despesa', () => {
    const transactions: BudgetTransaction[] = [
      {
        id: 1,
        profile_id: 1,
        month_id: 1,
        transaction_type: 'expense',
        event_date: '2026-07-10',
        description: 'Mercado',
        amount_brl: 100,
        category_id: 1,
        category_name: 'Custos fixos',
        tag_id: null,
        tag_name: null,
        tag_color: null,
        income_source_id: null,
        notes: null
      },
      {
        id: 2,
        profile_id: 1,
        month_id: 1,
        transaction_type: 'income',
        event_date: '2026-07-01',
        description: 'Salário',
        amount_brl: 5000,
        category_id: null,
        category_name: null,
        tag_id: null,
        tag_name: null,
        tag_color: null,
        income_source_id: null,
        notes: null
      }
    ];

    expect(listMonthExpenses(transactions)).toHaveLength(1);
    expect(listMonthExpenses(transactions)[0].description).toBe('Mercado');
  });
});

describe('splitRecurringAndPontual', () => {
  it('separa despesas recorrentes e pontuais', () => {
    const expenses: BudgetTransaction[] = [
      {
        id: 1,
        profile_id: 1,
        month_id: 1,
        transaction_type: 'expense',
        event_date: '2026-07-05',
        description: 'Aluguel',
        amount_brl: 1500,
        category_id: 1,
        category_name: 'Custos fixos',
        tag_id: null,
        tag_name: null,
        tag_color: null,
        income_source_id: null,
        notes: null,
        recurring: true,
        recurring_expense_id: 10
      },
      {
        id: 2,
        profile_id: 1,
        month_id: 1,
        transaction_type: 'expense',
        event_date: '2026-07-12',
        description: 'Mercado',
        amount_brl: 200,
        category_id: 1,
        category_name: 'Custos fixos',
        tag_id: null,
        tag_name: null,
        tag_color: null,
        income_source_id: null,
        notes: null,
        recurring: false
      }
    ];

    const { recurring, pontual } = splitRecurringAndPontual(expenses);
    expect(recurring).toHaveLength(1);
    expect(pontual).toHaveLength(1);
    expect(recurring[0].description).toBe('Aluguel');
    expect(pontual[0].description).toBe('Mercado');
  });
});

describe('formatRecurringEndLabel', () => {
  it('mostra indeterminado quando não há fim', () => {
    const rule: BudgetRecurringExpense = {
      id: 1,
      profile_id: 1,
      description: 'Aluguel',
      amount_brl: 1500,
      category_id: 1,
      category_name: 'Custos fixos',
      tag_id: null,
      tag_name: null,
      day_of_month: 5,
      start_year_month: '2026-07',
      end_year_month: null,
      indefinite: true,
      is_active: true
    };

    expect(formatRecurringEndLabel(rule)).toBe('Indeterminado');
  });

  it('formata mês final quando definido', () => {
    const rule: BudgetRecurringExpense = {
      id: 1,
      profile_id: 1,
      description: 'Academia',
      amount_brl: 120,
      category_id: 1,
      category_name: 'Custos fixos',
      tag_id: null,
      tag_name: null,
      day_of_month: 10,
      start_year_month: '2026-07',
      end_year_month: '2026-12',
      indefinite: false,
      is_active: true
    };

    expect(formatRecurringEndLabel(rule)).toBe('dezembro/2026');
  });
});

describe('isRecurringActiveInMonth', () => {
  it('mantém regra indeterminada vigente em qualquer mês', () => {
    const rule = makeRule({ indefinite: true, end_year_month: null });
    expect(isRecurringActiveInMonth(rule, '2026-07')).toBe(true);
    expect(isRecurringActiveInMonth(rule, '2030-01')).toBe(true);
  });

  it('mantém vigente no mês igual ao fim (último mês cobrado)', () => {
    const rule = makeRule({ indefinite: false, end_year_month: '2026-07' });
    expect(isRecurringActiveInMonth(rule, '2026-07')).toBe(true);
  });

  it('mantém vigente em mês anterior ao fim', () => {
    const rule = makeRule({ indefinite: false, end_year_month: '2026-12' });
    expect(isRecurringActiveInMonth(rule, '2026-08')).toBe(true);
  });

  it('encerra a partir do mês seguinte ao fim', () => {
    const rule = makeRule({ indefinite: false, end_year_month: '2026-07' });
    expect(isRecurringActiveInMonth(rule, '2026-08')).toBe(false);
    expect(isRecurringActiveInMonth(rule, '2026-09')).toBe(false);
  });
});

describe('filterActiveRecurringExpenses', () => {
  it('remove regras encerradas antes do mês visualizado e mantém as vigentes', () => {
    const rules = [
      makeRule({ id: 1, description: 'Netflix', indefinite: true, end_year_month: null }),
      makeRule({ id: 2, description: 'Notion', indefinite: false, end_year_month: '2026-07' }),
      makeRule({ id: 3, description: 'Academia', indefinite: false, end_year_month: '2026-12' })
    ];

    const active = filterActiveRecurringExpenses(rules, '2026-08');
    expect(active.map((rule) => rule.description)).toEqual(['Netflix', 'Academia']);
  });
});

