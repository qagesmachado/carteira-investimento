import { describe, expect, it } from 'vitest';

import type { MarketPositionOption } from './filterMarketPositions';
import { filterMarketPositionOptions } from './filterMarketPositionOptions';

const options: MarketPositionOption[] = [
  {
    positionId: 1,
    assetId: 1,
    label: 'BBSE3 — 100 @ R$ 32,50',
    quantity: 100,
    averagePrice: 32.5,
    currency: 'BRL'
  },
  {
    positionId: 2,
    assetId: 2,
    label: 'PETR4 — 50 @ R$ 35,00',
    quantity: 50,
    averagePrice: 35,
    currency: 'BRL'
  }
];

describe('filterMarketPositionOptions', () => {
  it('retorna todas quando busca vazia', () => {
    expect(filterMarketPositionOptions(options, '')).toHaveLength(2);
  });

  it('filtra por ticker', () => {
    expect(filterMarketPositionOptions(options, 'BBSE3')).toHaveLength(1);
    expect(filterMarketPositionOptions(options, 'petr')).toHaveLength(1);
  });

  it('retorna vazio quando nada corresponde', () => {
    expect(filterMarketPositionOptions(options, 'ITSA4')).toHaveLength(0);
  });
});
