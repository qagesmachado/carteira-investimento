import type { Asset, DisplayClass } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import { formatDisplayClassForDisplay } from '$lib/assetLabels';

import {
  positionCurrentValue,
  positionInvestedValue,
  valueInBrl,
  type CurrencyTotals
} from '$lib/features/portfolios/positionMetrics';

export type DashboardPatrimony = {
  investedBrl: number;
  currentBrl: number;
  profitBrl: number;
  profitPercent: number | null;
  activePositions: number;
  totalsByCurrency: CurrencyTotals[];
};

export type AllocationRow = {
  displayClass: DisplayClass;
  label: string;
  valueBrl: number;
  percent: number;
};

function buildCurrencyTotals(
  positions: Position[],
  assetById: Record<number, Asset>
): CurrencyTotals[] {
  const map = new Map<string, CurrencyTotals>();

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const invested = positionInvestedValue(position, asset);
    const current = positionCurrentValue(position, asset);
    if (invested == null || current == null) {
      continue;
    }
    const currency = asset.currency;
    const existing = map.get(currency) ?? { currency, invested: 0, current: 0, profit: 0 };
    existing.invested += invested;
    existing.current += current;
    existing.profit += current - invested;
    map.set(currency, existing);
  }

  return [...map.values()].sort((a, b) => a.currency.localeCompare(b.currency, 'pt-BR'));
}

export function computeDashboardPatrimony(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined
): DashboardPatrimony {
  let investedBrl = 0;
  let currentBrl = 0;
  let activePositions = 0;

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    activePositions += 1;

    const invested = positionInvestedValue(position, asset);
    const current = positionCurrentValue(position, asset);
    if (invested == null || current == null) {
      continue;
    }
    const invBrl = valueInBrl(invested, asset.currency, usdBrlRate);
    const curBrl = valueInBrl(current, asset.currency, usdBrlRate);
    if (invBrl != null) {
      investedBrl += invBrl;
    }
    if (curBrl != null) {
      currentBrl += curBrl;
    }
  }

  const profitBrl = currentBrl - investedBrl;
  const profitPercent = investedBrl > 0 ? (profitBrl / investedBrl) * 100 : null;

  return {
    investedBrl,
    currentBrl,
    profitBrl,
    profitPercent,
    activePositions,
    totalsByCurrency: buildCurrencyTotals(positions, assetById)
  };
}

export function computeAllocationByDisplayClass(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined
): AllocationRow[] {
  const byClass = new Map<DisplayClass, number>();

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const current = positionCurrentValue(position, asset);
    if (current == null) {
      continue;
    }
    const brl = valueInBrl(current, asset.currency, usdBrlRate);
    if (brl == null) {
      continue;
    }
    byClass.set(asset.display_class, (byClass.get(asset.display_class) ?? 0) + brl);
  }

  const total = [...byClass.values()].reduce((s, v) => s + v, 0);
  if (total <= 0) {
    return [];
  }

  return [...byClass.entries()]
    .map(([displayClass, valueBrl]) => ({
      displayClass,
      label: formatDisplayClassForDisplay(displayClass),
      valueBrl,
      percent: (valueBrl / total) * 100
    }))
    .sort((a, b) => b.valueBrl - a.valueBrl);
}
