import type { DividendPayment } from '$lib/api/dividendPayments';

import {
  parsePaymentMonth,
  parsePaymentYear
} from './dividendDashboard';
import type { Position } from '$lib/api/portfolios';
import { formatAssetTypeForDisplay, formatMoneyAmount } from '$lib/assetLabels';

import {
  computePositionProfit,
  positionCurrentValue,
  positionInvestedValue,
  valueInBrl
} from '$lib/features/portfolios/positionMetrics';
import { allocationColorIndexForDisplayClass } from './allocationChartColors';

export type TopAssetMetric =
  | 'profit_percent'
  | 'position_value'
  | 'dividends'
  | 'gross_profit';

export type TopAssetRow = {
  assetId: number;
  symbol: string;
  assetName: string;
  typeLabel: string;
  /** Valor numérico usado na ordenação. */
  sortValue: number;
  /** Moeda para formatação do valor exibido. */
  currency: string;
  /** Valor bruto na moeda de exibição (lucro, posição ou proventos). */
  displayAmount: number;
  /** Percentual de lucro — só na aba profit_percent. */
  profitPercent?: number;
};

export const TOP_ASSET_METRIC_HEADERS: Record<TopAssetMetric, string> = {
  profit_percent: 'Lucro (%)',
  position_value: 'Valor da posição',
  dividends: 'Proventos',
  gross_profit: 'Retorno bruto'
};

export function formatProfitPercentWithNominal(
  profitPercent: number,
  nominalAmount: number,
  currency: string
): string {
  const pct = profitPercent.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  return `${pct}% (${formatMoneyAmount(nominalAmount, currency)})`;
}

function buildRow(
  position: Position,
  asset: Asset,
  sortValue: number,
  displayAmount: number,
  currency: string,
  profitPercent?: number
): TopAssetRow {
  return {
    assetId: asset.id,
    symbol: asset.symbol,
    assetName: asset.name,
    typeLabel: formatAssetTypeForDisplay(asset.asset_type),
    sortValue,
    currency,
    displayAmount,
    profitPercent
  };
}

function rankedRows(rows: TopAssetRow[], limit: number): TopAssetRow[] {
  return rows.sort((a, b) => b.sortValue - a.sortValue).slice(0, limit);
}

/** Maior lucro em porcentagem sobre o valor investido. */
export function topAssetsByProfitPercent(
  positions: Position[],
  assetById: Record<number, Asset>,
  limit: number
): TopAssetRow[] {
  const rows: TopAssetRow[] = [];

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const profit = computePositionProfit(position, asset);
    if (!profit || profit.percent <= 0) {
      continue;
    }
    rows.push(
      buildRow(
        position,
        asset,
        profit.percent,
        profit.profit,
        asset.currency,
        profit.percent
      )
    );
  }

  return rankedRows(rows, limit);
}

/** Maior posição na carteira (valor de mercado atual). */
export function topAssetsByPositionValue(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined,
  limit: number
): TopAssetRow[] {
  const rows: TopAssetRow[] = [];

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const current = positionCurrentValue(position, asset);
    if (current == null || current <= 0) {
      continue;
    }
    const sortValue = valueInBrl(current, asset.currency, usdBrlRate) ?? current;
    rows.push(buildRow(position, asset, sortValue, current, asset.currency));
  }

  return rankedRows(rows, limit);
}

/** Maior retorno bruto nominal (lucro absoluto; ordenação em BRL quando possível). */
export function topAssetsByGrossProfit(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined,
  limit: number
): TopAssetRow[] {
  const rows: TopAssetRow[] = [];

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const profit = computePositionProfit(position, asset);
    if (!profit || profit.profit <= 0) {
      continue;
    }
    const sortValue = valueInBrl(profit.profit, asset.currency, usdBrlRate) ?? profit.profit;
    rows.push(
      buildRow(position, asset, sortValue, profit.profit, asset.currency, profit.percent)
    );
  }

  return rankedRows(rows, limit);
}

export type PieSegment = {
  displayClass: string;
  label: string;
  percent: number;
  valueBrl: number;
  startAngle: number;
  endAngle: number;
  colorIndex: number;
};

