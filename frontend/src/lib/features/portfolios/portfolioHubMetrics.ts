import { formatMoneyAmount } from '$lib/assetLabels';

export type PortfolioHubMetrics = {
  investedBrl: number;
  currentBrl: number;
  profitBrl: number;
  profitPct: number | null;
};

export function formatPortfolioHubMetric(value: number): string {
  return formatMoneyAmount(value, 'BRL');
}

export function formatPortfolioHubProfit(metrics: PortfolioHubMetrics): string {
  const profitText = formatPortfolioHubMetric(metrics.profitBrl);
  if (metrics.profitPct == null || !Number.isFinite(metrics.profitPct)) {
    return profitText;
  }
  const pct = metrics.profitPct.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${profitText} (${pct}%)`;
}

export function profitValueClass(profitBrl: number): string {
  if (profitBrl > 0) {
    return 'text-success';
  }
  if (profitBrl < 0) {
    return 'text-error';
  }
  return 'text-base-content';
}
