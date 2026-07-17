import type { AssetRebalanceRow, ClassRebalanceRow } from '$lib/api/rebalance';

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export function filterClassRebalanceRows(
  rows: ClassRebalanceRow[],
  filterText: string
): ClassRebalanceRow[] {
  const query = normalizeSearch(filterText);
  if (!query) {
    return rows;
  }
  return rows.filter((row) => row.label.toLowerCase().includes(query));
}

export function filterAssetRebalanceRows(
  rows: AssetRebalanceRow[],
  filterText: string
): AssetRebalanceRow[] {
  const query = normalizeSearch(filterText);
  if (!query) {
    return rows;
  }
  return rows.filter(
    (row) =>
      row.symbol.toLowerCase().includes(query) || row.name.toLowerCase().includes(query)
  );
}
