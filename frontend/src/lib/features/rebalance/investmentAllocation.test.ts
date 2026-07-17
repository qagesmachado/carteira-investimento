import { describe, expect, it } from 'vitest';

import type { ClassRowForAllocation } from './investmentAllocation';
import {
  computeAssetInvestmentAllocation,
  computeClassInvestmentAllocation,
  defaultIncludedClasses,
  resolveInvestmentAmount
} from './investmentAllocation';

const sampleClasses: ClassRowForAllocation[] = [
  { display_class: 'stocks', current_value_brl: 42_651.37, target_percent: 30 },
  { display_class: 'international', current_value_brl: 11_374.17, target_percent: 20 },
  { display_class: 'fixed_income', current_value_brl: 40_000, target_percent: 40 }
];

describe('resolveInvestmentAmount', () => {
  it('returns zero for empty input', () => {
    expect(resolveInvestmentAmount('invest_amount', 0, 100_000)).toBe(0);
    expect(resolveInvestmentAmount('final_total', 0, 100_000)).toBe(0);
  });

  it('returns invest amount directly in invest mode', () => {
    expect(resolveInvestmentAmount('invest_amount', 10_000, 100_000)).toBe(10_000);
  });

  it('derives investment from final total in total mode', () => {
    expect(resolveInvestmentAmount('final_total', 125_000, 118_450)).toBe(6_550);
    expect(resolveInvestmentAmount('final_total', 100_000, 118_450)).toBe(0);
  });
});

describe('computeClassInvestmentAllocation', () => {
  it('returns null when investment amount is empty', () => {
    expect(
      computeClassInvestmentAllocation(sampleClasses, 100_000, 0, defaultIncludedClasses(sampleClasses))
    ).toBeNull();
  });

  it('returns null when no class is included', () => {
    const included = Object.fromEntries(sampleClasses.map((c) => [c.display_class, false]));
    expect(computeClassInvestmentAllocation(sampleClasses, 100_000, 10_000, included)).toBeNull();
  });

  it('calculates ideal target and contribution for simple investment', () => {
    const result = computeClassInvestmentAllocation(
      sampleClasses,
      100_000,
      10_000,
      defaultIncludedClasses(sampleClasses)
    );
    expect(result).not.toBeNull();
    expect(result!.finalPatrimonyBrl).toBe(110_000);

    const intl = result!.rows.find((r) => r.display_class === 'international');
    expect(intl!.idealTargetBrl).toBeCloseTo(22_000, 2);
    expect(intl!.suggestedContributionBrl).toBeGreaterThan(0);
    expect(result!.totalSuggestedContributionBrl).toBeCloseTo(10_000, 2);
  });

  it('assigns zero contribution to excluded classes and redistributes their gap', () => {
    const classes: ClassRowForAllocation[] = [
      { display_class: 'stocks', current_value_brl: 20_000, target_percent: 30 },
      { display_class: 'international', current_value_brl: 5_000, target_percent: 20 },
      { display_class: 'fixed_income', current_value_brl: 30_000, target_percent: 40 }
    ];
    const included = {
      stocks: true,
      international: false,
      fixed_income: true
    };
    const allIncluded = computeClassInvestmentAllocation(
      classes,
      100_000,
      10_000,
      defaultIncludedClasses(classes)
    );
    const partial = computeClassInvestmentAllocation(classes, 100_000, 10_000, included);
    expect(partial).not.toBeNull();

    const excluded = partial!.rows.find((r) => r.display_class === 'international');
    expect(excluded!.suggestedContributionBrl).toBe(0);

    const fixedPartial = partial!.rows.find((r) => r.display_class === 'fixed_income')!;
    const fixedAll = allIncluded!.rows.find((r) => r.display_class === 'fixed_income')!;
    expect(fixedPartial.suggestedContributionBrl).toBeGreaterThan(fixedAll.suggestedContributionBrl);
    expect(partial!.totalSuggestedContributionBrl).toBeCloseTo(10_000, 2);
  });

  it('distributes by target percent when all included classes are above target', () => {
    const overweight: ClassRowForAllocation[] = [
      { display_class: 'stocks', current_value_brl: 50_000, target_percent: 30 },
      { display_class: 'fixed_income', current_value_brl: 50_000, target_percent: 40 }
    ];
    const result = computeClassInvestmentAllocation(
      overweight,
      100_000,
      5_000,
      defaultIncludedClasses(overweight)
    );
    expect(result).not.toBeNull();
    const stocks = result!.rows.find((r) => r.display_class === 'stocks')!;
    const fixed = result!.rows.find((r) => r.display_class === 'fixed_income')!;
    expect(stocks.suggestedContributionBrl).toBeCloseTo(5_000 * (30 / 70), 2);
    expect(fixed.suggestedContributionBrl).toBeCloseTo(5_000 * (40 / 70), 2);
    expect(result!.totalSuggestedContributionBrl).toBeCloseTo(5_000, 2);
  });
});

describe('computeAssetInvestmentAllocation', () => {
  it('returns null when class contribution is null or zero', () => {
    expect(
      computeAssetInvestmentAllocation([], 0, 100_000, 110_000)
    ).toBeNull();
  });

  it('distributes class contribution proportionally to asset ideal gaps', () => {
    const assets = [
      {
        asset_id: 1,
        current_value_brl: 8_000,
        target_value_brl: 12_000,
        gap_brl: 4_000
      },
      {
        asset_id: 2,
        current_value_brl: 2_000,
        target_value_brl: 6_000,
        gap_brl: 4_000
      }
    ];
    const result = computeAssetInvestmentAllocation(assets, 10_000, 100_000, 110_000);
    expect(result).not.toBeNull();
    expect(result!.get(1)!.suggestedContributionBrl).toBeCloseTo(5_306.12, 2);
    expect(result!.get(2)!.suggestedContributionBrl).toBeCloseTo(4_693.88, 2);
    expect(result!.get(1)!.idealTargetBrl).toBeCloseTo(13_200, 2);
    expect(
      (result!.get(1)!.suggestedContributionBrl ?? 0) + (result!.get(2)!.suggestedContributionBrl ?? 0)
    ).toBeCloseTo(10_000, 2);
  });
});
