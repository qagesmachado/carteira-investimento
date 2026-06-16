import { afterEach, describe, expect, it } from 'vitest';

import { HIDDEN_QUANTITY_MASK } from '$lib/moneyDisplay';
import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import { formatSharesAllocation } from './formatSharesAllocation';

describe('formatSharesAllocation', () => {
  afterEach(() => {
    setHideMoneyValues(false);
  });

  it('formata quantidade com sufixo cotas', () => {
    expect(formatSharesAllocation(7)).toBe('7 cotas');
    expect(formatSharesAllocation(184)).toBe('184 cotas');
  });

  it('mascara quando ocultar valores está ativo', () => {
    setHideMoneyValues(true);
    expect(formatSharesAllocation(42)).toBe(HIDDEN_QUANTITY_MASK);
  });

  it('retorna traço para valor ausente', () => {
    expect(formatSharesAllocation(null)).toBe('—');
    expect(formatSharesAllocation(undefined)).toBe('—');
  });
});
