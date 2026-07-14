import type { AssetType } from '$lib/api/assets';
import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

export const ASSET_TYPE_LUCIDE_ICON: Record<AssetType, LucideIconName> = {
  stock: 'CandlestickChart',
  etf: 'Layers',
  fii: 'Building2',
  fixed_income: 'Landmark',
  crypto: 'Bitcoin',
  pension: 'Umbrella',
  other: 'CircleEllipsis'
};

export function lucideIconForAssetType(assetType: AssetType | string): LucideIconName {
  return ASSET_TYPE_LUCIDE_ICON[assetType as AssetType] ?? 'CircleEllipsis';
}
