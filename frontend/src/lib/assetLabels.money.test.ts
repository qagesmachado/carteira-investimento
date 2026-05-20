import { describe, expect, it } from 'vitest';

import { formatMoneyAmount } from './assetLabels';

describe('formatMoneyAmount', () => {
  it('formata BRL', () => {
    const formatted = formatMoneyAmount(30.51, 'BRL');
    expect(formatted).toContain('30,51');
    expect(formatted).toMatch(/R\$/);
  });

  it('formata USD', () => {
    const formatted = formatMoneyAmount(602.25, 'USD');
    expect(formatted).toContain('602,25');
    expect(formatted).toMatch(/US\$|USD/);
  });

  it('usa fallback com código para moeda menos comum', () => {
    expect(formatMoneyAmount(10, 'CHF')).toBe('10,00 CHF');
  });
});
