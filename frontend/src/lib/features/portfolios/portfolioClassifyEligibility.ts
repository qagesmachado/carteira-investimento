import type { DisplayClass } from '$lib/api/assets';
import type { AnalysisMethodology } from '$lib/api/analysis';
import { PROFILE_FII_BR, PROFILE_STOCK_BR } from '$lib/api/analysis';
import { LEGACY_DEFAULT_METHODOLOGY } from '$lib/features/analise/analysisMethodology';

export type PortfolioMethodologies = Partial<Record<string, AnalysisMethodology>>;

const DISPLAY_CLASS_TO_PROFILE: Partial<Record<DisplayClass, string>> = {
  stocks: PROFILE_STOCK_BR,
  funds: PROFILE_FII_BR
};

export function analysisProfileForDisplayClass(displayClass: DisplayClass | string): string | null {
  return DISPLAY_CLASS_TO_PROFILE[displayClass as DisplayClass] ?? null;
}

export function methodologyForProfile(
  profile: string,
  methodologies: PortfolioMethodologies = {}
): AnalysisMethodology {
  return methodologies[profile] ?? LEGACY_DEFAULT_METHODOLOGY[profile] ?? 'simples';
}

export function canClassifyPortfolioAsset(
  asset: { display_class: DisplayClass | string },
  methodologies: PortfolioMethodologies = {}
): boolean {
  const profile = analysisProfileForDisplayClass(asset.display_class);
  if (!profile) {
    return false;
  }
  const methodology = methodologies[profile];
  if (methodology == null) {
    return false;
  }
  return methodology === 'auvp';
}
