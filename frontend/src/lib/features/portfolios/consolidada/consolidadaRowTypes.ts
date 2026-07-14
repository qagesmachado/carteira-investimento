import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import type { computePositionProfit } from '$lib/features/portfolios/positionMetrics';

export type ConsolidadaRow = {
  position: Position;
  asset: Asset;
  invested: number | null;
  current: number | null;
  profit: ReturnType<typeof computePositionProfit>;
  investedBrl: number | null;
  currentBrl: number | null;
};

export type ConsolidadaSortKey =
  | 'ticker'
  | 'name'
  | 'asset_type'
  | 'display_class'
  | 'currency'
  | 'quantity'
  | 'invested'
  | 'current'
  | 'profit';