/** Converte linhas de alocação em segmentos angulares para gráfico pizza (SVG). */
export function allocationToPieSegments(
  rows: { displayClass: string; label: string; percent: number; valueBrl: number }[]
): PieSegment[] {
  let startAngle = 0;
  return rows.map((row) => {
    const sweep = (row.percent / 100) * 360;
    const colorIndex = allocationColorIndexForDisplayClass(row.displayClass);
    const segment: PieSegment = {
      displayClass: row.displayClass,
      label: row.label,
      percent: row.percent,
      valueBrl: row.valueBrl,
      startAngle,
      endAngle: startAngle + sweep,
      colorIndex
    };
    startAngle += sweep;
    return segment;
  });
}

/** Gera path SVG de fatia de pizza (coordenadas 0–100). */
export function pieSlicePath(
  startAngle: number,
  endAngle: number,
  cx = 50,
  cy = 50,
  r = 45
): string {
  if (endAngle - startAngle >= 359.99) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.sin(toRad(startAngle));
  const y1 = cy - r * Math.cos(toRad(startAngle));
  const x2 = cx + r * Math.sin(toRad(endAngle));
  const y2 = cy - r * Math.cos(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export const ALLOCATION_DONUT_OUTER_R = 45;
export const ALLOCATION_DONUT_INNER_R = 28;

/** Gera path SVG de fatia de rosca (donut) em coordenadas 0–100. */
export function donutSlicePath(
  startAngle: number,
  endAngle: number,
  cx = 50,
  cy = 50,
  outerR = ALLOCATION_DONUT_OUTER_R,
  innerR = ALLOCATION_DONUT_INNER_R
): string {
  const sweep = endAngle - startAngle;
  if (sweep >= 359.99) {
    return [
      `M ${cx} ${cy - outerR}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR}`,
      `L ${cx - 0.01} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR}`,
      'Z'
    ].join(' ');
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + outerR * Math.sin(toRad(startAngle));
  const y1 = cy - outerR * Math.cos(toRad(startAngle));
  const x2 = cx + outerR * Math.sin(toRad(endAngle));
  const y2 = cy - outerR * Math.cos(toRad(endAngle));
  const x3 = cx + innerR * Math.sin(toRad(endAngle));
  const y3 = cy - innerR * Math.cos(toRad(endAngle));
  const x4 = cx + innerR * Math.sin(toRad(startAngle));
  const y4 = cy - innerR * Math.cos(toRad(startAngle));
  const largeArc = sweep > 180 ? 1 : 0;

  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ');
}

export function donutSegmentLabelPoint(
  startAngle: number,
  endAngle: number,
  cx = 50,
  cy = 50,
  labelR = (ALLOCATION_DONUT_OUTER_R + ALLOCATION_DONUT_INNER_R) / 2
): { x: number; y: number; sweep: number } {
  const midAngle = (startAngle + endAngle) / 2;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  return {
    x: cx + labelR * Math.sin(toRad(midAngle)),
    y: cy - labelR * Math.cos(toRad(midAngle)),
    sweep: endAngle - startAngle
  };
}

export function shouldShowDonutSegmentLabel(percent: number, sweep: number): boolean {
  return percent >= 4 && sweep >= 14;
}

export type SparklinePoint = { x: number; y: number };

/** Série mensal de proventos do ativo nos últimos 12 meses (valores brutos). */
export function buildAssetMonthlyDividendAmounts(
  payments: DividendPayment[],
  assetId: number,
  reference: Date = new Date()
): number[] {
  const amounts: number[] = [];
  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthDate = new Date(reference.getFullYear(), reference.getMonth() - offset, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;
    let total = 0;
    for (const payment of payments) {
      if (payment.asset_id !== assetId) {
        continue;
      }
      if (parsePaymentYear(payment.payment_date) !== year) {
        continue;
      }
      if (parsePaymentMonth(payment.payment_date) !== month) {
        continue;
      }
      total += payment.amount;
    }
    amounts.push(total);
  }
  return amounts;
}

export function sparklinePointsFromAmounts(
  amounts: number[],
  width = 72,
  height = 24,
  padding = 2
): SparklinePoint[] {
  if (amounts.length === 0) {
    return [];
  }
  const max = Math.max(...amounts, 0);
  const min = Math.min(...amounts, 0);
  const range = max - min;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const step = amounts.length > 1 ? innerWidth / (amounts.length - 1) : 0;

  return amounts.map((value, index) => {
    const normalized = range > 0 ? (value - min) / range : 0.5;
    return {
      x: padding + index * step,
      y: padding + innerHeight - normalized * innerHeight
    };
  });
}

export function sparklinePolyline(points: SparklinePoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}
