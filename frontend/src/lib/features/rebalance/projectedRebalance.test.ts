import { describe, expect, it } from 'vitest';

import {
  computeProjectedAssetGap,
  computeProjectedClassGap,
  computeProjectedTotalGap
} from './projectedRebalance';

describe('projectedRebalance', () => {
  it('returns null when patrimônio final is empty', () => {
    expect(computeProjectedClassGap(10_000, 20, null)).toBeNull();
    expect(computeProjectedClassGap(10_000, 20, 0)).toBeNull();
  });

  it('calculates gap against final patrimony', () => {
    // patrimônio final 126_123,94 × 20% = 25_224,79; atual 11_374,17 → faltando 13_850,62
    expect(computeProjectedClassGap(11_374.17, 20, 126_123.94)).toBeCloseTo(13_850.62, 2);
  });

  it('never returns negative gap', () => {
    expect(computeProjectedClassGap(50_000, 30, 100_000)).toBe(0);
  });

  it('sums class gaps for total row', () => {
    const classes = [
      { current_value_brl: 42_651.37, target_percent: 30 },
      { current_value_brl: 11_374.17, target_percent: 20 }
    ];
    const total = computeProjectedTotalGap(classes, 126_123.94);
    expect(total).toBeGreaterThan(0);
  });

  it('calculates projected asset gap from target value and patrimony scale', () => {
    expect(computeProjectedAssetGap(8_000, 12_000, 100_000, 150_000)).toBeCloseTo(10_000, 2);
  });

  it('returns null for asset without target value', () => {
    expect(computeProjectedAssetGap(1_000, null, 100_000, 150_000)).toBeNull();
  });
});
