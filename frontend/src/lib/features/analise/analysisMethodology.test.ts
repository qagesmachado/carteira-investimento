import { describe, expect, it } from 'vitest';

import {
  ANALYSIS_METHODOLOGY_OPTIONS,
  methodologyConfirmMessage,
  methodologyLabel
} from './analysisMethodology';

describe('analysisMethodology', () => {
  it('expõe Simples e AUVP para ações', () => {
    const options = ANALYSIS_METHODOLOGY_OPTIONS['stock-br'];
    expect(options.map((option) => option.methodology)).toEqual(['simples', 'auvp']);
    expect(options.every((option) => option.available)).toBe(true);
  });

  it('mantém AUVP indisponível em internacional', () => {
    const auvp = ANALYSIS_METHODOLOGY_OPTIONS['etf-intl'].find(
      (option) => option.methodology === 'auvp'
    );
    expect(auvp?.available).toBe(false);
  });

  it('formata rótulos e mensagem de confirmação', () => {
    expect(methodologyLabel('simples')).toBe('Simples');
    expect(methodologyConfirmMessage('simples', 'auvp', 'stock-br')).toMatch(/AUVP/);
  });
});
