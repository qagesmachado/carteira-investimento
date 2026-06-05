import { describe, expect, it, afterEach, beforeEach } from 'vitest';

import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import { formatMoneyAmount } from './assetLabels';

describe('formatMoneyAmount', () => {
  beforeEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  afterEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

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

  it('mascara valores quando ocultar valores está ativo', () => {
    setHideMoneyValues(true);
    expect(formatMoneyAmount(602.25, 'USD')).toBe('US$ ••••••');
    expect(formatMoneyAmount(30.51, 'BRL')).toBe('R$ ••••••');
  });
});
