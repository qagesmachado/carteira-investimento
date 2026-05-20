import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import {
  assetMatchesPositionSearch,
  buildPositionRows,
  filterPositionRows,
  sortPositionRows
} from './positionTableView';

const bbse3: Asset = {
  id: 1,
  symbol: 'BBSE3',
  name: 'BB Seguridade',
  asset_type: 'stock',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'stocks',
  current_quote: 35
};

const voo: Asset = {
  id: 2,
  symbol: 'VOO',
  name: 'Vanguard S&P 500 ETF',
  asset_type: 'etf',
  market: 'international',
  country: 'US',
  currency: 'USD',
  display_class: 'international',
  current_quote: 400
};

const cdb: Asset = {
  id: 3,
  symbol: 'E2E-CDB-BTG-2028',
  name: 'CDB BTG',
  asset_type: 'fixed_income',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'fixed_income'
};

const bbse3Position: Position = {
  id: 1,
  portfolio_id: 1,
  asset_id: 1,
  quantity: 100,
  average_price: 30,
  status: 'active',
  created_at: '',
  updated_at: ''
};

const vooPosition: Position = {
  id: 2,
  portfolio_id: 1,
  asset_id: 2,
  quantity: 5,
  average_price: 380,
  status: 'active',
  created_at: '',
  updated_at: ''
};

const cdbPosition: Position = {
  id: 3,
  portfolio_id: 1,
  asset_id: 3,
  quantity: 0,
  average_price: 0,
  invested_amount: 10000,
  current_value: 10500,
  contracted_yield: 'IPCA + 8%',
  status: 'active',
  created_at: '',
  updated_at: ''
};

const assetById: Record<number, Asset> = {
  1: bbse3,
  2: voo,
  3: cdb
};

describe('positionTableView', () => {
  it('monta linhas apenas com ativo conhecido', () => {
    const rows = buildPositionRows(
      [bbse3Position, { ...vooPosition, asset_id: 999 }],
      assetById
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].asset.symbol).toBe('BBSE3');
  });

  it('filtra por ticker ou nome', () => {
    const rows = buildPositionRows([bbse3Position, vooPosition, cdbPosition], assetById);
    const filtered = filterPositionRows(rows, 'BBSE');
    expect(filtered.map((r) => r.asset.symbol)).toEqual(['BBSE3']);

    const byName = filterPositionRows(rows, 'Vanguard');
    expect(byName.map((r) => r.asset.symbol)).toEqual(['VOO']);
  });

  it('ordena por ticker asc e desc', () => {
    const rows = buildPositionRows([vooPosition, bbse3Position], assetById);
    const asc = sortPositionRows(rows, 'ticker', 'asc');
    expect(asc.map((r) => r.asset.symbol)).toEqual(['BBSE3', 'VOO']);

    const desc = sortPositionRows(rows, 'ticker', 'desc');
    expect(desc.map((r) => r.asset.symbol)).toEqual(['VOO', 'BBSE3']);
  });

  it('ordena por valor aplicado', () => {
    const rows = buildPositionRows([bbse3Position, cdbPosition], assetById);
    const asc = sortPositionRows(rows, 'invested', 'asc');
    expect(asc[0].asset.asset_type).toBe('stock');
    expect(asc[1].asset.asset_type).toBe('fixed_income');
  });

  it('assetMatchesPositionSearch aceita tipo de ativo', () => {
    expect(assetMatchesPositionSearch(bbse3, 'ação')).toBe(true);
    expect(assetMatchesPositionSearch(voo, 'ação')).toBe(false);
  });
});
