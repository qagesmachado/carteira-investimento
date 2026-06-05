import type { CryptoFee } from '$lib/api/cryptoFees';

import { computeBtcQuoteUsd } from './computeBtcQuoteUsd';

export type CryptoFeeSortKey =
  | 'fee_date'
  | 'fee_type'
  | 'quantity_moved'
  | 'fee_quantity_btc'
  | 'final_quantity_after_fee'
  | 'fee_value_brl'
  | 'fee_value_usd'
  | 'quote_brl'
  | 'quote_usd'
  | 'fee_percent';

export type SortDirection = 'asc' | 'desc';

export function sortCryptoFees(
  fees: CryptoFee[],
  key: CryptoFeeSortKey,
  direction: SortDirection
): CryptoFee[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...fees].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'fee_date':
        cmp = a.fee_date.localeCompare(b.fee_date);
        break;
      case 'fee_type':
        cmp = a.fee_type.localeCompare(b.fee_type);
        break;
      case 'quantity_moved':
        cmp = a.quantity_moved - b.quantity_moved;
        break;
      case 'fee_quantity_btc':
        cmp = a.fee_quantity_btc - b.fee_quantity_btc;
        break;
      case 'final_quantity_after_fee':
        cmp = a.final_quantity_after_fee - b.final_quantity_after_fee;
        break;
      case 'fee_value_brl':
        cmp = a.fee_value_brl - b.fee_value_brl;
        break;
      case 'fee_value_usd':
        cmp = a.fee_value_usd - b.fee_value_usd;
        break;
      case 'quote_brl':
        cmp = a.quote_brl - b.quote_brl;
        break;
      case 'quote_usd':
        cmp =
          computeBtcQuoteUsd(a.quote_brl, a.fx_rate) - computeBtcQuoteUsd(b.quote_brl, b.fx_rate);
        break;
      case 'fee_percent':
        cmp = a.fee_percent - b.fee_percent;
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0 && key !== 'fee_date') {
      cmp = b.fee_date.localeCompare(a.fee_date);
    }
    return cmp * factor;
  });
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}
