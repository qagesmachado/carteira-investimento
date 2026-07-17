export type ClassRowForAllocation = {
  display_class: string;
  current_value_brl: number;
  target_percent: number;
};

export type ClassAllocationRow = {
  display_class: string;
  idealTargetBrl: number;
  suggestedContributionBrl: number;
  included: boolean;
};

export type ClassInvestmentPlan = {
  finalPatrimonyBrl: number;
  rows: ClassAllocationRow[];
  totalSuggestedContributionBrl: number;
};

export type AssetRowForAllocation = {
  asset_id: number;
  current_value_brl: number | null;
  target_value_brl: number | null;
  gap_brl: number | null;
};

export type AssetAllocationRow = {
  idealTargetBrl: number | null;
  suggestedContributionBrl: number | null;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function computeIdealTarget(currentPatrimonyBrl: number, targetPercent: number, finalPatrimonyBrl: number): number {
  return roundMoney((finalPatrimonyBrl * targetPercent) / 100);
}

function computeIdealGap(currentValueBrl: number, idealTargetBrl: number): number {
  return Math.max(0, roundMoney(idealTargetBrl - currentValueBrl));
}

function computeAssetIdealGap(
  currentValueBrl: number | null,
  targetValueBrl: number | null | undefined,
  currentPatrimonyBrl: number,
  finalPatrimonyBrl: number
): number {
  if (
    targetValueBrl == null ||
    !Number.isFinite(targetValueBrl) ||
    !Number.isFinite(currentPatrimonyBrl) ||
    currentPatrimonyBrl <= 0
  ) {
    return 0;
  }
  const scaledTarget = targetValueBrl * (finalPatrimonyBrl / currentPatrimonyBrl);
  const effectiveCurrent = currentValueBrl ?? 0;
  return computeIdealGap(effectiveCurrent, scaledTarget);
}

function computeAssetIdealTarget(
  targetValueBrl: number | null | undefined,
  currentPatrimonyBrl: number,
  finalPatrimonyBrl: number
): number | null {
  if (
    targetValueBrl == null ||
    !Number.isFinite(targetValueBrl) ||
    !Number.isFinite(currentPatrimonyBrl) ||
    currentPatrimonyBrl <= 0
  ) {
    return null;
  }
  return roundMoney(targetValueBrl * (finalPatrimonyBrl / currentPatrimonyBrl));
}

export function defaultIncludedClasses(classes: ClassRowForAllocation[]): Record<string, boolean> {
  return Object.fromEntries(classes.map((row) => [row.display_class, true]));
}

function distributeByWeights(
  amount: number,
  weights: { key: string; weight: number }[]
): Map<string, number> {
  const positive = weights.filter((item) => item.weight > 0);
  const totalWeight = positive.reduce((sum, item) => sum + item.weight, 0);
  const result = new Map<string, number>();

  if (totalWeight <= 0 || amount <= 0) {
    for (const item of weights) {
      result.set(item.key, 0);
    }
    return result;
  }

  let allocated = 0;
  for (let index = 0; index < positive.length; index++) {
    const item = positive[index];
    const isLast = index === positive.length - 1;
    const share = isLast
      ? roundMoney(amount - allocated)
      : roundMoney((amount * item.weight) / totalWeight);
    result.set(item.key, share);
    allocated = roundMoney(allocated + share);
  }

  for (const item of weights) {
    if (!result.has(item.key)) {
      result.set(item.key, 0);
    }
  }

  return result;
}

export function computeClassInvestmentAllocation(
  classes: ClassRowForAllocation[],
  currentPatrimonyBrl: number,
  investmentAmount: number,
  included: Record<string, boolean>
): ClassInvestmentPlan | null {
  if (
    !Number.isFinite(investmentAmount) ||
    investmentAmount <= 0 ||
    !Number.isFinite(currentPatrimonyBrl) ||
    currentPatrimonyBrl < 0
  ) {
    return null;
  }

  const includedClasses = classes.filter((row) => included[row.display_class] === true);
  if (includedClasses.length === 0) {
    return null;
  }

  const finalPatrimonyBrl = roundMoney(currentPatrimonyBrl + investmentAmount);

  const classMetrics = classes.map((row) => {
    const idealTargetBrl = computeIdealTarget(currentPatrimonyBrl, row.target_percent, finalPatrimonyBrl);
    const idealGapBrl = computeIdealGap(row.current_value_brl, idealTargetBrl);
    return {
      ...row,
      idealTargetBrl,
      idealGapBrl,
      included: included[row.display_class] === true
    };
  });

  const excludedPool = classMetrics
    .filter((row) => !row.included)
    .reduce((sum, row) => sum + row.idealGapBrl, 0);

  const includedWithGap = classMetrics.filter((row) => row.included && row.idealGapBrl > 0);
  const includedGapSum = includedWithGap.reduce((sum, row) => sum + row.idealGapBrl, 0);

  let contributionWeights: { key: string; weight: number }[];

  if (includedGapSum > 0) {
    contributionWeights = classMetrics.map((row) => {
      if (!row.included) {
        return { key: row.display_class, weight: 0 };
      }
      const boostedGap = roundMoney(
        row.idealGapBrl + excludedPool * (row.idealGapBrl / includedGapSum)
      );
      return { key: row.display_class, weight: boostedGap };
    });
  } else {
    const targetSum = includedClasses.reduce((sum, row) => sum + row.target_percent, 0);
    contributionWeights = classMetrics.map((row) => ({
      key: row.display_class,
      weight: row.included && targetSum > 0 ? row.target_percent / targetSum : 0
    }));
  }

  const contributions = distributeByWeights(investmentAmount, contributionWeights);

  const rows: ClassAllocationRow[] = classMetrics.map((row) => ({
    display_class: row.display_class,
    idealTargetBrl: row.idealTargetBrl,
    suggestedContributionBrl: row.included ? (contributions.get(row.display_class) ?? 0) : 0,
    included: row.included
  }));

  const totalSuggestedContributionBrl = roundMoney(
    rows.reduce((sum, row) => sum + row.suggestedContributionBrl, 0)
  );

  return {
    finalPatrimonyBrl,
    rows,
    totalSuggestedContributionBrl
  };
}

export function computeAssetInvestmentAllocation(
  assets: AssetRowForAllocation[],
  classContributionBrl: number | null | undefined,
  currentPatrimonyBrl: number,
  finalPatrimonyBrl: number
): Map<number, AssetAllocationRow> | null {
  if (
    classContributionBrl == null ||
    !Number.isFinite(classContributionBrl) ||
    classContributionBrl <= 0 ||
    !Number.isFinite(currentPatrimonyBrl) ||
    currentPatrimonyBrl <= 0 ||
    !Number.isFinite(finalPatrimonyBrl) ||
    finalPatrimonyBrl <= 0
  ) {
    return null;
  }

  const metrics = assets.map((asset) => ({
    asset_id: asset.asset_id,
    idealTargetBrl: computeAssetIdealTarget(
      asset.target_value_brl,
      currentPatrimonyBrl,
      finalPatrimonyBrl
    ),
    idealGapBrl: computeAssetIdealGap(
      asset.current_value_brl,
      asset.target_value_brl,
      currentPatrimonyBrl,
      finalPatrimonyBrl
    )
  }));

  const gapSum = metrics.reduce((sum, row) => sum + row.idealGapBrl, 0);
  const weights = metrics.map((row) => ({
    key: String(row.asset_id),
    weight: gapSum > 0 ? row.idealGapBrl : row.idealTargetBrl ?? 0
  }));
  const contributions = distributeByWeights(classContributionBrl, weights);

  const result = new Map<number, AssetAllocationRow>();
  for (const row of metrics) {
    const suggestedContributionBrl = contributions.get(String(row.asset_id)) ?? 0;
    result.set(row.asset_id, {
      idealTargetBrl: row.idealTargetBrl,
      suggestedContributionBrl: row.idealTargetBrl == null ? null : suggestedContributionBrl
    });
  }

  return result;
}

export function getClassContributionFromPlan(
  plan: ClassInvestmentPlan | null,
  displayClass: string
): number | null {
  if (plan == null) {
    return null;
  }
  const row = plan.rows.find((item) => item.display_class === displayClass);
  if (row == null || !row.included) {
    return null;
  }
  return row.suggestedContributionBrl;
}

export const ASSET_GROUP_TO_DISPLAY_CLASS: Record<string, string> = {
  stocks: 'stocks',
  international: 'international',
  funds: 'funds',
  crypto: 'crypto'
};

export type SimulationMode = 'final_total' | 'invest_amount';

export function resolveInvestmentAmount(
  mode: SimulationMode,
  inputBrl: number,
  currentPatrimonyBrl: number
): number {
  if (!Number.isFinite(inputBrl) || inputBrl <= 0) {
    return 0;
  }
  if (mode === 'final_total') {
    if (!Number.isFinite(currentPatrimonyBrl) || currentPatrimonyBrl < 0) {
      return 0;
    }
    return Math.max(0, Math.round((inputBrl - currentPatrimonyBrl) * 100) / 100);
  }
  return inputBrl;
}
