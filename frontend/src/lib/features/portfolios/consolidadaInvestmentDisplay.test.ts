import { describe, expect, it } from 'vitest';

import {
  computeInvestmentShare,
  scalePositionAmount
} from './consolidadaInvestmentDisplay';

describe('consolidadaInvestmentDisplay', () => {
  it('retorna 1 quando filtro desligado', () => {
    expect(computeInvestmentShare(false, 24_884.4, 19_651.2)).toBe(1);
  });

  it('calcula fração investível com filtro ativo', () => {
    expect(computeInvestmentShare(true, 24_884.4, 19_651.2)).toBeCloseTo(19_651.2 / 24_884.4, 6);
  });

  it('retorna 0 quando não há parte investível', () => {
    expect(computeInvestmentShare(true, 10_000, 0)).toBe(0);
  });

  it('escala valor nativo pela fração', () => {
    const share = 19_651.2 / 24_884.4;
    expect(scalePositionAmount(24_884.4, share)).toBeCloseTo(19_651.2, 2);
  });
});
