import { describe, expect, it } from 'vitest';

import { computeWeightedAveragePrice } from './computeWeightedAveragePrice';

describe('computeWeightedAveragePrice', () => {
  it('calcula média ponderada clássica', () => {
    const outcome = computeWeightedAveragePrice(
      { quantity: 100, averagePrice: 30 },
      { quantity: 50, averagePrice: 35 }
    );
    expect(outcome.success).toBe(true);
    if (!outcome.success) return;
    expect(outcome.result.totalQuantity).toBe(150);
    expect(outcome.result.averagePrice).toBeCloseTo(31.666666, 4);
    expect(outcome.result.totalInvested).toBeCloseTo(4750, 4);
  });

  it('calcula com quantidades decimais (crypto)', () => {
    const outcome = computeWeightedAveragePrice(
      { quantity: 0.5, averagePrice: 300_000 },
      { quantity: 0.1, averagePrice: 320_000 }
    );
    expect(outcome.success).toBe(true);
    if (!outcome.success) return;
    expect(outcome.result.totalQuantity).toBeCloseTo(0.6);
    expect(outcome.result.averagePrice).toBeCloseTo(303_333.333, 2);
  });

  it('rejeita quantidade inválida', () => {
    expect(
      computeWeightedAveragePrice({ quantity: 0, averagePrice: 30 }, { quantity: 50, averagePrice: 35 })
        .success
    ).toBe(false);
    expect(
      computeWeightedAveragePrice({ quantity: 100, averagePrice: 30 }, { quantity: -1, averagePrice: 35 })
        .success
    ).toBe(false);
  });

  it('rejeita preço negativo', () => {
    const outcome = computeWeightedAveragePrice(
      { quantity: 100, averagePrice: -1 },
      { quantity: 50, averagePrice: 35 }
    );
    expect(outcome.success).toBe(false);
  });
});
