import type { AssetAnalysis } from '$lib/api/analysis';

export function filterAnalysisByPortfolio(
  rows: AssetAnalysis[],
  assetIdsInPortfolio: ReadonlySet<number>
): AssetAnalysis[] {
  return rows.filter((row) => assetIdsInPortfolio.has(row.asset_id));
}
