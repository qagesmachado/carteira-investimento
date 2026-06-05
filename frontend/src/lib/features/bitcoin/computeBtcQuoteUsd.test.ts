import { describe, expect, it } from 'vitest';

import { computeBtcQuoteUsd } from './computeBtcQuoteUsd';

describe('computeBtcQuoteUsd', () => {
  it('divide cotação BRL pelo fator de câmbio', () => {
    expect(computeBtcQuoteUsd(410_329, 5.15)).toBeCloseTo(79_675.53398, 2);
    expect(computeBtcQuoteUsd(590_867, 5.54)).toBeCloseTo(106_654.693, 2);
  });

  it('retorna NaN para fator inválido', () => {
    expect(computeBtcQuoteUsd(100, 0)).toBeNaN();
    expect(computeBtcQuoteUsd(100, -1)).toBeNaN();
  });
});
