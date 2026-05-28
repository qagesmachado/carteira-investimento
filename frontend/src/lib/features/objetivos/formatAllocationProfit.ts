import { formatBrl } from '$lib/features/rebalance/allocationTargets';

export function formatProfitBrl(profit: number | null | undefined): string {
  if (profit == null || !Number.isFinite(profit)) {
    return '—';
  }
  const prefix = profit > 0 ? '+' : '';
  return `${prefix}${formatBrl(profit)}`;
}

export function formatProfitPercent(percent: number | null | undefined): string {
  if (percent == null || !Number.isFinite(percent)) {
    return '';
  }
  const prefix = percent > 0 ? '+' : '';
  return ` (${prefix}${percent.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%)`;
}

export function formatProfitCell(
  profitBrl: number | null | undefined,
  profitPercent: number | null | undefined
): string {
  const base = formatProfitBrl(profitBrl);
  if (base === '—') {
    return base;
  }
  return `${base}${formatProfitPercent(profitPercent)}`;
}
