import type { CryptoFeeType } from '$lib/api/cryptoFees';
import { formatBtcDecimalDisplay } from '$lib/brDecimal';
import { HIDDEN_QUANTITY_MASK, isMoneyHidden } from '$lib/moneyDisplay';

export const cryptoFeeTypeOptions: { value: CryptoFeeType; label: string }[] = [
  { value: 'purchase', label: 'Taxa de compra' },
  { value: 'transfer', label: 'Taxa transferência para Ledger' }
];

export function formatCryptoFeeTypeForDisplay(type: CryptoFeeType): string {
  return cryptoFeeTypeOptions.find((option) => option.value === type)?.label ?? type;
}

/** Rótulo curto para colunas compactas da tabela. */
export function formatCryptoFeeTypeShort(type: CryptoFeeType): string {
  switch (type) {
    case 'purchase':
      return 'Compra';
    case 'transfer':
      return 'Ledger';
    default:
      return type;
  }
}

export function formatBtcQuantity(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (isMoneyHidden()) {
    return HIDDEN_QUANTITY_MASK;
  }
  return formatBtcDecimalDisplay(value);
}

export function formatFeePercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}%`;
}
