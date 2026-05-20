import type { Asset, DisplayClass } from '$lib/api/assets';
import type { DividendPayment } from '$lib/api/dividendPayments';
import { formatDisplayClassForDisplay } from '$lib/assetLabels';

export type DateRange = { from: string; to: string };

export type DividendClassRow = {
  displayClass: DisplayClass;
  label: string;
  totalByCurrency: Record<string, number>;
  count: number;
};

export type TopAssetDividendRow = {
  assetId: number;
  symbol: string;
  assetName: string;
  typeLabel: string;
  amountBrl: number;
  currency: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function getMonthBounds(reference: Date = new Date()): DateRange {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    from: `${year}-${pad2(month + 1)}-01`,
    to: `${year}-${pad2(month + 1)}-${pad2(lastDay)}`
  };
}

export function getYearBounds(reference: Date = new Date()): DateRange {
  const year = reference.getFullYear();
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

export function filterPaymentsInRange(
  payments: DividendPayment[],
  from: string,
  to: string
): DividendPayment[] {
  return payments.filter((p) => p.payment_date >= from && p.payment_date <= to);
}

export function aggregateDividendsByDisplayClass(
  payments: DividendPayment[]
): DividendClassRow[] {
  const map = new Map<
    DisplayClass,
    { totalByCurrency: Record<string, number>; count: number }
  >();

  for (const payment of payments) {
    const cls = payment.display_class;
    const existing = map.get(cls) ?? { totalByCurrency: {}, count: 0 };
    const currency = payment.currency?.trim().toUpperCase() || 'BRL';
    existing.totalByCurrency[currency] =
      (existing.totalByCurrency[currency] ?? 0) + payment.amount;
    existing.count += 1;
    map.set(cls, existing);
  }

  return [...map.entries()]
    .map(([displayClass, data]) => ({
      displayClass,
      label: formatDisplayClassForDisplay(displayClass),
      totalByCurrency: data.totalByCurrency,
      count: data.count
    }))
    .sort((a, b) => {
      const sum = (row: DividendClassRow) =>
        Object.values(row.totalByCurrency).reduce((s, v) => s + v, 0);
      return sum(b) - sum(a);
    });
}

/** Ranking por valor na moeda do lançamento (BRL preferido para sort). */
export function topAssetsByDividendAmount(
  payments: DividendPayment[],
  assetIdsInPortfolio: Set<number>,
  assetById: Record<number, Asset>,
  limit: number
): TopAssetDividendRow[] {
  const byAsset = new Map<
    number,
    { symbol: string; assetName: string; amount: number; currency: string; displayClass: DisplayClass }
  >();

  for (const payment of payments) {
    if (!assetIdsInPortfolio.has(payment.asset_id)) {
      continue;
    }
    const asset = assetById[payment.asset_id];
    const existing = byAsset.get(payment.asset_id) ?? {
      symbol: payment.symbol,
      assetName: payment.asset_name,
      amount: 0,
      currency: payment.currency?.trim().toUpperCase() || 'BRL',
      displayClass: payment.display_class
    };
    existing.amount += payment.amount;
    byAsset.set(payment.asset_id, existing);
  }

  return [...byAsset.entries()]
    .map(([assetId, data]) => {
      const asset = assetById[assetId];
      return {
        assetId,
        symbol: data.symbol,
        assetName: data.assetName,
        typeLabel: asset
          ? formatDisplayClassForDisplay(asset.display_class)
          : formatDisplayClassForDisplay(data.displayClass),
        amountBrl: data.amount,
        currency: data.currency
      };
    })
    .sort((a, b) => b.amountBrl - a.amountBrl)
    .slice(0, limit);
}
