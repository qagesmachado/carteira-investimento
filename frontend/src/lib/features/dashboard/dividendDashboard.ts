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

export type DividendAmountMode = 'national' | 'total';

function paymentAmountBrl(
  payment: DividendPayment,
  usdBrlRate: number | null | undefined,
  mode: DividendAmountMode
): number {
  const currency = payment.currency?.trim().toUpperCase() || 'BRL';
  if (mode === 'national') {
    return currency === 'BRL' ? payment.amount : 0;
  }
  if (currency === 'BRL') {
    return payment.amount;
  }
  if (currency === 'USD' && usdBrlRate != null && usdBrlRate > 0) {
    return payment.amount * usdBrlRate;
  }
  return payment.amount;
}

/** Últimos 12 meses calendário (inclui mês de referência). */
export function aggregateDividendsRolling12Months(
  payments: DividendPayment[],
  usdBrlRate: number | null | undefined,
  mode: DividendAmountMode = 'total',
  reference: Date = new Date()
): DividendBarRow[] {
  const rows: DividendSummaryRow[] = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthDate = new Date(reference.getFullYear(), reference.getMonth() - offset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    const label = MONTH_LABELS_SHORT[month - 1];
    let amount = 0;
    let count = 0;

    for (const payment of payments) {
      if (parsePaymentYear(payment.payment_date) !== year) {
        continue;
      }
      if (parsePaymentMonth(payment.payment_date) !== month) {
        continue;
      }
      amount += paymentAmountBrl(payment, usdBrlRate, mode);
      count += 1;
    }

    rows.push({
      label,
      totalByCurrency: amount > 0 ? { BRL: amount } : {},
      count
    });
  }

  return computeDividendBarRows(rows, usdBrlRate);
}

export type DividendYearChartPoint = {
  month: number;
  label: string;
  amountBrl: number;
  barPercent: number;
};

export type DividendYearChartModel = {
  year: number;
  throughMonth: number;
  comparisonPeriodLabel: string;
  points: DividendYearChartPoint[];
  yMax: number;
  yTicks: number[];
  totalBrl: number;
  previousYearTotalBrl: number;
  yearOverYearPercent: number | null;
};

export function buildLinearYTicks(maxValue: number, divisions = 4): { yMax: number; yTicks: number[] } {
  if (maxValue <= 0) {
    const yMax = 100;
    const step = yMax / divisions;
    return {
      yMax,
      yTicks: Array.from({ length: divisions + 1 }, (_, index) => index * step)
    };
  }

  const rawStep = maxValue / divisions;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  const niceMultiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceMultiplier * magnitude;
  const yMax = step * divisions;
  return {
    yMax,
    yTicks: Array.from({ length: divisions + 1 }, (_, index) => index * step)
  };
}

export function sumDividendsYearTotalBrl(
  payments: DividendPayment[],
  usdBrlRate: number | null | undefined,
  year: number
): number {
  return sumDividendsThroughMonthBrl(payments, usdBrlRate, year, 12);
}

export function formatComparisonPeriodLabel(throughMonth: number): string {
  if (throughMonth >= 12) {
    return '';
  }
  return `${MONTH_LABELS_SHORT[0]}–${MONTH_LABELS_SHORT[throughMonth - 1]}`;
}

export function sumDividendsThroughMonthBrl(
  payments: DividendPayment[],
  usdBrlRate: number | null | undefined,
  year: number,
  throughMonth: number
): number {
  let total = 0;
  for (const payment of payments) {
    if (parsePaymentYear(payment.payment_date) !== year) {
      continue;
    }
    const month = parsePaymentMonth(payment.payment_date);
    if (month > throughMonth) {
      continue;
    }
    total += paymentAmountBrl(payment, usdBrlRate, 'total');
  }
  return total;
}

export function buildDividendYearChartModel(
  payments: DividendPayment[],
  usdBrlRate: number | null | undefined,
  reference: Date = new Date()
): DividendYearChartModel {
  const year = reference.getFullYear();
  const throughMonth = reference.getMonth() + 1;
  const comparisonPeriodLabel = formatComparisonPeriodLabel(throughMonth);
  const monthRows = aggregateDividendsByMonth(payments, year);
  const amounts = monthRows.map((row) => dividendRowAmountBrl(row, usdBrlRate));
  const maxAmount = Math.max(...amounts, 0);
  const { yMax, yTicks } = buildLinearYTicks(maxAmount);

  const points = monthRows.map((row, index) => ({
    month: index + 1,
    label: row.label,
    amountBrl: amounts[index],
    barPercent: yMax > 0 ? (amounts[index] / yMax) * 100 : 0
  }));

  const totalBrl = sumDividendsThroughMonthBrl(payments, usdBrlRate, year, throughMonth);
  const previousYearTotalBrl = sumDividendsThroughMonthBrl(
    payments,
    usdBrlRate,
    year - 1,
    throughMonth
  );
  const yearOverYearPercent =
    previousYearTotalBrl > 0 ? ((totalBrl - previousYearTotalBrl) / previousYearTotalBrl) * 100 : null;

  return {
    year,
    throughMonth,
    comparisonPeriodLabel,
    points,
    yMax,
    yTicks,
    totalBrl,
    previousYearTotalBrl,
    yearOverYearPercent
  };
}

export function formatYearOverYearChange(percent: number | null): string {
  if (percent == null) {
    return 'Sem base no ano anterior';
  }
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}% em relação ao ano anterior`;
}

export function yearOverYearClass(percent: number | null): string {
  if (percent == null) {
    return 'text-base-content/60';
  }
  return percent >= 0 ? 'text-success' : 'text-error';
}

export const MAX_RECENT_DIVIDEND_ITEMS = 3;

export function pickRecentDividendPayments(
  payments: DividendPayment[],
  limit = MAX_RECENT_DIVIDEND_ITEMS
): DividendPayment[] {
  if (payments.length === 0) {
    return [];
  }
  return [...payments]
    .sort((a, b) => b.payment_date.localeCompare(a.payment_date))
    .slice(0, limit);
}

export function pickLastDividendPayment(
  payments: DividendPayment[]
): DividendPayment | null {
  return pickRecentDividendPayments(payments, 1)[0] ?? null;
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
