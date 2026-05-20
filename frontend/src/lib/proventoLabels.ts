import type { AssetMarket } from '$lib/api/assets';

export type DividendPaymentType =
  | 'dividend'
  | 'jcp'
  | 'credit'
  | 'fraction'
  | 'redemption'
  | 'other';

const PAYMENT_TYPE_LABELS: Record<DividendPaymentType, string> = {
  dividend: 'Dividendo',
  jcp: 'JCP',
  credit: 'Crédito',
  fraction: 'Fração',
  redemption: 'Resgate',
  other: 'Outro'
};

const MARKET_LABELS: Record<AssetMarket, string> = {
  national: 'Nacional',
  international: 'Internacional'
};

export function formatPaymentTypeForDisplay(type: DividendPaymentType | string): string {
  return PAYMENT_TYPE_LABELS[type as DividendPaymentType] ?? type;
}

export function formatMarketForDisplay(market: AssetMarket | string): string {
  return MARKET_LABELS[market as AssetMarket] ?? market;
}

export function paymentTypeOptions(): { value: DividendPaymentType; label: string }[] {
  return (Object.keys(PAYMENT_TYPE_LABELS) as DividendPaymentType[]).map((value) => ({
    value,
    label: PAYMENT_TYPE_LABELS[value]
  }));
}

export function marketFilterOptions(): { value: '' | AssetMarket; label: string }[] {
  return [
    { value: '', label: 'Todos os mercados' },
    { value: 'national', label: MARKET_LABELS.national },
    { value: 'international', label: MARKET_LABELS.international }
  ];
}
