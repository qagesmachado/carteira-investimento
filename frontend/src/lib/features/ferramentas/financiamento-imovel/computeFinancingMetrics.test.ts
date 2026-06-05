import { describe, expect, it } from 'vitest';

import type { FinancingEntry } from '$lib/api/propertyFinancings';

import {
  buildFinancingTimelinesFromEntries,
  computeCashflowBarRows,
  computeFinancingMetricsFromEntries,
  filterMonthlyTimelineByYear
} from './computeFinancingMetrics';
import { sortFinancingEntries, toggleSortDirection } from './sortFinancingEntries';

describe('computeFinancingMetricsFromEntries', () => {
  it('calcula lucro e capital investido', () => {
    const entries: FinancingEntry[] = [
      {
        id: 1,
        event_date: '2026-06-01',
        entry_type: 'income',
        event_category: 'aluguel',
        description: 'Aluguel',
        amount_brl: 2500
      },
      {
        id: 2,
        event_date: '2026-06-05',
        entry_type: 'expense',
        event_category: 'financiamento',
        description: 'Parcela',
        amount_brl: 3000
      }
    ];
    const metrics = computeFinancingMetricsFromEntries(entries);
    expect(metrics.total_income_brl).toBe(2500);
    expect(metrics.total_expenses_brl).toBe(3000);
    expect(metrics.profit_brl).toBe(-500);
    expect(metrics.capital_invested_brl).toBe(3000);
  });
});

describe('buildFinancingTimelinesFromEntries', () => {
  it('agrupa despesas por ano e mês sem misturar anos', () => {
    const entries: FinancingEntry[] = [
      {
        id: 1,
        event_date: '2025-11-07',
        entry_type: 'expense',
        event_category: 'entrada_financiamento',
        description: 'Entrada',
        amount_brl: 66000
      },
      {
        id: 2,
        event_date: '2026-01-08',
        entry_type: 'expense',
        event_category: 'financiamento',
        description: 'Parcela 1',
        amount_brl: 1810
      }
    ];
    const { monthlyTimeline } = buildFinancingTimelinesFromEntries(entries);
    const nov2025 = monthlyTimeline.find((row) => row.year === 2025 && row.month === 11);
    const nov2026 = monthlyTimeline.find((row) => row.year === 2026 && row.month === 11);
    const jan2026 = monthlyTimeline.find((row) => row.year === 2026 && row.month === 1);

    expect(nov2025?.expenses_brl).toBe(66000);
    expect(nov2026?.expenses_brl).toBe(0);
    expect(jan2026?.expenses_brl).toBe(1810);

    const year2026 = filterMonthlyTimelineByYear(monthlyTimeline, 2026);
    expect(year2026.find((row) => row.month === 11)?.expenses_brl).toBe(0);
    expect(year2026.find((row) => row.month === 1)?.expenses_brl).toBe(1810);
  });
});

describe('computeCashflowBarRows', () => {
  it('calcula percentuais de receita e despesa', () => {
    const rows = computeCashflowBarRows([
      {
        label: 'Jun',
        year: 2026,
        month: 6,
        income_brl: 1000,
        expenses_brl: 500
      }
    ]);
    expect(rows[0].incomePercent).toBeGreaterThan(rows[0].expensesPercent);
  });
});

describe('sortFinancingEntries', () => {
  const entries: FinancingEntry[] = [
    {
      id: 1,
      event_date: '2026-05-08',
      entry_type: 'expense',
      event_category: 'financiamento',
      description: 'Parcela 2',
      amount_brl: 1200
    },
    {
      id: 2,
      event_date: '2026-01-08',
      entry_type: 'expense',
      event_category: 'financiamento',
      description: 'Parcela 1',
      amount_brl: 1800
    }
  ];

  it('ordena por data decrescente por padrão', () => {
    const sorted = sortFinancingEntries(entries, 'event_date', 'desc');
    expect(sorted.map((entry) => entry.id)).toEqual([1, 2]);
  });

  it('ordena por valor crescente', () => {
    const sorted = sortFinancingEntries(entries, 'amount_brl', 'asc');
    expect(sorted.map((entry) => entry.id)).toEqual([1, 2]);
  });

  it('alterna direção', () => {
    expect(toggleSortDirection('asc')).toBe('desc');
    expect(toggleSortDirection('desc')).toBe('asc');
  });
});
