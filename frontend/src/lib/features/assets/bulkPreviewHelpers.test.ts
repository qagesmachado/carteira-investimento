import { describe, expect, it } from 'vitest';

import type { AssetCreate, BulkPreviewItem } from '$lib/api/assets';

import {
  buildPreviewTableRows,
  canSelectPreviewItem,
  displayCurrencyForPreviewItem,
  displayNameForPreviewItem,
  displaySymbolForPreviewItem,
  displayTypeForPreviewItem,
  getPayloadForPreviewItem,
  rowStatusForPreviewItem
} from './bulkPreviewHelpers';

const stockLookup = {
  symbol: 'PETR4',
  name: 'Petrobras',
  asset_type: 'stock' as const,
  market: 'national' as const,
  country: 'BR',
  currency: 'BRL',
  sector: null,
  subsector: null,
  segment: null,
  company_cnpj: null,
  payer_cnpj: null,
  payer_name: null,
  quote_source: null,
  current_quote: null
};

function item(overrides: Partial<BulkPreviewItem> = {}): BulkPreviewItem {
  return {
    symbol: 'PETR4',
    lookup: stockLookup,
    error: null,
    already_in_db: false,
    ...overrides
  };
}

describe('bulkPreviewHelpers', () => {
  it('usa rascunho editado no payload e nas colunas da pré-visualização', () => {
    const draft: Record<string, AssetCreate> = {
      PETR4: {
        ...stockLookup,
        symbol: 'VALE3',
        name: 'Nome revisado',
        asset_type: 'fii',
        currency: 'USD',
        etf_subtype: null,
        notes: null
      }
    };
    const row = item();

    expect(getPayloadForPreviewItem(row, draft)?.name).toBe('Nome revisado');
    expect(displaySymbolForPreviewItem(row, draft)).toBe('VALE3');
    expect(displayNameForPreviewItem(row, draft)).toBe('Nome revisado');
    expect(displayTypeForPreviewItem(row, draft)).toBe('Fundo imobiliário');
    expect(displayCurrencyForPreviewItem(row, draft)).toBe('Dólar (USD)');
    expect(rowStatusForPreviewItem(row, draft)).toBe('Revisado');

    const tableRow = buildPreviewTableRows([row], draft)[0];
    expect(tableRow.ticker).toBe('VALE3');
    expect(tableRow.type).toBe('Fundo imobiliário');
    expect(tableRow.currency).toBe('Dólar (USD)');
  });

  it('bloqueia seleção de ETF nacional sem subtipo', () => {
    const etfRow = item({
      symbol: 'BOVA11',
      lookup: { ...stockLookup, symbol: 'BOVA11', asset_type: 'etf' }
    });

    expect(canSelectPreviewItem(etfRow, {})).toBe(false);
    expect(rowStatusForPreviewItem(etfRow, {})).toBe('ETF nacional: informe subtipo');
  });
});
