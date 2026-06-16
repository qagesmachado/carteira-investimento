import type { AssetDivergence } from '$lib/api/objetivos';
import { HIDDEN_MONEY_BRL, HIDDEN_QUANTITY_MASK, isMoneyHidden } from '$lib/moneyDisplay';

export function isAssetBlocked(divergences: AssetDivergence[], assetId: number): boolean {
  return divergences.some((d) => d.asset_id === assetId && d.status === 'over_total');
}

export function formatDivergenceMessage(divergence: AssetDivergence): string {
  const absDelta = Math.abs(divergence.delta);
  if (divergence.split_mode === 'amount') {
    const sign = divergence.delta < 0 ? 'removidos' : 'adicionados';
    if (isMoneyHidden()) {
      return `${HIDDEN_MONEY_BRL} ${sign}`;
    }
    return `R$ ${absDelta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${sign}`;
  }
  if (isMoneyHidden()) {
    return HIDDEN_QUANTITY_MASK;
  }
  const sign = divergence.delta < 0 ? 'removidas' : 'adicionadas';
  const label = absDelta === 1 ? 'cota' : 'cotas';
  return `${absDelta.toLocaleString('pt-BR')} ${label} ${sign}`;
}

export function explicitAllocatedForAsset(
  divergences: AssetDivergence[],
  assetId: number
): number {
  return divergences.find((d) => d.asset_id === assetId)?.allocated_explicit ?? 0;
}

export function totalForAsset(divergences: AssetDivergence[], assetId: number): number | null {
  const row = divergences.find((d) => d.asset_id === assetId);
  return row?.total ?? null;
}
