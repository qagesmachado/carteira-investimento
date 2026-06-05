import type { FinancingEntry, TimelineRow } from '$lib/api/propertyFinancings';

export type CashflowBarRow = {
  row: TimelineRow;
  total: number;
  incomePercent: number;
  expensesPercent: number;
};

export type CashflowTimelineMode = 'annual' | 'monthly';

const MONTH_LABELS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez'
];

export function computeCashflowBarRows(rows: TimelineRow[]): CashflowBarRow[] {
  const maxTotal = Math.max(
    0,
    ...rows.map((row) => row.income_brl + row.expenses_brl)
  );
  if (maxTotal === 0) {
    return rows.map((row) => ({
      row,
      total: 0,
      incomePercent: 0,
      expensesPercent: 0
    }));
  }
  return rows.map((row) => {
    const total = row.income_brl + row.expenses_brl;
    return {
      row,
      total,
      incomePercent: (row.income_brl / maxTotal) * 100,
      expensesPercent: (row.expenses_brl / maxTotal) * 100
    };
  });
}

export function pickTimelineRows(
  monthlyTimeline: TimelineRow[],
  annualTimeline: TimelineRow[],
  mode: CashflowTimelineMode
): TimelineRow[] {
  return mode === 'monthly' ? monthlyTimeline : annualTimeline;
}

export function listTimelineYears(rows: TimelineRow[]): number[] {
  const years = new Set<number>();
  for (const row of rows) {
    years.add(row.year);
  }
  return [...years].sort((a, b) => a - b);
}

export function filterMonthlyTimelineByYear(
  rows: TimelineRow[],
  year: number
): TimelineRow[] {
  return rows.filter((row) => row.year === Number(year));
}

export function buildFinancingTimelinesFromEntries(entries: FinancingEntry[]): {
  monthlyTimeline: TimelineRow[];
  annualTimeline: TimelineRow[];
} {
  const byYearMonth = new Map<
    string,
    { income: number; expenses: number; year: number; month: number }
  >();
  const byYear = new Map<number, { income: number; expenses: number }>();

  for (const entry of entries) {
    const date = new Date(`${entry.event_date}T12:00:00`);
    const month = date.getMonth() + 1;
    const entryYear = date.getFullYear();
    const key = `${entryYear}-${month}`;
    const monthBucket = byYearMonth.get(key) ?? {
      income: 0,
      expenses: 0,
      year: entryYear,
      month
    };
    const yearBucket = byYear.get(entryYear) ?? { income: 0, expenses: 0 };
    if (entry.entry_type === 'income') {
      monthBucket.income += entry.amount_brl;
      yearBucket.income += entry.amount_brl;
    } else {
      monthBucket.expenses += entry.amount_brl;
      yearBucket.expenses += entry.amount_brl;
    }
    byYearMonth.set(key, monthBucket);
    byYear.set(entryYear, yearBucket);
  }

  const years = [...byYear.keys()].sort((a, b) => a - b);
  const monthlyTimeline: TimelineRow[] = [];
  for (const year of years) {
    for (let month = 1; month <= 12; month += 1) {
      const key = `${year}-${month}`;
      const data = byYearMonth.get(key) ?? { income: 0, expenses: 0, year, month };
      monthlyTimeline.push({
        label: MONTH_LABELS_SHORT[month - 1],
        year,
        month,
        income_brl: data.income,
        expenses_brl: data.expenses
      });
    }
  }

  const annualTimeline = years.map((entryYear) => {
    const data = byYear.get(entryYear) ?? { income: 0, expenses: 0 };
    return {
      label: String(entryYear),
      year: entryYear,
      month: null,
      income_brl: data.income,
      expenses_brl: data.expenses
    };
  });

  return { monthlyTimeline, annualTimeline };
}

export function computeFinancingMetricsFromEntries(entries: FinancingEntry[]) {
  const totalIncome = entries
    .filter((e) => e.entry_type === 'income')
    .reduce((sum, e) => sum + e.amount_brl, 0);
  const totalExpenses = entries
    .filter((e) => e.entry_type === 'expense')
    .reduce((sum, e) => sum + e.amount_brl, 0);
  return {
    total_income_brl: totalIncome,
    total_expenses_brl: totalExpenses,
    profit_brl: totalIncome - totalExpenses,
    capital_invested_brl: totalExpenses
  };
}
