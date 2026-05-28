import { describe, expect, it } from 'vitest';

import { splitModeForAssetType } from './splitMode';

describe('splitModeForAssetType', () => {
  it('usa amount para renda fixa e previdência', () => {
    expect(splitModeForAssetType('fixed_income')).toBe('amount');
    expect(splitModeForAssetType('pension')).toBe('amount');
  });

  it('usa shares para demais tipos', () => {
    expect(splitModeForAssetType('stock')).toBe('shares');
    expect(splitModeForAssetType('etf')).toBe('shares');
    expect(splitModeForAssetType('fii')).toBe('shares');
  });
});
