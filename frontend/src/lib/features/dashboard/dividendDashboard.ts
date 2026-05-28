import type { Asset, DisplayClass } from '$lib/api/assets';
import type { DividendPayment } from '$lib/api/dividendPayments';
import { formatDisplayClassForDisplay } from '$lib/assetLabels';

export type DateRange = { from: string; to: string };

export type DividendSummaryRow = {
  label: string;
  totalByCurrency: Record<string, number>;
  count: number;
};

export type DividendClassRow = DividendSummaryRow & {
  displayClass: DisplayClass;
};

export type TopAssetDividendRow = {
  assetId: number;
  symbol: string;
  assetName: string;
  typeLabel: string;
  amountBrl: number;
  currency: string;
};

export type DividendTimelineMode = 'annual' | 'monthly';

export type DividendBarRow = {
  row: DividendSummaryRow;
  amountBrl: number;
  barPercent: number;
};

export const MONTH_LABELS_SHORT = [
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
] as const;

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

export function parsePaymentYear(paymentDate: string): number {
  return Number.parseInt(paymentDate.slice(0, 4), 10);
}

export function parsePaymentMonth(paymentDate: string): number {
  return Number.parseInt(paymentDate.slice(5, 7), 10);
}

export function listPaymentYears(payments: DividendPayment[]): number[] {
  const years = new Set<number>();
  for (const payment of payments) {
    years.add(parsePaymentYear(payment.payment_date));
  }
  return [...years].sort((a, b) => a - b);
}

export function pickDefaultYear(
  years: number[],
  reference: Date = new Date()
): number {
  if (years.length === 0) {
    return reference.getFullYear();
  }
  const current = reference.getFullYear();
  if (years.includes(current)) {
    return current;
  }
  return years[years.length - 1];
}

function addPaymentTotals(
  bucket: { totalByCurrency: Record<string, number>; count: number },
  payment: DividendPayment
): void {
  const currency = payment.currency?.trim().toUpperCase() || 'BRL';
  bucket.totalByCurrency[currency] =
    (bucket.totalByCurrency[currency] ?? 0) + payment.amount;
  bucket.count += 1;
}

export function aggregateDividendsByYear(payments: DividendPayment[]): DividendSummaryRow[] {
  const map = new Map<number, { totalByCurrency: Record<string, number>; count: number }>();

  for (const payment of payments) {
    const year = parsePaymentYear(payment.payment_date);
    const existing = map.get(year) ?? { totalByCurrency: {}, count: 0 };
    addPaymentTotals(existing, payment);
    map.set(year, existing);
  }

  return [...map.entries()]
    .sort(([yearA], [yearB]) => yearA - yearB)
    .map(([year, data]) => ({
      label: String(year),
      totalByCurrency: data.totalByCurrency,
      count: data.count
    }));
}

export function aggregateDividendsByMonth(
  payments: DividendPayment[],
  year: number
): DividendSummaryRow[] {
  const map = new Map<number, { totalByCurrency: Record<string, number>; count: number }>();
  for (let month = 1; month <= 12; month += 1) {
    map.set(month, { totalByCurrency: {}, count: 0 });
  }

  for (const payment of payments) {
    if (parsePaymentYear(payment.payment_date) !== year) {
      continue;
    }
    const month = parsePaymentMonth(payment.payment_date);
    const existing = map.get(month);
    if (!existing) {
      continue;
    }
    addPaymentTotals(existing, payment);
  }

  return [...map.entries()]
    .sort(([monthA], [monthB]) => monthA - monthB)
    .map(([month, data]) => ({
      label: MONTH_LABELS_SHORT[month - 1],
      totalByCurrency: data.totalByCurrency,
      count: data.count
    }));
}

export function getDividendPanelTitle(
  mode: DividendTimelineMode,
  selectedYear?: number
): string {
  if (mode === 'annual') {
    return 'por ano';
  }
  return selectedYear != null ? `mensais — ${selectedYear}` : 'mensais';
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
      const sum = (row: DividendSummaryRow) =>
        Object.values(row.totalByCurrency).reduce((s, v) => s + v, 0);
      return sum(b) - sum(a);
    });
}

/** Valor comparável em BRL para largura das barras (USD convertido quando houver taxa). */
export function dividendRowAmountBrl(
  row: DividendSummaryRow,
  usdBrlRate: number | null | undefined
): number {
  let total = row.totalByCurrency.BRL ?? 0;
  const usd = row.totalByCurrency.USD ?? 0;
  if (usd > 0) {
    if (usdBrlRate != null && usdBrlRate > 0) {
      total += usd * usdBrlRate;
    } else {
      total += usd;
    }
  }
  for (const [currency, amount] of Object.entries(row.totalByCurrency)) {
    if (currency !== 'BRL' && currency !== 'USD') {
      total += amount;
    }
  }
  return total;
}

export function computeDividendBarRows(
  rows: DividendSummaryRow[],
  usdBrlRate: number | null | undefined
): DividendBarRow[] {
  const withAmounts = rows.map((row) => ({
    row,
    amountBrl: dividendRowAmountBrl(row, usdBrlRate)
  }));
  const max = Math.max(...withAmounts.map((item) => item.amountBrl), 0);
  return withAmounts.map(({ row, amountBrl }) => ({
    row,
    amountBrl,
    barPercent: max > 0 ? (amountBrl / max) * 100 : 0
  }));
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
