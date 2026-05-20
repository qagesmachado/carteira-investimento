import type { DividendPaymentType } from '$lib/proventoLabels';

const TYPE_ALIASES: Record<string, DividendPaymentType> = {
  dividend: 'dividend',
  dividendo: 'dividend',
  dividendos: 'dividend',
  jcp: 'jcp',
  'juros sobre capital proprio': 'jcp',
  credit: 'credit',
  credito: 'credit',
  crédito: 'credit',
  fraction: 'fraction',
  fracao: 'fraction',
  fração: 'fraction',
  redemption: 'redemption',
  resgate: 'redemption',
  other: 'other',
  outro: 'other',
  outros: 'other'
};

function normalizeTypeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function parsePaymentType(raw: string | null | undefined): DividendPaymentType {
  const key = normalizeTypeKey(raw ?? '');
  if (!key) {
    return 'dividend';
  }
  return TYPE_ALIASES[key] ?? 'other';
}
