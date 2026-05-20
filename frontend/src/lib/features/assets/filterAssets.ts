import type { Asset } from '$lib/api/assets';
import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

export function filterAssets(assets: Asset[], query: string): Asset[] {
  const q = query.trim();
  if (!q) {
    return assets;
  }

  const qLower = q.toLowerCase();
  const qUpper = q.toUpperCase();

  return assets.filter((asset) => {
    const displayTicker = formatTickerForDisplay(asset.symbol);
    const symbolUpper = asset.symbol.toUpperCase();
    if (
      displayTicker.includes(qUpper) ||
      symbolUpper.includes(qUpper) ||
      symbolUpper.replace('.SA', '').includes(qUpper)
    ) {
      return true;
    }
    return asset.name.toLowerCase().includes(qLower);
  });
}
