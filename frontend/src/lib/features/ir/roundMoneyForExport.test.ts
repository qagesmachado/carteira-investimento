import { describe, expect, it } from 'vitest';

import { roundMoneyForExport } from './roundMoneyForExport';

describe('roundMoneyForExport', () => {
  it('arredonda artefatos de float para 2 casas', () => {
    expect(roundMoneyForExport(38.17999999999999)).toBe(38.18);
    expect(roundMoneyForExport(52.800000000000004)).toBe(52.8);
    expect(roundMoneyForExport(33.599999999999994)).toBe(33.6);
  });

  it('mantém zero e valores já exatos', () => {
    expect(roundMoneyForExport(0)).toBe(0);
    expect(roundMoneyForExport(12.51)).toBe(12.51);
  });
});
