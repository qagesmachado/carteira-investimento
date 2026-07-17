import { describe, expect, it } from 'vitest';

import {
  analysisAreaHrefForProfile,
  analysisAreaLabelForProfile
} from './analysisProfileAreas';

describe('analysisProfileAreas', () => {
  it('resolve label e href por profile', () => {
    expect(analysisAreaLabelForProfile('stock_br')).toBe('Ações/ETF BR');
    expect(analysisAreaHrefForProfile('stock_br')).toBe('/analise/acoes-br');
    expect(analysisAreaLabelForProfile('etf_intl')).toBe('Internacional');
    expect(analysisAreaHrefForProfile('crypto')).toBe('/analise/criptomoedas');
  });
});
