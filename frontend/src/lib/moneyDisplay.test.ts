import { describe, expect, it } from 'vitest';

import { hiddenMoneyForCurrency, HIDDEN_MONEY_BRL } from './moneyDisplay';

describe('moneyDisplay', () => {
  it('retorna máscara por moeda', () => {
    expect(HIDDEN_MONEY_BRL).toBe('R$ ••••••');
    expect(hiddenMoneyForCurrency('USD')).toBe('US$ ••••••');
    expect(hiddenMoneyForCurrency('chf')).toBe('CHF ••••••');
  });
});
