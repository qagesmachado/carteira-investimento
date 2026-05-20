import type {
  ImportAssetPreviewItem,
  ImportAssetResolution,
  ImportConflictField
} from '$lib/api/portfolios';

export const EXPORT_VERSION = 1;

export function parsePortfolioExportJson(text: string): unknown {
  return JSON.parse(text) as unknown;
}

export function isPortfolioExportDocument(value: unknown): value is { version: number } {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const doc = value as { version?: unknown };
  return doc.version === EXPORT_VERSION;
}

export function defaultResolutionForPreview(item: ImportAssetPreviewItem): ImportAssetResolution {
  if (item.status === 'missing') {
    return {
      symbol: item.symbol,
      action: 'create',
      asset_create: item.lookup ?? item.file_asset ?? undefined
    };
  }
  if (item.status === 'conflict') {
    return {
      symbol: item.symbol,
      action: 'update',
      asset_create: item.file_asset ?? undefined,
      fields: item.fields.map((f) => ({ ...f }))
    };
  }
  return { symbol: item.symbol, action: 'keep' };
}

export function buildResolutionsFromPreview(
  items: ImportAssetPreviewItem[],
  fieldOverrides: Record<string, ImportConflictField[]>
): ImportAssetResolution[] {
  return items.map((item) => {
    const base = defaultResolutionForPreview(item);
    if (item.status === 'conflict' && fieldOverrides[item.symbol]) {
      return { ...base, fields: fieldOverrides[item.symbol] };
    }
    return base;
  });
}

export function hasPendingConflict(
  item: ImportAssetPreviewItem,
  fields: ImportConflictField[] | undefined
): boolean {
  if (item.status !== 'conflict') {
    return false;
  }
  const list = fields ?? item.fields;
  return list.some((f) => f.resolution === 'keep_base' && f.base_value !== f.file_value);
}
