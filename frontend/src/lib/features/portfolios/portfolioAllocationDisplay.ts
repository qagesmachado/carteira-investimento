import {
  INVESTOR_PROFILES,
  type InvestorProfileId
} from '$lib/features/portfolios/portfolioInvestorProfiles';
import {
  CLASS_TARGET_FIELDS,
  parseAllocationTargets,
  type AllocationTargets,
  type ClassTargets
} from '$lib/features/rebalance/allocationTargets';

export type PortfolioAllocationClassRow = {
  key: keyof ClassTargets;
  label: string;
  percent: string;
  value: number;
};

export type PortfolioSuggestedAllocation = {
  profileId: InvestorProfileId | 'custom';
  profileLabel: string;
  classRows: PortfolioAllocationClassRow[];
  stocksSplitLabel: string;
  hasStoredTargets: boolean;
};

function classesMatch(a: ClassTargets, b: ClassTargets): boolean {
  return CLASS_TARGET_FIELDS.every(({ key }) => a[key] === b[key]);
}

export function inferInvestorProfileId(targets: AllocationTargets): InvestorProfileId | 'custom' {
  const match = INVESTOR_PROFILES.find((profile) =>
    classesMatch(profile.targets.classes, targets.classes)
  );
  return match?.id ?? 'custom';
}

export function formatAllocationPercentCompact(value: number): string {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  })}%`;
}

export function buildPortfolioAllocationClassRows(
  targets: AllocationTargets
): PortfolioAllocationClassRow[] {
  return CLASS_TARGET_FIELDS.map(({ key, label }) => ({
    key,
    label,
    value: targets.classes[key],
    percent: formatAllocationPercentCompact(targets.classes[key])
  }));
}

export function formatStocksSplitLabel(targets: AllocationTargets): string {
  if (targets.stocks_split_mode === 'unified') {
    return 'Ações/ETF BR: conjunto único (Soma entre todos os tickers)';
  }
  const { etf, stock } = targets.stocks_split;
  return `ETF/Ação (BR): ${formatAllocationPercentCompact(etf)} / ${formatAllocationPercentCompact(stock)}`;
}

export function resolveSuggestedAllocation(options: {
  allocationTargetsJson: string | null | undefined;
}): PortfolioSuggestedAllocation {
  const hasStoredTargets = Boolean(options.allocationTargetsJson?.trim());
  const targets = parseAllocationTargets(options.allocationTargetsJson);
  const profileId = inferInvestorProfileId(targets);
  const profileLabel =
    profileId === 'custom'
      ? 'Personalizado'
      : (INVESTOR_PROFILES.find((profile) => profile.id === profileId)?.label ?? 'Personalizado');

  return {
    profileId,
    profileLabel,
    classRows: buildPortfolioAllocationClassRows(targets),
    stocksSplitLabel: formatStocksSplitLabel(targets),
    hasStoredTargets
  };
}
