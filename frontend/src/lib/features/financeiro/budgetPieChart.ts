import type { DashboardSlice } from '$lib/api/budget';
import { pieSlicePath } from '$lib/features/dashboard/topAssetsDashboard';

export type BudgetPieSegment = {
  id: number;
  name: string;
  color: string;
  amount_brl: number;
  percent: number;
  startAngle: number;
  endAngle: number;
};

export function slicesToPieSegments(slices: DashboardSlice[]): BudgetPieSegment[] {
  let startAngle = 0;
  return slices.map((slice) => {
    const sweep = (slice.percent / 100) * 360;
    const segment: BudgetPieSegment = {
      id: slice.id,
      name: slice.name,
      color: slice.color,
      amount_brl: slice.amount_brl,
      percent: slice.percent,
      startAngle,
      endAngle: startAngle + sweep
    };
    startAngle += sweep;
    return segment;
  });
}

export function formatBudgetPieSliceTooltip(
  segment: Pick<BudgetPieSegment, 'name' | 'percent' | 'amount_brl'>,
  formatAmount: (value: number) => string
): string {
  const pct = segment.percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return `${segment.name}: ${pct}% · ${formatAmount(segment.amount_brl)}`;
}

/** Tamanho padrão da pizza (+15% sobre h-44 / 11rem). */
export const BUDGET_PIE_CHART_SIZE_CLASS = 'h-[12.65rem] w-[12.65rem]';

/** Tamanho da pizza no modal ampliado. */
export const BUDGET_PIE_CHART_EXPANDED_SIZE_CLASS = 'h-72 w-72';

export { pieSlicePath };
