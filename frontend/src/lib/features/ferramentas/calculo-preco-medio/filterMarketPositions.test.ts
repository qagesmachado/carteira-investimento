import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import { buildMarketPositionOptions } from './filterMarketPositions';

const stockAsset: Asset = {
  id: 1,
  symbol: 'BBSE3',
  name: 'BB Seguridade',
  asset_type: 'stock',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  sector: 'Financeiro',
  display_class: 'stocks',
  current_quote: 35
};

const rfAsset: Asset = {
  ...stockAsset,
  id: 2,
  symbol: 'CDB-001',
  asset_type: 'fixed_income',
  currency: 'BRL'
};

function position(overrides: Partial<Position> = {}): Position {
  return {
    id: 10,
    portfolio_id: 1,
    asset_id: 1,
    quantity: 100,
    average_price: 32.5,
    status: 'active',
    created_at: '',
    updated_at: '',
    ...overrides
  };
}

describe('buildMarketPositionOptions', () => {
  it('inclui posição de mercado com label formatado', () => {
    const options = buildMarketPositionOptions([position()], [stockAsset]);
    expect(options).toHaveLength(1);
    expect(options[0].label).toContain('BBSE3');
    expect(options[0].quantity).toBe(100);
    expect(options[0].averagePrice).toBe(32.5);
  });

  it('exclui RF e previdência', () => {
    const options = buildMarketPositionOptions(
      [position({ asset_id: 2, id: 11 })],
      [rfAsset]
    );
    expect(options).toHaveLength(0);
  });

  it('exclui posição sem quantidade', () => {
    const options = buildMarketPositionOptions([position({ quantity: 0 })], [stockAsset]);
    expect(options).toHaveLength(0);
  });
});
