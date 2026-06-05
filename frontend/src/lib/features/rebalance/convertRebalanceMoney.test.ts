import { describe, expect, it } from 'vitest';

import { brlToUsd } from './convertRebalanceMoney';

describe('brlToUsd', () => {
  it('converte BRL para USD com taxa válida', () => {
    expect(brlToUsd(5000, 5)).toBe(1000);
    expect(brlToUsd(4047.2, 5.05)).toBeCloseTo(801.43, 2);
  });

  it('retorna null sem taxa ou valor inválido', () => {
    expect(brlToUsd(null, 5)).toBeNull();
    expect(brlToUsd(100, null)).toBeNull();
    expect(brlToUsd(100, 0)).toBeNull();
  });
});
