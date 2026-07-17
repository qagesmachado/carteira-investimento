import { describe, expect, it } from 'vitest';

import {
  buildCombinedScoreEquation,
  buildRebalanceMethodologyHint,
  fundamentalTermsForProfile
} from './analysisScoreEquation';

describe('analysisScoreEquation', () => {
  const settings = {
    use_fundamental: true,
    use_diagram: true,
    label: 'Soma',
    diagram_multiplier: 2,
    viabilidade_weights: { azulim: 10, viavel: 3, atencao: -5, bomba: -10 }
  };

  it('descreve termos fundamentalistas por perfil', () => {
    expect(fundamentalTermsForProfile('stock_br')).toContain('Lucros');
    expect(fundamentalTermsForProfile('fii_br')).toContain('Vacância');
  });

  it('monta equação explícita da Soma', () => {
    expect(buildCombinedScoreEquation('stock_br', settings)).toContain('Soma = Fundamental + (Diagrama × 2)');
  });

  it('indica qual coluna alimenta o rebalanceamento', () => {
    expect(buildRebalanceMethodologyHint({ ...settings, use_diagram: false })).toContain('Fundamental');
    expect(buildRebalanceMethodologyHint({ ...settings, use_fundamental: false })).toContain('Diagrama');
    expect(buildRebalanceMethodologyHint({ ...settings, use_fundamental: false })).toContain('oculta');
  });
});
