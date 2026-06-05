import { HIDDEN_MONEY_BRL, isMoneyHidden } from '$lib/moneyDisplay';

export type ClassTargets = {
  stocks: number;
  funds: number;
  international: number;
  fixed_income: number;
  crypto: number;
};
export type StocksSplitTargets = {
  etf: number;
  stock: number;
};

export type AllocationTargets = {
  classes: ClassTargets;
  stocks_split: StocksSplitTargets;
};

export const DEFAULT_CLASS_TARGETS: ClassTargets = {
  stocks: 30,
  funds: 5,
  international: 20,
  fixed_income: 40,
  crypto: 5
};

export const DEFAULT_STOCKS_SPLIT: StocksSplitTargets = {
  etf: 70,
  stock: 30
};

export const CLASS_TARGET_FIELDS: { key: keyof ClassTargets; label: string }[] = [
  { key: 'stocks', label: 'Ações/ETF BR' },
  { key: 'funds', label: 'Fundos' },
  { key: 'international', label: 'Internacional' },
  { key: 'fixed_income', label: 'Renda fixa' },
  { key: 'crypto', label: 'Bitcoin' }
];

export function defaultAllocationTargets(): AllocationTargets {
  return {
    classes: { ...DEFAULT_CLASS_TARGETS },
    stocks_split: { ...DEFAULT_STOCKS_SPLIT }
  };
}

export function parseAllocationTargets(raw: string | null | undefined): AllocationTargets {
  if (!raw?.trim()) {
    return defaultAllocationTargets();
  }
  try {
    const data = JSON.parse(raw) as Partial<AllocationTargets>;
    return {
      classes: { ...DEFAULT_CLASS_TARGETS, ...data.classes },
      stocks_split: { ...DEFAULT_STOCKS_SPLIT, ...data.stocks_split }
    };
  } catch {
    return defaultAllocationTargets();
  }
}

export function serializeAllocationTargets(targets: AllocationTargets): string {
  return JSON.stringify(targets);
}

export function validateAllocationTargets(targets: AllocationTargets): string | null {
  const classSum =
    targets.classes.stocks +
    targets.classes.funds +
    targets.classes.international +
    targets.classes.fixed_income +
    targets.classes.crypto;
  if (Math.abs(classSum - 100) > 0.01) {
    return `As metas por classe devem somar 100% (atual: ${classSum.toFixed(2)}%).`;
  }
  const splitSum = targets.stocks_split.etf + targets.stocks_split.stock;
  if (Math.abs(splitSum - 100) > 0.01) {
    return `A relação ETF/Ação deve somar 100% (atual: ${splitSum.toFixed(2)}%).`;
  }
  return null;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

export function formatBrl(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  if (isMoneyHidden()) {
    return HIDDEN_MONEY_BRL;
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}