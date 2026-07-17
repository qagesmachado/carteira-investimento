import { describe, expect, it } from 'vitest';

import {
  allocationTargetPercentFromRow,
  buildAllocationSavePayload,
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

  it('ignora pendentes na soma de alocação', () => {
    const allocations = [
      { asset_id: 1, target_percent: 60, analysis_link: '' },
      { asset_id: 2, target_percent: 40, analysis_link: '' },
      { asset_id: 3, target_percent: 50, analysis_link: '' }
    ];
    const pending = new Set([3]);
    expect(sumTargetPercents(allocations, pending)).toBe(100);
    expect(isAllocationSumValid(allocations, 0.01, pending)).toBe(true);
  });

  it('usa zero para linha pendente ao montar draft', () => {
    expect(
      allocationTargetPercentFromRow({
        is_pending: true,
        score_refs: { target_percent: '10' }
      })
    ).toBe(0);
    expect(
      buildAllocationSavePayload(
        [{ asset_id: 1, target_percent: 60, analysis_link: '' }],
        new Set([2])
      )
    ).toEqual([{ asset_id: 1, target_percent: 60, analysis_link: '' }]);
    expect(
      buildAllocationSavePayload(
        [
          { asset_id: 1, target_percent: 60, analysis_link: '' },
          { asset_id: 2, target_percent: 10, analysis_link: '' }
        ],
        new Set([2])
      )[1]?.target_percent
    ).toBe(0);
  });
});
