import { describe, expect, it } from 'vitest';

import { formatCryptoProfitAfterFees } from './cryptoFeePositionDetail';

describe('formatCryptoProfitAfterFees', () => {
  const summary = {
    profitAfterFeesBrl: -750,
    appreciationAfterFeesPercent: -12.5,
    totalFeesBrl: 22.5,
    totalFeesUsd: 4.06
  };

  it('exibe valor em USD com equivalente BRL na consolidada', () => {
    const { value, hint } = formatCryptoProfitAfterFees(summary, 'USD', 5.5, true);
    expect(value).toMatch(/US\$/);
    expect(value).toMatch(/12,50\s*%/);
    expect(hint).toMatch(/≈.*R\$/);
    expect(hint).toMatch(/Taxas pagas/);
  });

  it('exibe valor em BRL quando moeda é real', () => {
    const { value } = formatCryptoProfitAfterFees(summary, 'BRL', null, false);
    expect(value).toMatch(/R\$/);
    expect(value).not.toMatch(/US\$/);
  });

  it('exibe taxas pagas mesmo sem lucro calculável', () => {
    const { value, hint } = formatCryptoProfitAfterFees(
      { ...summary, profitAfterFeesBrl: null, appreciationAfterFeesPercent: null },
      'USD',
      5.5,
      true
    );
    expect(value).toBe('—');
    expect(hint).toMatch(/Taxas pagas/);
  });
});
