export type ProventoAmountFields = {
  amount: number;
  gross_amount?: number | null;
  tax_withheld?: number | null;
};

export function resolveGrossAmount(payment: ProventoAmountFields): number {
  return payment.gross_amount ?? payment.amount;
}

export function resolveTaxWithheld(payment: ProventoAmountFields): number {
  return payment.tax_withheld ?? 0;
}

export function computeNetAmount(grossAmount: number, taxWithheld: number): number {
  return grossAmount - taxWithheld;
}

export function normalizeProventoAmounts(
  grossAmount: number,
  taxWithheld: number
): { gross_amount: number; tax_withheld: number; amount: number } {
  const amount = computeNetAmount(grossAmount, taxWithheld);
  return {
    gross_amount: grossAmount,
    tax_withheld: taxWithheld,
    amount
  };
}
