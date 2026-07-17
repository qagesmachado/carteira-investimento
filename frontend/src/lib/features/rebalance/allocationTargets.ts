import { HIDDEN_MONEY_BRL, isMoneyHidden } from '$lib/moneyDisplay';

export type StocksSplitMode = 'by_subtype' | 'unified';

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
  stocks_split_mode: StocksSplitMode;
};

export const DEFAULT_CLASS_TARGETS: ClassTargets = {
  stocks: 20,
  funds: 7,
  international: 15,
  fixed_income: 55,
  crypto: 3
};

/** Split padrão apenas na criação de carteira / JSON vazio (via defaultAllocationTargets e parse). */
export const DEFAULT_STOCKS_SPLIT: StocksSplitTargets = {
  etf: 50,
  stock: 50
};

export const DEFAULT_STOCKS_SPLIT_MODE: StocksSplitMode = 'unified';

export const STOCKS_SPLIT_MODE_OPTIONS: {
  mode: StocksSplitMode;
  title: string;
  description: string;
}[] = [
  {
    mode: 'by_subtype',
    title: 'Por subtipo (ETF e Ação)',
    description:
      'Define metas separadas para ETF e Ação dentro de Ações/ETF BR. A % desejada de cada ticker usa a Soma do seu subtipo.'
  },
  {
    mode: 'unified',
    title: 'Conjunto único',
    description:
      'ETF e Ação compartilham os mesmos 100% da meta Ações/ETF BR. A % desejada é distribuída pela Soma entre todos os tickers da aba.'
  }
];

export const CLASS_TARGET_FIELDS: { key: keyof ClassTargets; label: string }[] = [
  { key: 'stocks', label: 'Ações/ETF BR' },
  { key: 'funds', label: 'Fundos' },
  { key: 'international', label: 'Internacional' },
  { key: 'fixed_income', label: 'Renda fixa' },
  { key: 'crypto', label: 'Criptomoeda' }
];

export function defaultAllocationTargets(): AllocationTargets {
  return cloneAllocationTargets({
    classes: { ...DEFAULT_CLASS_TARGETS },
    stocks_split: { ...DEFAULT_STOCKS_SPLIT },
    stocks_split_mode: DEFAULT_STOCKS_SPLIT_MODE
  });
}

export function cloneAllocationTargets(targets: AllocationTargets): AllocationTargets {
  return {
    classes: { ...targets.classes },
    stocks_split: { ...targets.stocks_split },
    stocks_split_mode: targets.stocks_split_mode
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
      stocks_split: { ...DEFAULT_STOCKS_SPLIT, ...data.stocks_split },
      stocks_split_mode: data.stocks_split_mode ?? 'by_subtype'
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
  if (targets.stocks_split_mode === 'by_subtype') {
    const splitSum = targets.stocks_split.etf + targets.stocks_split.stock;
    if (Math.abs(splitSum - 100) > 0.01) {
      return `A relação ETF/Ação deve somar 100% (atual: ${splitSum.toFixed(2)}%).`;
    }
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