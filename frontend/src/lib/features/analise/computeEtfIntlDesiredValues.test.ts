import { describe, expect, it } from 'vitest';

import {
  computeCurrentPercentInGroup,
  computeDesiredValueBrl,
  computeDesiredValueUsd,
  isAllocationSumValid,
  parseTargetPercentRef,
  sumTargetPercents
} from './computeEtfIntlDesiredValues';

describe('computeEtfIntlDesiredValues', () => {
  it('validates allocation sum equals 100', () => {
    expect(
      isAllocationSumValid([
        { asset_id: 1, target_percent: 60, analysis_link: '' },
        { asset_id: 2, target_percent: 40, analysis_link: '' }
      ])
    ).toBe(true);
    expect(
      isAllocationSumValid([{ asset_id: 1, target_percent: 90, analysis_link: '' }])
    ).toBe(false);
  });

  it('sums target percents', () => {
    expect(
      sumTargetPercents([
        { asset_id: 1, target_percent: 33.33, analysis_link: '' },
        { asset_id: 2, target_percent: 66.67, analysis_link: '' }
      ])
    ).toBeCloseTo(100, 2);
  });

  it('computes current percent within group', () => {
    expect(computeCurrentPercentInGroup(30, 100)).toBe(30);
    expect(computeCurrentPercentInGroup(0, 0)).toBeNull();
  });

  it('computes desired values in BRL and USD', () => {
    const brl = computeDesiredValueBrl(100_000, 20, 100);
    expect(brl).toBe(20_000);
    expect(computeDesiredValueUsd(brl, 5)).toBe(4_000);
    expect(computeDesiredValueUsd(brl, null)).toBeNull();
  });

  it('parses target percent refs', () => {
    expect(parseTargetPercentRef('60')).toBe(60);
    expect(parseTargetPercentRef('33,5')).toBe(33.5);
    expect(parseTargetPercentRef('')).toBe(0);
  });
});
