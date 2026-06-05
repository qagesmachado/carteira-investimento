export const PGBL_DEDUCTION_RATE = 0.12;

export type PensionContributionMetrics = {
  planYear: number;
  annualGrossIncomeBrl: number | null;
  contributedYtdBrl: number;
  targetAnnualBrl: number;
  remainingBrl: number;
  monthsRemaining: number;
  monthlyNeededBrl: number | null;
  progressPercent: number;
  targetReached: boolean;
};

export function monthsRemainingInYear(planYear: number, referenceDate = new Date()): number {
  const year = referenceDate.getFullYear();
  if (planYear > year) return 12;
  if (planYear < year) return 0;
  return 12 - referenceDate.getMonth();
}

export function computePensionContributionMetrics(
  planYear: number,
  annualGrossIncomeBrl: number | null,
  contributedYtdBrl: number,
  referenceDate = new Date()
): PensionContributionMetrics {
  const income = annualGrossIncomeBrl ?? 0;
  const contributed = Math.max(0, contributedYtdBrl);
  const target = income * PGBL_DEDUCTION_RATE;
  const remaining = Math.max(0, target - contributed);
  const monthsRemaining = monthsRemainingInYear(planYear, referenceDate);
  const monthlyNeededBrl = monthsRemaining > 0 ? remaining / monthsRemaining : null;
  const progressPercent = target > 0 ? Math.min(100, (contributed / target) * 100) : 0;

  return {
    planYear,
    annualGrossIncomeBrl,
    contributedYtdBrl: contributed,
    targetAnnualBrl: target,
    remainingBrl: remaining,
    monthsRemaining,
    monthlyNeededBrl,
    progressPercent,
    targetReached: target > 0 && contributed >= target
  };
}
