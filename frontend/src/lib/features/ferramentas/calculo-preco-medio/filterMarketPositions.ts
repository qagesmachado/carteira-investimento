import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import { formatMoneyAmount } from '$lib/assetLabels';
import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
import { formatQuantityForDisplay, usesManualPositionValues } from '$lib/features/portfolios/positionMetrics';

export type MarketPositionOption = {
  positionId: number;
  assetId: number;
  label: string;
  quantity: number;
  averagePrice: number;
  currency: string;
};

export function buildMarketPositionOptions(
  positions: Position[],
  assets: Asset[]
): MarketPositionOption[] {
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));

  return positions
    .map((position) => {
      const asset = assetById.get(position.asset_id);
      if (!asset || usesManualPositionValues(asset)) {
        return null;
      }
      if (position.quantity <= 0 || position.average_price < 0) {
        return null;
      }
      const ticker = formatTickerForDisplay(asset.symbol);
      const qtyLabel = formatQuantityForDisplay(position.quantity);
      const priceLabel = formatMoneyAmount(position.average_price, asset.currency);
      return {
        positionId: position.id,
        assetId: position.asset_id,
        label: `${ticker} — ${qtyLabel} @ ${priceLabel}`,
        quantity: position.quantity,
        averagePrice: position.average_price,
        currency: asset.currency
      };
    })
    .filter((option): option is MarketPositionOption => option != null)
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}
