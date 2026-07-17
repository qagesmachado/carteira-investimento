import { describe, expect, it } from 'vitest';

import {
  computePensionContributionMetrics,
  monthsRemainingInYear
} from './computePensionContributionMetrics';

describe('computePensionContributionMetrics', () => {
  const ref = new Date(2026, 4, 28);

  it('calculates 12% target from income', () => {
    const metrics = computePensionContributionMetrics(2026, 120_000, 0, ref);
    expect(metrics.targetAnnualBrl).toBe(14_400);
  });

  it('calculates remaining and monthly needed', () => {
    const metrics = computePensionContributionMetrics(2026, 120_000, 6_000, ref);
    expect(metrics.remainingBrl).toBe(8_400);
    expect(metrics.monthsRemaining).toBe(8);
    expect(metrics.monthlyNeededBrl).toBe(1_050);
  });

  it('caps progress at 100%', () => {
    const metrics = computePensionContributionMetrics(2026, 120_000, 15_000, ref);
    expect(metrics.remainingBrl).toBe(0);
    expect(metrics.progressPercent).toBe(100);
    expect(metrics.targetReached).toBe(true);
  });

  it('returns zero months for past year', () => {
    expect(monthsRemainingInYear(2025, ref)).toBe(0);
    const metrics = computePensionContributionMetrics(2025, 120_000, 6_000, ref);
    expect(metrics.monthlyNeededBrl).toBeNull();
  });

  it('returns 12 months for future year', () => {
    expect(monthsRemainingInYear(2027, ref)).toBe(12);
  });

  it('julho inclui dezembro no aporte mensal (faltante ÷ meses restantes)', () => {
    const july = new Date(2026, 6, 16);
    const metrics = computePensionContributionMetrics(2026, 216_000, 12_800, july);
    expect(metrics.remainingBrl).toBe(13_120);
    expect(metrics.monthsRemaining).toBe(6);
    expect(metrics.monthlyNeededBrl).toBeCloseTo(13_120 / 6, 2);
  });

  it('aportes maiores reduzem o valor mensal necessário', () => {
    const july = new Date(2026, 6, 16);
    const low = computePensionContributionMetrics(2026, 216_000, 6_000, july);
    const high = computePensionContributionMetrics(2026, 216_000, 20_000, july);
    expect(high.remainingBrl).toBeLessThan(low.remainingBrl);
    expect(high.monthlyNeededBrl!).toBeLessThan(low.monthlyNeededBrl!);
  });
});
