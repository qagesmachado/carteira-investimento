import type { StocksSplitMode } from './allocationTargets';
import { STOCKS_SPLIT_MODE_OPTIONS } from './allocationTargets';

export function stocksSplitModeLabel(mode: StocksSplitMode): string {
  return STOCKS_SPLIT_MODE_OPTIONS.find((option) => option.mode === mode)?.title ?? mode;
}

export function stocksSplitModeConfirmMessage(
  currentMode: StocksSplitMode,
  nextMode: StocksSplitMode
): string {
  const next = STOCKS_SPLIT_MODE_OPTIONS.find((option) => option.mode === nextMode);
  if (!next) {
    return 'Alterar a forma de gerenciar ETF/Ação?';
  }
  if (currentMode === nextMode) {
    return '';
  }
  return `Alterar para «${next.title}»?\n\n${next.description}`;
}
