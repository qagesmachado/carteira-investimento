import type { Asset } from '$lib/api/assets';
import type { AssetPartition } from '$lib/api/objetivos';
import type { Position } from '$lib/api/portfolios';
import { formatAssetTypeForDisplay, formatMoneyAmount } from '$lib/assetLabels';

import {
  positionCurrentValue,
  positionInvestedValue,
  valueInBrl
} from '$lib/features/portfolios/positionMetrics';
import { allocationColorIndexForDisplayClass } from './allocationChartColors';
import type { DashboardPatrimonyFilters } from './dashboardPatrimonyFilters';
import { DEFAULT_DASHBOARD_PATRIMONY_FILTERS } from './dashboardPatrimonyFilters';
import {
  resolvePositionCurrentBrlForDashboard,
  resolvePositionInvestedBrlForDashboard
} from './dashboardPatrimonyScope';

export type TopAssetsScopeOptions = {
  partitionsByAssetId?: Record<number, AssetPartition>;
  filters?: DashboardPatrimonyFilters;
  usdBrlRate?: number | null;
};

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
  displayClass: Asset['display_class'];
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

/** Quantidade máxima de ativos exibidos no painel Top ativos (todas as abas). */
export const TOP_ASSETS_PANEL_LIMIT = 3;

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
    displayClass: asset.display_class,
    sortValue,
    currency,
    displayAmount,
    profitPercent
  };
}

function rankedRows(rows: TopAssetRow[], limit: number): TopAssetRow[] {
  return rows.sort((a, b) => b.sortValue - a.sortValue).slice(0, limit);
}

function resolveScopedMetrics(
  position: Position,
  asset: Asset,
  scope: TopAssetsScopeOptions
): {
  sortCurrentBrl: number;
  currentDisplay: number;
  profitDisplay: number;
  profitPercent: number;
  profitBrl: number;
} | null {
  const partitionsByAssetId = scope.partitionsByAssetId ?? {};
  const filters = scope.filters ?? DEFAULT_DASHBOARD_PATRIMONY_FILTERS;
  const usdBrlRate = scope.usdBrlRate;

  const scopedCurrentBrl = resolvePositionCurrentBrlForDashboard(
    position,
    asset,
    usdBrlRate,
    partitionsByAssetId[position.asset_id],
    filters
  );
  if (scopedCurrentBrl == null || scopedCurrentBrl <= 0) {
    return null;
  }

  const fullCurrent = positionCurrentValue(position, asset);
  if (fullCurrent == null || fullCurrent <= 0) {
    return null;
  }

  const fullCurrentBrl = valueInBrl(fullCurrent, asset.currency, usdBrlRate) ?? fullCurrent;
  const ratio = fullCurrentBrl > 0 ? scopedCurrentBrl / fullCurrentBrl : 0;
  const currentDisplay = fullCurrent * ratio;

  const scopedInvestedBrl =
    resolvePositionInvestedBrlForDashboard(
      position,
      asset,
      usdBrlRate,
      partitionsByAssetId[position.asset_id],
      filters
    ) ?? 0;

  const fullInvested = positionInvestedValue(position, asset) ?? 0;
  const investedDisplay = fullInvested * ratio;
  const profitDisplay = currentDisplay - investedDisplay;
  const profitPercent = investedDisplay > 0 ? (profitDisplay / investedDisplay) * 100 : 0;
  const profitBrl = scopedCurrentBrl - scopedInvestedBrl;

  return {
    sortCurrentBrl: scopedCurrentBrl,
    currentDisplay,
    profitDisplay,
    profitPercent,
    profitBrl
  };
}

/** Maior lucro em porcentagem sobre o valor investido. */
export function topAssetsByProfitPercent(
  positions: Position[],
  assetById: Record<number, Asset>,
  limit: number,
  scope: TopAssetsScopeOptions = {}
): TopAssetRow[] {
  const rows: TopAssetRow[] = [];

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const metrics = resolveScopedMetrics(position, asset, scope);
    if (!metrics || metrics.profitPercent <= 0) {
      continue;
    }
    rows.push(
      buildRow(
        position,
        asset,
        metrics.profitPercent,
        metrics.profitDisplay,
        asset.currency,
        metrics.profitPercent
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
  limit: number,
  scope: TopAssetsScopeOptions = {}
): TopAssetRow[] {
  const rows: TopAssetRow[] = [];
  const mergedScope = { ...scope, usdBrlRate };

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const metrics = resolveScopedMetrics(position, asset, mergedScope);
    if (!metrics) {
      continue;
    }
    rows.push(
      buildRow(position, asset, metrics.sortCurrentBrl, metrics.currentDisplay, asset.currency)
    );
  }

  return rankedRows(rows, limit);
}

/** Maior retorno bruto nominal (lucro absoluto; ordenação em BRL quando possível). */
export function topAssetsByGrossProfit(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined,
  limit: number,
  scope: TopAssetsScopeOptions = {}
): TopAssetRow[] {
  const rows: TopAssetRow[] = [];
  const mergedScope = { ...scope, usdBrlRate };

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const metrics = resolveScopedMetrics(position, asset, mergedScope);
    if (!metrics || metrics.profitBrl <= 0) {
      continue;
    }
    rows.push(
      buildRow(
        position,
        asset,
        metrics.profitBrl,
        metrics.profitDisplay,
        asset.currency,
        metrics.profitPercent
      )
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
