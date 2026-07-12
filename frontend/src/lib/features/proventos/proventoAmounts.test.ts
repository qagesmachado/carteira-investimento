import { describe, expect, it } from 'vitest';

import {
  computeNetAmount,
  normalizeProventoAmounts,
  resolveGrossAmount,
  resolveTaxWithheld
} from './proventoAmounts';

describe('proventoAmounts', () => {
  it('resolveGrossAmount usa gross_amount quando presente', () => {
    expect(resolveGrossAmount({ amount: 0.27, gross_amount: 0.39 })).toBe(0.39);
  });

  it('resolveGrossAmount usa amount quando gross_amount ausente', () => {
    expect(resolveGrossAmount({ amount: 120.5 })).toBe(120.5);
  });

  it('resolveTaxWithheld retorna zero quando ausente', () => {
    expect(resolveTaxWithheld({ amount: 10 })).toBe(0);
  });

  it('computeNetAmount subtrai imposto retido', () => {
    expect(computeNetAmount(0.39, 0.12)).toBeCloseTo(0.27, 5);
  });

  it('normalizeProventoAmounts monta payload coerente', () => {
    expect(normalizeProventoAmounts(0.39, 0.12)).toEqual({
      gross_amount: 0.39,
      tax_withheld: 0.12,
      amount: 0.27
    });
  });
});
