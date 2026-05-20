import type { Asset } from '$lib/api/assets';
import type { DividendPayment } from '$lib/api/dividendPayments';
import { formatMoneyAmount } from '$lib/assetLabels';

export type DividendAssetTotals = {
  totalByCurrency: Record<string, number>;
  count: number;
};

export function summarizeDividendPayments(payments: DividendPayment[]): DividendAssetTotals {
  const totalByCurrency: Record<string, number> = {};

  for (const payment of payments) {
    const currency = payment.currency?.trim().toUpperCase() || 'BRL';
    totalByCurrency[currency] = (totalByCurrency[currency] ?? 0) + payment.amount;
  }

  return { totalByCurrency, count: payments.length };
}

export function formatDividendPaymentsTotalLabel(totals: DividendAssetTotals): string {
  if (totals.count === 0) {
    return 'Total';
  }
  if (totals.count === 1) {
    return 'Total (1 lançamento)';
  }
  return `Total (${totals.count} lançamentos)`;
}

export function formatDividendPaymentsTotalAmounts(totals: DividendAssetTotals): string {
  const currencies = Object.keys(totals.totalByCurrency).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return currencies
    .map((currency) => formatMoneyAmount(totals.totalByCurrency[currency], currency))
    .join(' · ');
}

export function buildDividendTotalsByAssetId(
  payments: DividendPayment[]
): Map<number, DividendAssetTotals> {
  const map = new Map<number, DividendAssetTotals>();

  for (const payment of payments) {
    const existing = map.get(payment.asset_id) ?? { totalByCurrency: {}, count: 0 };
    const currency = payment.currency?.trim().toUpperCase() || 'BRL';
    existing.totalByCurrency[currency] = (existing.totalByCurrency[currency] ?? 0) + payment.amount;
    existing.count += 1;
    map.set(payment.asset_id, existing);
  }

  return map;
}

export function formatDividendsReceivedSummary(
  totals: DividendAssetTotals | undefined,
  asset: Asset
): string {
  if (!totals || totals.count === 0) {
    return 'Nenhum provento cadastrado';
  }

  const currencies = Object.keys(totals.totalByCurrency).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const parts = currencies.map((currency) =>
    formatMoneyAmount(totals.totalByCurrency[currency], currency)
  );

  const summary = parts.join(' · ');
  if (totals.count === 1) {
    return summary;
  }
  return `${summary} (${totals.count} lançamentos)`;
}
