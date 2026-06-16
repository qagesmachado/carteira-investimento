import { formatQuantityForDisplay } from '$lib/features/portfolios/positionMetrics';
import { HIDDEN_QUANTITY_MASK, isMoneyHidden } from '$lib/moneyDisplay';

/** Ex.: `42 cotas` — mascarado quando ocultar valores está ativo. */
export function formatSharesAllocation(quantity: number | null | undefined): string {
  if (quantity == null || !Number.isFinite(quantity)) {
    return '—';
  }
  if (isMoneyHidden()) {
    return HIDDEN_QUANTITY_MASK;
  }
  return `${formatQuantityForDisplay(quantity)} cotas`;
}
