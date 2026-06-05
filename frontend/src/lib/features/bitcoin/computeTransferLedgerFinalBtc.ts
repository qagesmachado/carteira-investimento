import type { CryptoFee } from '$lib/api/cryptoFees';

export function computeTransferLedgerFinalBtc(fees: CryptoFee[]): {
  totalBtc: number;
  count: number;
} {
  const transferFees = fees.filter((fee) => fee.fee_type === 'transfer');
  const totalBtc = transferFees.reduce((sum, fee) => sum + fee.final_quantity_after_fee, 0);
  return { totalBtc, count: transferFees.length };
}
