import { describe, expect, it } from 'vitest';

import { parsePaymentType } from './parsePaymentType';

describe('parsePaymentType', () => {
  it('mapeia tipos em português e inglês', () => {
    expect(parsePaymentType('dividend')).toBe('dividend');
    expect(parsePaymentType('Dividendo')).toBe('dividend');
    expect(parsePaymentType('JCP')).toBe('jcp');
    expect(parsePaymentType('Crédito')).toBe('credit');
    expect(parsePaymentType('')).toBe('dividend');
    expect(parsePaymentType('desconhecido')).toBe('other');
  });
});
