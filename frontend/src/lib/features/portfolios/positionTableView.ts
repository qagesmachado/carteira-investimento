import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import { formatAssetTypeForDisplay } from '$lib/assetLabels';

import {
  computePositionProfit,
  positionCurrentValue,
  positionInvestedValue,
  usesManualPositionValues
} from './positionMetrics';

export type PositionRow = {
  position: Position;
  asset: Asset;
};

export type SortKey =
  | 'ticker'
  | 'asset_type'
  | 'currency'
  | 'quantity'
  | 'invested'
  | 'current'
  | 'yield'
  | 'profit';

export type SortDir = 'asc' | 'desc';

export function buildPositionRows(
  positions: Position[],
  assetById: Record<number, Asset>
): PositionRow[] {
  const rows: PositionRow[] = [];
  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (asset) {
      rows.push({ position, asset });
    }
  }
  return rows;
}

export function assetMatchesPositionSearch(asset: Asset, raw: string): boolean {
  const t = raw.trim().toLowerCase();
  if (!t) {
    return true;
  }
  const sym = asset.symbol.toLowerCase();
  const name = (asset.name ?? '').toLowerCase();
  if (sym.includes(t) || name.includes(t)) {
    return true;
  }
  const typeLabel = formatAssetTypeForDisplay(asset.asset_type).toLowerCase();
  if (typeLabel.includes(t) || asset.asset_type.toLowerCase().includes(t)) {
    return true;
  }
  return false;
}

export function filterPositionRows(rows: PositionRow[], filterText: string): PositionRow[] {
  return rows.filter((row) => assetMatchesPositionSearch(row.asset, filterText));
}

function sortValue(row: PositionRow, key: SortKey): string | number {
  const { position, asset } = row;
  switch (key) {
    case 'ticker':
      return asset.symbol.toLowerCase();
    case 'asset_type':
      return formatAssetTypeForDisplay(asset.asset_type);
    case 'currency':
      return asset.currency.toLowerCase();
    case 'quantity':
      return usesManualPositionValues(asset) ? -1 : position.quantity;
    case 'invested':
      return positionInvestedValue(position, asset) ?? -Infinity;
    case 'current':
      return positionCurrentValue(position, asset) ?? -Infinity;
    case 'yield':
      return (position.contracted_yield ?? '').toLowerCase();
    case 'profit':
      return computePositionProfit(position, asset)?.profit ?? -Infinity;
    default:
      return '';
  }
}

function compareRows(a: PositionRow, b: PositionRow, key: SortKey, dir: number): number {
  const va = sortValue(a, key);
  const vb = sortValue(b, key);
  if (typeof va === 'number' && typeof vb === 'number') {
    return va === vb ? 0 : va < vb ? -dir : dir;
  }
  const sa = String(va);
  const sb = String(vb);
  return sa === sb ? 0 : sa < sb ? -dir : dir;
}

export function sortPositionRows(
  rows: PositionRow[],
  sortKey: SortKey,
  sortDir: SortDir
): PositionRow[] {
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => compareRows(a, b, sortKey, dir));
}
