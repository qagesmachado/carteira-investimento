import type { CryptoFee, CryptoFeeType } from '$lib/api/cryptoFees';

export function filterCryptoFeesByType(
  fees: CryptoFee[],
  feeType: '' | CryptoFeeType
): CryptoFee[] {
  if (!feeType) {
    return fees;
  }
  return fees.filter((fee) => fee.fee_type === feeType);
}
