import { afterEach, describe, expect, it } from 'vitest';

import { HIDDEN_SCORE_MASK } from '$lib/moneyDisplay';
import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import {
  formatDiagramScore,
  formatDiagramScoreForDisplay,
  formatTableSumForDisplay,
  formatViabilityLabelForDisplay,
  viabilityBadgeClass
} from './viabilityBadge';

describe('viabilityBadge display masking', () => {
  afterEach(() => {
    setHideMoneyValues(false);
  });

  it('mascara diagrama, soma e viabilidade na tabela quando ocultar valores está ativo', () => {
    setHideMoneyValues(true);
    expect(formatDiagramScoreForDisplay(11)).toBe(HIDDEN_SCORE_MASK);
    expect(formatTableSumForDisplay(52)).toBe(HIDDEN_SCORE_MASK);
    expect(formatViabilityLabelForDisplay('2 - VIÁVEL')).toBe(HIDDEN_SCORE_MASK);
    expect(viabilityBadgeClass('viavel')).toBe('badge-ghost');
  });

  it('mantém formatadores de edição sem máscara', () => {
    setHideMoneyValues(true);
    expect(formatDiagramScore(11)).toBe('+11');
  });

  it('exibe valores normalmente quando ocultar valores está inativo', () => {
    expect(formatDiagramScoreForDisplay(11)).toBe('+11');
    expect(formatTableSumForDisplay(52)).toBe('52');
    expect(formatViabilityLabelForDisplay('2 - VIÁVEL')).toBe('2 - VIÁVEL');
    expect(viabilityBadgeClass('viavel')).toContain('success');
  });
});
