export type PriceLot = {
  quantity: number;
  averagePrice: number;
};

export type WeightedAverageResult = {
  totalQuantity: number;
  averagePrice: number;
  totalInvested: number;
};

export type WeightedAverageError = 'invalid_quantity' | 'invalid_price' | 'zero_total_quantity';

export type WeightedAverageOutcome =
  | { success: true; result: WeightedAverageResult }
  | { success: false; error: WeightedAverageError };

function isValidLot(lot: PriceLot): WeightedAverageError | null {
  if (!Number.isFinite(lot.quantity) || lot.quantity <= 0) {
    return 'invalid_quantity';
  }
  if (!Number.isFinite(lot.averagePrice) || lot.averagePrice < 0) {
    return 'invalid_price';
  }
  return null;
}

export function computeWeightedAveragePrice(
  lot1: PriceLot,
  lot2: PriceLot
): WeightedAverageOutcome {
  const lot1Error = isValidLot(lot1);
  if (lot1Error) {
    return { success: false, error: lot1Error };
  }
  const lot2Error = isValidLot(lot2);
  if (lot2Error) {
    return { success: false, error: lot2Error };
  }

  const totalQuantity = lot1.quantity + lot2.quantity;
  if (totalQuantity <= 0) {
    return { success: false, error: 'zero_total_quantity' };
  }

  const totalInvested = lot1.quantity * lot1.averagePrice + lot2.quantity * lot2.averagePrice;
  const averagePrice = totalInvested / totalQuantity;

  return {
    success: true,
    result: { totalQuantity, averagePrice, totalInvested }
  };
}

export function weightedAverageErrorMessage(error: WeightedAverageError): string {
  switch (error) {
    case 'invalid_quantity':
      return 'Informe quantidades maiores que zero em ambos os lotes.';
    case 'invalid_price':
      return 'Informe preços médios válidos (zero ou positivos) em ambos os lotes.';
    case 'zero_total_quantity':
      return 'A quantidade total deve ser maior que zero.';
    default:
      return 'Dados inválidos para o cálculo.';
  }
}
