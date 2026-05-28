import type { Asset } from '$lib/api/assets';

export type SplitMode = 'shares' | 'amount';

const AMOUNT_ASSET_TYPES = new Set(['fixed_income', 'pension']);

export function splitModeForAsset(asset: Pick<Asset, 'asset_type'>): SplitMode {
  return AMOUNT_ASSET_TYPES.has(asset.asset_type) ? 'amount' : 'shares';
}

export function splitModeForAssetType(assetType: string): SplitMode {
  return AMOUNT_ASSET_TYPES.has(assetType) ? 'amount' : 'shares';
}
