import {
  DEFAULT_STOCKS_SPLIT,
  DEFAULT_STOCKS_SPLIT_MODE,
  serializeAllocationTargets,
  type AllocationTargets,
  type ClassTargets
} from '$lib/features/rebalance/allocationTargets';

export type InvestorProfileId = 'conservative' | 'moderate' | 'bold' | 'custom';

export type InvestorProfile = {
  id: InvestorProfileId;
  label: string;
  description: string;
  targets: AllocationTargets;
};

const CONSERVATIVE_CLASS_TARGETS: ClassTargets = {
  stocks: 8,
  funds: 5,
  international: 5,
  fixed_income: 80,
  crypto: 2
};

const MODERATE_CLASS_TARGETS: ClassTargets = {
  stocks: 20,
  funds: 7,
  international: 15,
  fixed_income: 55,
  crypto: 3
};

const BOLD_CLASS_TARGETS: ClassTargets = {
  stocks: 25,
  funds: 10,
  international: 30,
  fixed_income: 30,
  crypto: 5
};

export const INVESTOR_PROFILES: InvestorProfile[] = [
  {
    id: 'conservative',
    label: 'Conservador',
    description: 'Prioriza renda fixa e preservação de capital.',
    targets: {
      classes: { ...CONSERVATIVE_CLASS_TARGETS },
      stocks_split: { ...DEFAULT_STOCKS_SPLIT },
      stocks_split_mode: DEFAULT_STOCKS_SPLIT_MODE
    }
  },
  {
    id: 'moderate',
    label: 'Moderado',
    description: 'Equilíbrio entre crescimento e estabilidade.',
    targets: {
      classes: { ...MODERATE_CLASS_TARGETS },
      stocks_split: { ...DEFAULT_STOCKS_SPLIT },
      stocks_split_mode: DEFAULT_STOCKS_SPLIT_MODE
    }
  },
  {
    id: 'bold',
    label: 'Arrojado',
    description: 'Maior exposição a ações, internacional e cripto.',
    targets: {
      classes: { ...BOLD_CLASS_TARGETS },
      stocks_split: { ...DEFAULT_STOCKS_SPLIT },
      stocks_split_mode: DEFAULT_STOCKS_SPLIT_MODE
    }
  },
  {
    id: 'custom',
    label: 'Personalizado',
    description: 'Defina as metas por classe abaixo.',
    targets: {
      classes: { ...MODERATE_CLASS_TARGETS },
      stocks_split: { ...DEFAULT_STOCKS_SPLIT },
      stocks_split_mode: DEFAULT_STOCKS_SPLIT_MODE
    }
  }
];

export type PresetInvestorProfileId = Exclude<InvestorProfileId, 'custom'>;

export const PRESET_INVESTOR_PROFILES = INVESTOR_PROFILES.filter(
  (profile): profile is InvestorProfile & { id: PresetInvestorProfileId } => profile.id !== 'custom'
);

export function getInvestorProfile(id: InvestorProfileId): InvestorProfile {
  return INVESTOR_PROFILES.find((profile) => profile.id === id) ?? INVESTOR_PROFILES[1];
}

export function allocationTargetsJsonForProfile(id: InvestorProfileId): string {
  return serializeAllocationTargets(getInvestorProfile(id).targets);
}
