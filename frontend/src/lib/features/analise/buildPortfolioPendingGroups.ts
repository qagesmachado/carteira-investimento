import type {
  AnalysisPortfolioPending,
  AssetAnalysis,
  PendingAssetsGroup
} from '$lib/api/analysis';

export const ANALYSIS_PENDING_PROFILES = [
  'stock_br',
  'fii_br',
  'etf_intl',
  'crypto'
] as const;

export function buildPortfolioPendingGroups(
  portfolioId: number,
  rowsByProfile: Record<string, AssetAnalysis[]>
): AnalysisPortfolioPending {
  const groups: PendingAssetsGroup[] = [];

  for (const profile of ANALYSIS_PENDING_PROFILES) {
    const pendingAssets = (rowsByProfile[profile] ?? [])
      .filter((row) => row.is_pending)
      .map((row) => ({
        asset_id: row.asset_id,
        symbol: row.symbol,
        name: row.name,
        asset_type: row.asset_type,
        profile
      }))
      .sort((left, right) => left.symbol.localeCompare(right.symbol));

    if (pendingAssets.length > 0) {
      groups.push({ profile, assets: pendingAssets });
    }
  }

  return { portfolio_id: portfolioId, groups };
}
