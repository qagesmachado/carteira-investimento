import type { TableSumColumnSettings } from '$lib/api/analysis';

import { PROFILE_FII_BR } from './computeAnalysis';

const FUNDAMENTAL_TERMS_STOCK =
  'Lucros + Dívida + Tag along + Segmento + peso da Viabilidade';
const FUNDAMENTAL_TERMS_FII =
  'Vacância + Qtd Ativos + Alavancagem + Segmento + peso da Viabilidade';

export function fundamentalTermsForProfile(profile: 'stock_br' | 'fii_br'): string {
  return profile === PROFILE_FII_BR ? FUNDAMENTAL_TERMS_FII : FUNDAMENTAL_TERMS_STOCK;
}

export function buildCombinedScoreEquation(
  profile: 'stock_br' | 'fii_br',
  settings: TableSumColumnSettings
): string {
  const fundamental = fundamentalTermsForProfile(profile);
  const multiplier = settings.diagram_multiplier;
  return `Soma = Fundamental + (Diagrama × ${multiplier})\nFundamental = ${fundamental}\nDiagrama = soma das respostas do diagrama (+1 / −1)`;
}

export function buildSomaDescription(settings: TableSumColumnSettings): string {
  if (settings.use_fundamental && settings.use_diagram) {
    return `Fundamental + (Diagrama × ${settings.diagram_multiplier})`;
  }
  if (settings.use_fundamental) {
    return 'igual à coluna Fundamental';
  }
  return 'igual à coluna Diagrama';
}

export function buildRebalanceMethodologyHint(settings: TableSumColumnSettings): string {
  if (settings.use_fundamental && settings.use_diagram) {
    return 'Rebalanceamento e coluna Soma usam Fundamental + Diagrama ponderado.';
  }
  if (settings.use_fundamental) {
    return 'Rebalanceamento e coluna Soma usam apenas Fundamental. A coluna Diagrama fica oculta.';
  }
  return 'Rebalanceamento e coluna Soma usam apenas Diagrama. A coluna Fundamental fica oculta.';
}
