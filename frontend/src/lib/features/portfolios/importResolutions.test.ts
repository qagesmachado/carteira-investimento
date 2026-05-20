import { describe, expect, it } from 'vitest';

import type { ImportAssetPreviewItem } from '$lib/api/portfolios';

import {
  buildResolutionsFromPreview,
  defaultResolutionForPreview,
  isPortfolioExportDocument
} from './importResolutions';

describe('importResolutions', () => {
  it('validates export document version', () => {
    expect(isPortfolioExportDocument({ version: 1 })).toBe(true);
    expect(isPortfolioExportDocument({ version: 2 })).toBe(false);
  });

  it('defaults missing asset to create', () => {
    const item: ImportAssetPreviewItem = {
      symbol: 'X',
      status: 'missing',
      file_asset: {
        symbol: 'X',
        name: 'X',
        asset_type: 'stock',
        market: 'national',
        currency: 'BRL'
      },
      fields: []
    };
    expect(defaultResolutionForPreview(item).action).toBe('create');
  });

  it('builds resolutions with field overrides', () => {
    const items: ImportAssetPreviewItem[] = [
      {
        symbol: 'Y',
        status: 'conflict',
        fields: [{ field: 'name', resolution: 'keep_base', base_value: 'A', file_value: 'B' }]
      }
    ];
    const overrides = {
      Y: [{ field: 'name', resolution: 'use_file', base_value: 'A', file_value: 'B' }]
    };
    const resolutions = buildResolutionsFromPreview(items, overrides);
    expect(resolutions[0].fields?.[0].resolution).toBe('use_file');
  });
});
