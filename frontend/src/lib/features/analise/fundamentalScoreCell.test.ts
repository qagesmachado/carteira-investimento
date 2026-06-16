import { afterEach, describe, expect, it } from 'vitest';

import { HIDDEN_SCORE_MASK } from '$lib/moneyDisplay';
import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import { formatFundamentalScoreValue, fundamentalScoreColorClass } from './fundamentalScoreCell';

describe('fundamentalScoreColorClass', () => {
  afterEach(() => {
    setHideMoneyValues(false);
  });

  it('mapeia pesos 5/3/2/1 para success, warning, error e neutral', () => {
    expect(fundamentalScoreColorClass(5)).toContain('success');
    expect(fundamentalScoreColorClass(3)).toContain('warning');
    expect(fundamentalScoreColorClass(2)).toContain('error');
    expect(fundamentalScoreColorClass(1)).toContain('neutral');
  });

  it('usa estilo neutro quando ocultar valores está ativo', () => {
    setHideMoneyValues(true);
    expect(fundamentalScoreColorClass(5)).toContain('base-300');
    expect(fundamentalScoreColorClass(2)).toContain('base-300');
  });
});

describe('formatFundamentalScoreValue', () => {
  afterEach(() => {
    setHideMoneyValues(false);
  });

  it('mascara pontuação quando ocultar valores está ativo', () => {
    setHideMoneyValues(true);
    expect(formatFundamentalScoreValue(5)).toBe(HIDDEN_SCORE_MASK);
  });

  it('mantém valor visível quando ocultar valores está inativo', () => {
    expect(formatFundamentalScoreValue(5)).toBe('5');
    expect(formatFundamentalScoreValue(null)).toBe('—');
  });
});
