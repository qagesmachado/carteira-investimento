import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import { formatAssetTypeForDisplay, formatMoneyAmount } from '$lib/assetLabels';

import {
  computePositionProfit,
  positionCurrentValue,
  positionInvestedValue,
  valueInBrl
} from '$lib/features/portfolios/positionMetrics';

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
  return rows.map((row, colorIndex) => {
    const sweep = (row.percent / 100) * 360;
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
