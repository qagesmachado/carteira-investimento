import {
  isNationalEtfMissingSubtype,
  lookupToAssetCreate,
  type AssetCreate,
  type BulkPreviewItem
} from '$lib/api/assets';
import { formatAssetTypeForDisplay, formatCurrencyCodeForDisplay } from '$lib/assetLabels';
import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

export function getPayloadForPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): AssetCreate | null {
  if (draftBySymbol[item.symbol]) {
    return draftBySymbol[item.symbol];
  }
  if (item.lookup) {
    return lookupToAssetCreate(item.lookup);
  }
  return null;
}

export function canSelectPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): boolean {
  if (item.already_in_db || item.error) {
    return false;
  }
  const payload = getPayloadForPreviewItem(item, draftBySymbol);
  if (!payload) {
    return false;
  }
  return !isNationalEtfMissingSubtype(payload);
}

export function canEditPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): boolean {
  return getPayloadForPreviewItem(item, draftBySymbol) !== null;
}

export function displaySymbolForPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): string {
  const payload = getPayloadForPreviewItem(item, draftBySymbol);
  return formatTickerForDisplay(payload?.symbol ?? item.symbol);
}

export function displayNameForPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): string {
  const payload = getPayloadForPreviewItem(item, draftBySymbol);
  return payload?.name ?? '—';
}

export function displayTypeForPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): string {
  const payload = getPayloadForPreviewItem(item, draftBySymbol);
  return payload ? formatAssetTypeForDisplay(payload.asset_type) : '—';
}

export function displayCurrencyForPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): string {
  const payload = getPayloadForPreviewItem(item, draftBySymbol);
  return payload ? formatCurrencyCodeForDisplay(payload.currency) : '—';
}

export type PreviewTableRow = {
  rowKey: string;
  item: BulkPreviewItem;
  ticker: string;
  name: string;
  type: string;
  currency: string;
  status: string;
  canSelect: boolean;
  canEdit: boolean;
};

export function buildPreviewTableRows(
  previewItems: BulkPreviewItem[],
  draftBySymbol: Record<string, AssetCreate>
): PreviewTableRow[] {
  return previewItems.map((item) => ({
    rowKey: item.symbol,
    item,
    ticker: displaySymbolForPreviewItem(item, draftBySymbol),
    name: displayNameForPreviewItem(item, draftBySymbol),
    type: displayTypeForPreviewItem(item, draftBySymbol),
    currency: displayCurrencyForPreviewItem(item, draftBySymbol),
    status: rowStatusForPreviewItem(item, draftBySymbol),
    canSelect: canSelectPreviewItem(item, draftBySymbol),
    canEdit: canEditPreviewItem(item, draftBySymbol)
  }));
}

export function rowStatusForPreviewItem(
  item: BulkPreviewItem,
  draftBySymbol: Record<string, AssetCreate>
): string {
  if (item.already_in_db) {
    return 'Já cadastrado';
  }
  if (item.error) {
    return 'Erro na busca';
  }
  const payload = getPayloadForPreviewItem(item, draftBySymbol);
  if (!payload) {
    return 'Sem dados';
  }
  if (isNationalEtfMissingSubtype(payload)) {
    return 'ETF nacional: informe subtipo';
  }
  if (draftBySymbol[item.symbol]) {
    return 'Revisado';
  }
  return 'Pronto';
}
