export type BudgetIncomeCopyDiffItem = {
  label: string;
  amount_brl: number;
  recurring: boolean;
};

export type BudgetIncomeCopyDiff = {
  previousYearMonth: string;
  entering: BudgetIncomeCopyDiffItem[];
  leaving: BudgetIncomeCopyDiffItem[];
  unchanged: BudgetIncomeCopyDiffItem[];
  hasChanges: boolean;
};

type IncomeLike = {
  label: string;
  amount_brl: number;
  recurring?: boolean;
};

function toDiffItem(item: IncomeLike): BudgetIncomeCopyDiffItem {
  return {
    label: item.label.trim(),
    amount_brl: item.amount_brl,
    recurring: Boolean(item.recurring)
  };
}

function sameIncome(left: BudgetIncomeCopyDiffItem, right: BudgetIncomeCopyDiffItem): boolean {
  return (
    left.label.toLowerCase() === right.label.toLowerCase() &&
    left.amount_brl === right.amount_brl &&
    left.recurring === right.recurring
  );
}

/** Diff da substituição total das rendas do mês atual pelas do mês anterior. */
export function buildIncomeCopyDiff(
  current: IncomeLike[],
  previous: IncomeLike[],
  previousYearMonth: string
): BudgetIncomeCopyDiff {
  const remainingPrev = previous.map(toDiffItem);
  const entering: BudgetIncomeCopyDiffItem[] = [];
  const leaving: BudgetIncomeCopyDiffItem[] = [];
  const unchanged: BudgetIncomeCopyDiffItem[] = [];

  for (const cur of current.map(toDiffItem)) {
    const idx = remainingPrev.findIndex((prev) => sameIncome(prev, cur));
    if (idx >= 0) {
      unchanged.push(cur);
      remainingPrev.splice(idx, 1);
    } else {
      leaving.push(cur);
    }
  }
  entering.push(...remainingPrev);

  return {
    previousYearMonth,
    entering,
    leaving,
    unchanged,
    hasChanges: entering.length > 0 || leaving.length > 0
  };
}
