import type { AnalysisMethodology, AnalysisProfileSlug } from '$lib/api/analysis';
import {
  PROFILE_CRYPTO,
  PROFILE_ETF_INTL,
  PROFILE_FII_BR,
  PROFILE_STOCK_BR
} from '$lib/api/analysis';

export type AnalysisMethodologyOption = {
  methodology: AnalysisMethodology;
  title: string;
  description: string;
  available: boolean;
  unavailableHint?: string;
};

const SIMPLES_OPTION: Omit<AnalysisMethodologyOption, 'methodology'> = {
  title: 'Simples',
  description: 'Defina o percentual desejado de cada ativo no grupo (soma 100%) e um link opcional.',
  available: true
};

const AUVP_OPTION: Omit<AnalysisMethodologyOption, 'methodology'> = {
  title: 'AUVP',
  description:
    'Classificação fundamental, diagrama e coluna Soma para distribuir a meta entre os ativos.',
  available: true
};

const AUVP_UNAVAILABLE_HINT = 'Em breve para esta área.';

export const ANALYSIS_METHODOLOGY_OPTIONS: Record<
  AnalysisProfileSlug,
  AnalysisMethodologyOption[]
> = {
  'stock-br': [
    { methodology: 'simples', ...SIMPLES_OPTION },
    { methodology: 'auvp', ...AUVP_OPTION }
  ],
  'fii-br': [
    { methodology: 'simples', ...SIMPLES_OPTION },
    { methodology: 'auvp', ...AUVP_OPTION }
  ],
  'etf-intl': [
    { methodology: 'simples', ...SIMPLES_OPTION },
    {
      methodology: 'auvp',
      ...AUVP_OPTION,
      available: false,
      unavailableHint: AUVP_UNAVAILABLE_HINT
    }
  ],
  crypto: [
    { methodology: 'simples', ...SIMPLES_OPTION },
    {
      methodology: 'auvp',
      ...AUVP_OPTION,
      available: false,
      unavailableHint: AUVP_UNAVAILABLE_HINT
    }
  ]
};

export const LEGACY_DEFAULT_METHODOLOGY: Record<string, AnalysisMethodology> = {
  [PROFILE_STOCK_BR]: 'auvp',
  [PROFILE_FII_BR]: 'auvp',
  [PROFILE_ETF_INTL]: 'simples',
  [PROFILE_CRYPTO]: 'simples'
};

export function methodologyLabel(methodology: AnalysisMethodology): string {
  return methodology === 'auvp' ? 'AUVP' : 'Simples';
}

export function methodologyConfirmMessage(
  current: AnalysisMethodology,
  next: AnalysisMethodology,
  profileSlug: AnalysisProfileSlug
): string {
  if (current === next) {
    return '';
  }
  const nextOption = ANALYSIS_METHODOLOGY_OPTIONS[profileSlug].find(
    (option) => option.methodology === next
  );
  if (!nextOption) {
    return 'Alterar a metodologia de análise?';
  }
  return `Alterar para «${nextOption.title}»?\n\n${nextOption.description}\n\nOs dados da metodologia anterior permanecem salvos.`;
}
