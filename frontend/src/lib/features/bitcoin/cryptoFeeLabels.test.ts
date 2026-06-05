import { describe, expect, it, afterEach, beforeEach } from 'vitest';

import { HIDDEN_QUANTITY_MASK } from '$lib/moneyDisplay';
import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import { formatCryptoFeeTypeForDisplay, formatCryptoFeeTypeShort, formatBtcQuantity } from './cryptoFeeLabels';

describe('cryptoFeeLabels', () => {
  it('formata tipo de taxa em português', () => {
    expect(formatCryptoFeeTypeForDisplay('purchase')).toBe('Taxa de compra');
    expect(formatCryptoFeeTypeForDisplay('transfer')).toBe('Taxa transferência para Ledger');
  });

  it('formata tipo de taxa em rótulo curto para tabela', () => {
    expect(formatCryptoFeeTypeShort('purchase')).toBe('Compra');
    expect(formatCryptoFeeTypeShort('transfer')).toBe('Ledger');
  });

  it('formata quantidade BTC com 8 casas decimais', () => {
    expect(formatBtcQuantity(0.00083916)).toBe('0,00083916');
    expect(formatBtcQuantity(0.00003)).toBe('0,00003000');
    expect(formatBtcQuantity(0.0037087)).toBe('0,00370870');
  });

  describe('com ocultar valores ativo', () => {
    beforeEach(() => {
      localStorage.clear();
      setHideMoneyValues(true);
    });

    afterEach(() => {
      localStorage.clear();
      setHideMoneyValues(false);
    });

    it('mascara quantidade BTC', () => {
      expect(formatBtcQuantity(0.00083916)).toBe(HIDDEN_QUANTITY_MASK);
    });
  });
});
