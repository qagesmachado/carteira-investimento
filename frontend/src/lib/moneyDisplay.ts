import { get } from 'svelte/store';

import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

export const HIDDEN_MONEY_MASK = '••••••';
export const HIDDEN_MONEY_BRL = 'R$ ••••••';
/** Quantidades de ativos (ex.: BTC) quando valores estão ocultos. */
export const HIDDEN_QUANTITY_MASK = '••••••';

const HIDDEN_BY_CURRENCY: Record<string, string> = {
  BRL: HIDDEN_MONEY_BRL,
  USD: 'US$ ••••••',
  EUR: '€ ••••••',
  GBP: '£ ••••••'
};

export function hiddenMoneyForCurrency(currencyCode: string): string {
  const code = currencyCode.trim().toUpperCase();
  return HIDDEN_BY_CURRENCY[code] ?? `${code} ••••••`;
}

export function isMoneyHidden(): boolean {
  return get(hideMoneyValues);
}
