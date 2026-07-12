import { formatYearMonthLabel } from './budgetMonth';

export type CashflowTimelineRow = {
  year_month: string;
  income_brl: number;
  expense_brl: number;
};

export function computeCashflowMaxValue(timeline: CashflowTimelineRow[]): number {
  if (timeline.length === 0) {
    return 1;
  }
  return Math.max(1, ...timeline.flatMap((row) => [row.income_brl, row.expense_brl]));
}

export function buildCashflowYAxisTicks(maxValue: number, tickCount = 4): number[] {
  if (maxValue <= 0 || tickCount < 2) {
    return [0];
  }
  const step = maxValue / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, index) => Math.round(step * index * 100) / 100);
}

export function computeCashflowBalance(incomeBrl: number, expenseBrl: number): number {
  return Math.round((incomeBrl - expenseBrl) * 100) / 100;
}

export function formatCashflowTooltipMonth(yearMonth: string): string {
  return formatYearMonthLabel(yearMonth).replace('/', ' ');
}

export function barHeightPercent(value: number, maxValue: number): number {
  if (maxValue <= 0) {
    return 0;
  }
  return Math.max(4, (value / maxValue) * 100);
}
