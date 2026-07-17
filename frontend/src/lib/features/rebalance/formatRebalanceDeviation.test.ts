import { describe, expect, it } from 'vitest';

import {
  computePercentDeviation,
  computeValueDeviationBrl,
  countClassesAboveTarget,
  countClassesBelowTarget,
  deviationTone,
  formatSignedBrl,
  formatSignedPercent
} from './formatRebalanceDeviation';

describe('formatRebalanceDeviation', () => {
  it('computes signed percent deviation', () => {
    expect(computePercentDeviation(24.2, 30)).toBeCloseTo(-5.8, 4);
    expect(formatSignedPercent(-5.8)).toBe('−5,80%');
    expect(formatSignedPercent(2.5)).toBe('+2,50%');
    expect(formatSignedPercent(0)).toBe('0,00%');
  });

  it('computes signed value deviation in BRL', () => {
    expect(computeValueDeviationBrl(26_651, 23_690)).toBeCloseTo(2_961, 2);
    expect(formatSignedBrl(2_961)).toMatch(/\+R\$\s*2\.961,00/);
    expect(formatSignedBrl(-6_871)).toMatch(/−R\$\s*6\.871,00/);
  });

  it('returns tone classes for positive and negative deviation', () => {
    expect(deviationTone(2)).toBe('text-success');
    expect(deviationTone(-2)).toBe('text-error');
    expect(deviationTone(0)).toBe('');
  });

  it('counts classes above and below target', () => {
    const classes = [
      { current_percent: 24, target_percent: 30 },
      { current_percent: 22, target_percent: 20 },
      { current_percent: 40, target_percent: 40 },
      { current_percent: 5, target_percent: 5 }
    ];
    expect(countClassesBelowTarget(classes)).toBe(1);
    expect(countClassesAboveTarget(classes)).toBe(1);
  });
});
