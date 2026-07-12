import { describe, expect, it } from 'vitest';

import {
  computeRebalanceAdherence,
  formatBelowTargetLine,
  formatGapBelowTarget,
  MAX_BELOW_TARGET_ITEMS
} from './rebalanceAdherence';

describe('computeRebalanceAdherence', () => {
  it('returns zero adherence for empty classes', () => {
    const result = computeRebalanceAdherence([]);
    expect(result.adherencePercent).toBe(0);
    expect(result.hasTargets).toBe(false);
    expect(result.belowTargetItems).toEqual([]);
    expect(result.statusMessage).toContain('Configure metas');
  });

  it('computes adherence percent from mean deviation', () => {
    const result = computeRebalanceAdherence([
      {
        display_class: 'stocks',
        label: 'Ações/ETF BR',
        current_value_brl: 42000,
        current_percent: 42,
        target_percent: 40,
        target_value_brl: 40000,
        gap_brl: 0
      },
      {
        display_class: 'funds',
        label: 'FII',
        current_value_brl: 16000,
        current_percent: 16,
        target_percent: 20,
        target_value_brl: 20000,
        gap_brl: 4000
      }
    ]);
    expect(result.adherencePercent).toBe(97);
    expect(result.belowTargetItems).toEqual([{ classLabel: 'FII', gapPercent: 4 }]);
    expect(result.statusMessage).toBeNull();
  });

  it('lists up to three classes below target ordered by largest gap', () => {
    const result = computeRebalanceAdherence([
      {
        display_class: 'intl',
        label: 'Internacional',
        current_value_brl: 20000,
        current_percent: 20,
        target_percent: 30,
        target_value_brl: 30000,
        gap_brl: 10000
      },
      {
        display_class: 'funds',
        label: 'FII',
        current_value_brl: 16000,
        current_percent: 16,
        target_percent: 20,
        target_value_brl: 20000,
        gap_brl: 4000
      },
      {
        display_class: 'fixed',
        label: 'Renda fixa',
        current_value_brl: 23000,
        current_percent: 23,
        target_percent: 25,
        target_value_brl: 25000,
        gap_brl: 2000
      },
      {
        display_class: 'stocks',
        label: 'Ações/ETF BR',
        current_value_brl: 40000,
        current_percent: 40,
        target_percent: 45,
        target_value_brl: 45000,
        gap_brl: 5000
      }
    ]);

    expect(result.belowTargetItems).toHaveLength(MAX_BELOW_TARGET_ITEMS);
    expect(result.belowTargetItems.map((item) => item.classLabel)).toEqual([
      'Internacional',
      'Ações/ETF BR',
      'FII'
    ]);
    expect(result.belowTargetItems.map((item) => item.gapPercent)).toEqual([10, 5, 4]);
    expect(result.statusMessage).toBeNull();
  });

  it('reports adherent portfolio when no class below target', () => {
    const result = computeRebalanceAdherence([
      {
        display_class: 'stocks',
        label: 'Ações/ETF BR',
        current_value_brl: 50000,
        current_percent: 50,
        target_percent: 40,
        target_value_brl: 40000,
        gap_brl: 0
      }
    ]);
    expect(result.statusMessage).toBe('Carteira aderente às metas');
    expect(result.belowTargetItems).toEqual([]);
  });
});

describe('formatGapBelowTarget', () => {
  it('formats gap with percent sign in pt-BR', () => {
    expect(formatGapBelowTarget(9.4)).toBe('9,4%');
  });
});

describe('formatBelowTargetLine', () => {
  it('uses percent notation instead of p.p.', () => {
    expect(formatBelowTargetLine({ classLabel: 'Internacional', gapPercent: 9.4 })).toBe(
      'Internacional 9,4% abaixo da meta'
    );
  });
});
